"""
Seed script to create admin user and test user
Run: python seed_data.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import uuid
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_data():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Create admin user
    admin_email = "admin@chat.com"
    admin_exists = await db.users.find_one({"email": admin_email})
    
    if not admin_exists:
        admin_id = str(uuid.uuid4())
        admin_doc = {
            "_id": admin_id,
            "name": "Admin",
            "email": admin_email,
            "password": hash_password("admin123"),
            "image": None,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_doc)
        print(f"✅ Admin user created: {admin_email} / admin123")
    else:
        print(f"ℹ️ Admin user already exists: {admin_email}")
    
    # Create test user
    test_email = "user@chat.com"
    test_exists = await db.users.find_one({"email": test_email})
    
    if not test_exists:
        user_id = str(uuid.uuid4())
        user_doc = {
            "_id": user_id,
            "name": "Test User",
            "email": test_email,
            "password": hash_password("user123"),
            "image": None,
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        print(f"✅ Test user created: {test_email} / user123")
    else:
        print(f"ℹ️ Test user already exists: {test_email}")
    
    client.close()
    print("\n🎉 Seed completed!")
    print("\nTest Credentials:")
    print("  Admin: admin@chat.com / admin123")
    print("  User:  user@chat.com / user123")

if __name__ == "__main__":
    asyncio.run(seed_data())
