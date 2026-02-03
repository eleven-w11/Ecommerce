from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
import socketio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

# Create the main FastAPI app
fastapi_app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Track online users: {user_id: {socket_id, role, last_seen}}
online_users = {}

# ==================== MODELS ====================

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(alias="_id")
    name: str
    email: str
    image: Optional[str] = None
    role: str = "user"

class MessageCreate(BaseModel):
    message: str
    to_user_id: Optional[str] = None

class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(alias="_id")
    from_user_id: str
    to_user_id: Optional[str] = None
    sender_role: str
    message: str
    status: str = "sent"
    timestamp: str

class UserWithLastMessage(BaseModel):
    id: str
    name: str
    email: str
    image: Optional[str] = None
    is_online: bool = False
    last_message: Optional[str] = None
    last_message_time: Optional[str] = None
    unread_count: int = 0

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str = "user") -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(request: Request):
    token = request.cookies.get("token") or request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(token)
    user = await db.users.find_one({"_id": payload["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/signup")
async def signup(user: UserCreate, response: Response):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "image": None,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, "user")
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=86400 * 7
    )
    
    return {"success": True, "user_id": user_id, "token": token}

@api_router.post("/auth/login")
async def login(user: UserLogin, response: Response):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(db_user["_id"], db_user.get("role", "user"))
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=86400 * 7
    )
    
    return {
        "success": True,
        "user_id": db_user["_id"],
        "token": token,
        "role": db_user.get("role", "user")
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="token")
    return {"success": True, "message": "Logged out"}

@api_router.get("/auth/verify")
async def verify_token(request: Request):
    try:
        user = await get_current_user(request)
        return {
            "success": True,
            "user_id": user["_id"],
            "role": user.get("role", "user")
        }
    except HTTPException:
        return {"success": False}

@api_router.get("/user/profile")
async def get_profile(request: Request):
    user = await get_current_user(request)
    return {
        "_id": user["_id"],
        "name": user["name"],
        "email": user["email"],
        "image": user.get("image"),
        "role": user.get("role", "user"),
        "isAdmin": user.get("role") == "admin"
    }

# ==================== CHAT ROUTES ====================

@api_router.get("/messages/chat/history/{user_id}")
async def get_chat_history(user_id: str, request: Request):
    """Get chat history for a user (messages between user and admin)"""
    # Verify user is authenticated
    current_user = await get_current_user(request)
    # User can only access their own chat history (unless admin)
    if current_user["_id"] != user_id and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    messages = await db.messages.find({
        "$or": [
            {"from_user_id": user_id},
            {"to_user_id": user_id}
        ]
    }).sort("timestamp", 1).to_list(1000)
    
    # Convert to response format
    result = []
    for msg in messages:
        result.append({
            "_id": msg["_id"],
            "message": msg["message"],
            "fromUserId": msg["from_user_id"],
            "toUserId": msg.get("to_user_id"),
            "senderRole": msg["sender_role"],
            "fromAdmin": msg["sender_role"] == "admin",
            "status": msg.get("status", "sent"),
            "timestamp": msg["timestamp"]
        })
    
    return {"success": True, "messages": result}

@api_router.get("/admin/chat/{user_id}")
async def get_admin_chat(user_id: str, request: Request):
    """Get chat history for admin to view a specific user's messages"""
    current_user = await get_current_user(request)
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    messages = await db.messages.find({
        "$or": [
            {"from_user_id": user_id},
            {"to_user_id": user_id}
        ]
    }).sort("timestamp", 1).to_list(1000)
    
    result = []
    for msg in messages:
        result.append({
            "_id": msg["_id"],
            "message": msg["message"],
            "fromUserId": msg["from_user_id"],
            "toUserId": msg.get("to_user_id"),
            "senderRole": msg["sender_role"],
            "status": msg.get("status", "sent"),
            "timestamp": msg["timestamp"]
        })
    
    return {"success": True, "messages": result}

@api_router.get("/admin/users-with-chats")
async def get_users_with_chats(request: Request):
    """Get all users who have sent messages, with their last message"""
    current_user = await get_current_user(request)
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get unique user IDs from messages
    pipeline = [
        {"$match": {"sender_role": "user"}},
        {"$group": {"_id": "$from_user_id"}},
    ]
    user_ids_result = await db.messages.aggregate(pipeline).to_list(1000)
    user_ids = [r["_id"] for r in user_ids_result]
    
    users_with_messages = []
    for user_id in user_ids:
        user = await db.users.find_one({"_id": user_id})
        if not user:
            continue
        
        # Get last message
        last_msg = await db.messages.find_one(
            {"$or": [{"from_user_id": user_id}, {"to_user_id": user_id}]},
            sort=[("timestamp", -1)]
        )
        
        users_with_messages.append({
            "_id": user_id,
            "name": user.get("name", "Unknown"),
            "email": user.get("email", ""),
            "image": user.get("image"),
            "isOnline": user_id in online_users,
            "lastMessage": last_msg["message"] if last_msg else None,
            "lastMessageTime": last_msg["timestamp"] if last_msg else None
        })
    
    # Sort by last message time
    users_with_messages.sort(key=lambda x: x["lastMessageTime"] or "", reverse=True)
    
    return {"success": True, "users": users_with_messages}

@api_router.get("/admin/user/{user_id}")
async def get_user_by_id(user_id: str, request: Request):
    """Get user details by ID"""
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "_id": user["_id"],
        "name": user.get("name", "Unknown"),
        "email": user.get("email", ""),
        "image": user.get("image"),
        "profileImage": user.get("image")
    }

@api_router.get("/")
async def root():
    return {"message": "Chat API Running"}

# ==================== SOCKET.IO EVENTS ====================

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    # Find and remove user from online users
    user_to_remove = None
    for user_id, data in list(online_users.items()):
        if data.get("socket_id") == sid:
            user_to_remove = user_id
            break
    
    if user_to_remove:
        del online_users[user_to_remove]
        # Broadcast offline status
        await sio.emit("userOffline", {"userId": user_to_remove})
        logger.info(f"User {user_to_remove} went offline")
    
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def register(sid, data):
    """Register user/admin and track online status"""
    user_id = data.get("userId")
    role = data.get("role", "user")
    
    if not user_id:
        return
    
    # Join personal room
    await sio.enter_room(sid, user_id)
    
    # Track online status
    online_users[user_id] = {
        "socket_id": sid,
        "role": role,
        "last_seen": datetime.now(timezone.utc).isoformat()
    }
    
    # Broadcast online status
    await sio.emit("userOnline", {"userId": user_id, "role": role})
    
    logger.info(f"{role} ({user_id}) registered with socket {sid}")

@sio.event
async def getUsers(sid):
    """Admin requests list of users with messages"""
    # Get unique user IDs from messages
    pipeline = [
        {"$match": {"sender_role": "user"}},
        {"$group": {"_id": "$from_user_id"}},
    ]
    user_ids_result = await db.messages.aggregate(pipeline).to_list(1000)
    user_ids = [r["_id"] for r in user_ids_result]
    
    users_with_messages = []
    for user_id in user_ids:
        user = await db.users.find_one({"_id": user_id})
        if not user:
            continue
        
        # Get last message
        last_msg = await db.messages.find_one(
            {"$or": [{"from_user_id": user_id}, {"to_user_id": user_id}]},
            sort=[("timestamp", -1)]
        )
        
        users_with_messages.append({
            "_id": user_id,
            "name": user.get("name", "Unknown"),
            "email": user.get("email", ""),
            "image": user.get("image"),
            "isOnline": user_id in online_users,
            "lastMessage": last_msg["message"] if last_msg else None,
            "lastMessageTime": last_msg["timestamp"] if last_msg else None
        })
    
    # Sort by last message time
    users_with_messages.sort(key=lambda x: x["lastMessageTime"] or "", reverse=True)
    
    await sio.emit("usersList", users_with_messages, room=sid)

@sio.event
async def userMessage(sid, data):
    """User sends message to admin"""
    from_user_id = data.get("fromUserId")
    message_text = data.get("message")
    timestamp = data.get("timestamp") or datetime.now(timezone.utc).isoformat()
    
    if not from_user_id or not message_text:
        return
    
    # Save message to DB
    msg_id = str(uuid.uuid4())
    message_doc = {
        "_id": msg_id,
        "from_user_id": from_user_id,
        "to_user_id": None,  # Going to admin (no specific user)
        "sender_role": "user",
        "message": message_text,
        "status": "sent",
        "timestamp": timestamp
    }
    await db.messages.insert_one(message_doc)
    
    # Get user info
    user = await db.users.find_one({"_id": from_user_id})
    
    # Prepare response
    response = {
        "_id": msg_id,
        "message": message_text,
        "fromUserId": from_user_id,
        "toUserId": None,
        "senderRole": "user",
        "fromAdmin": False,
        "status": "sent",
        "timestamp": timestamp,
        "user": {
            "name": user.get("name", "New User") if user else "New User",
            "image": user.get("image") if user else None
        }
    }
    
    # Send acknowledgment to sender
    await sio.emit("messageSentAck", msg_id, room=sid)
    
    # Find admin(s) and send message
    admin_found = False
    for user_id, user_data in online_users.items():
        if user_data.get("role") == "admin":
            await sio.emit("receiveMessage", response, room=user_id)
            admin_found = True
            # Update status to delivered
            await db.messages.update_one({"_id": msg_id}, {"$set": {"status": "delivered"}})
            await sio.emit("messageDelivered", msg_id, room=from_user_id)
    
    if not admin_found:
        logger.info("No admin connected, message stored for later")

@sio.event
async def adminMessage(sid, data):
    """Admin sends message to user"""
    to_user_id = data.get("toUserId")
    message_text = data.get("message")
    timestamp = data.get("timestamp") or datetime.now(timezone.utc).isoformat()
    
    if not to_user_id or not message_text:
        return
    
    # Find admin's user_id from socket
    admin_id = None
    for user_id, user_data in online_users.items():
        if user_data.get("socket_id") == sid:
            admin_id = user_id
            break
    
    if not admin_id:
        admin_id = "admin"
    
    # Save message to DB
    msg_id = str(uuid.uuid4())
    message_doc = {
        "_id": msg_id,
        "from_user_id": admin_id,
        "to_user_id": to_user_id,
        "sender_role": "admin",
        "message": message_text,
        "status": "sent",
        "timestamp": timestamp
    }
    await db.messages.insert_one(message_doc)
    
    # Prepare response
    response = {
        "_id": msg_id,
        "message": message_text,
        "fromUserId": admin_id,
        "toUserId": to_user_id,
        "senderRole": "admin",
        "fromAdmin": True,
        "status": "sent",
        "timestamp": timestamp
    }
    
    # Send acknowledgment to admin
    await sio.emit("messageSentAck", msg_id, room=sid)
    
    # Send to user if online
    if to_user_id in online_users:
        await sio.emit("receiveMessage", response, room=to_user_id)
        # Update status to delivered
        await db.messages.update_one({"_id": msg_id}, {"$set": {"status": "delivered"}})
        await sio.emit("messageDelivered", msg_id, room=admin_id)
    else:
        logger.info(f"User {to_user_id} not online, message stored")

@sio.event
async def deliveredAck(sid, msg_id):
    """Message delivered acknowledgment"""
    await db.messages.update_one({"_id": msg_id}, {"$set": {"status": "delivered"}})
    await sio.emit("messageDelivered", msg_id)
    logger.info(f"Message {msg_id} delivered")

@sio.event
async def seenAck(sid, msg_id):
    """Message seen acknowledgment"""
    await db.messages.update_one({"_id": msg_id}, {"$set": {"status": "seen"}})
    await sio.emit("messageSeen", msg_id)
    logger.info(f"Message {msg_id} seen")

@sio.event
async def checkOnline(sid, data):
    """Check if a user is online"""
    user_id = data.get("userId")
    is_online = user_id in online_users
    await sio.emit("onlineStatus", {"userId": user_id, "isOnline": is_online}, room=sid)

@sio.event
async def getAdminStatus(sid):
    """Check if admin is online"""
    admin_online = any(u.get("role") == "admin" for u in online_users.values())
    await sio.emit("adminStatus", {"isOnline": admin_online}, room=sid)

# Include the router in the main app
fastapi_app.include_router(api_router)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@fastapi_app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Wrap FastAPI with Socket.IO
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path='/api/socket.io')
