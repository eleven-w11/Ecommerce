"""
FastAPI proxy server that starts and proxies to Node.js Express backend.
This allows the Node.js backend to work within Emergent's Python-based infrastructure.
"""
import subprocess
import os
import signal
import sys
import asyncio
import httpx
from fastapi import FastAPI, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import socketio
from contextlib import asynccontextmanager

# Node.js backend runs on this internal port
NODE_PORT = 5000
NODE_URL = f"http://localhost:{NODE_PORT}"

# Global process reference
node_process = None

def start_node_server():
    """Start the Node.js server as a subprocess"""
    global node_process
    env = os.environ.copy()
    env['PORT'] = str(NODE_PORT)
    
    # Read backend .env file and add to environment
    env_file = '/app/backend/.env'
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env[key] = value
    
    node_process = subprocess.Popen(
        ['node', 'server.js'],
        cwd='/app/backend',
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    print(f"Started Node.js server on port {NODE_PORT}, PID: {node_process.pid}")

def stop_node_server():
    """Stop the Node.js server"""
    global node_process
    if node_process:
        node_process.terminate()
        try:
            node_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            node_process.kill()
        print("Node.js server stopped")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage Node.js server lifecycle"""
    start_node_server()
    # Give Node.js time to start
    await asyncio.sleep(2)
    yield
    stop_node_server()

# Create FastAPI app
app = FastAPI(lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Socket.IO server that proxies to Node.js Socket.IO
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)
socket_app = socketio.ASGIApp(sio, app)

# HTTP client for proxying
http_client = httpx.AsyncClient(timeout=30.0)

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_api(request: Request, path: str):
    """Proxy all /api/* requests to Node.js backend"""
    url = f"{NODE_URL}/api/{path}"
    
    # Get request body
    body = await request.body()
    
    # Forward headers (excluding host)
    headers = dict(request.headers)
    headers.pop('host', None)
    
    # Get cookies
    cookies = request.cookies
    
    try:
        response = await http_client.request(
            method=request.method,
            url=url,
            content=body,
            headers=headers,
            cookies=cookies,
            params=request.query_params
        )
        
        # Build response headers, excluding certain ones
        response_headers = dict(response.headers)
        for key in ['content-encoding', 'content-length', 'transfer-encoding']:
            response_headers.pop(key, None)
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers
        )
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={"error": "Node.js backend not available"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Proxy server running"}

# Socket.IO event handlers - these will be forwarded to Node.js
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def register(sid, data):
    """Forward register event"""
    await sio.emit('registered', {'sid': sid}, to=sid)

@sio.event
async def message(sid, data):
    """Forward message events"""
    await sio.emit('message', data)

# For static files
@app.get("/{path:path}")
async def proxy_static(request: Request, path: str):
    """Proxy static files and other routes to Node.js"""
    url = f"{NODE_URL}/{path}"
    
    try:
        response = await http_client.request(
            method=request.method,
            url=url,
            headers=dict(request.headers),
            params=request.query_params
        )
        
        response_headers = dict(response.headers)
        for key in ['content-encoding', 'content-length', 'transfer-encoding']:
            response_headers.pop(key, None)
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers
        )
    except:
        return JSONResponse(status_code=404, content={"error": "Not found"})
