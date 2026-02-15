"""
FastAPI proxy server that starts and proxies to Node.js Express backend.
This allows the Node.js backend to work within Emergent's Python-based infrastructure.
"""
import subprocess
import os
import asyncio
import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
        stderr=subprocess.STDOUT
    )
    print(f"Started Node.js server on port {NODE_PORT}, PID: {node_process.pid}")
    
    # Start a thread to read and log Node.js output
    import threading
    def log_output():
        for line in iter(node_process.stdout.readline, b''):
            print(f"[Node.js] {line.decode().strip()}")
    
    threading.Thread(target=log_output, daemon=True).start()

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
    await asyncio.sleep(3)
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

# HTTP client for proxying with longer timeout
http_client = httpx.AsyncClient(timeout=60.0)

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_api(request: Request, path: str):
    """Proxy all /api/* requests to Node.js backend"""
    url = f"{NODE_URL}/api/{path}"
    
    # Get request body
    body = await request.body()
    
    # Forward headers
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ['host', 'content-length']:
            headers[key] = value
    
    # Get cookies as string
    cookie_header = request.headers.get('cookie', '')
    if cookie_header:
        headers['cookie'] = cookie_header
    
    try:
        response = await http_client.request(
            method=request.method,
            url=url,
            content=body,
            headers=headers,
            params=request.query_params
        )
        
        # Build response headers
        response_headers = {}
        for key, value in response.headers.items():
            if key.lower() not in ['content-encoding', 'content-length', 'transfer-encoding']:
                response_headers[key] = value
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
            media_type=response.headers.get('content-type')
        )
    except httpx.ConnectError:
        return JSONResponse(
            status_code=503,
            content={"error": "Node.js backend not available", "detail": "Please wait for server to start"}
        )
    except Exception as e:
        print(f"Proxy error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/socket.io/{path:path}")
async def proxy_socket_get(request: Request, path: str):
    """Proxy Socket.IO GET requests"""
    query_string = str(request.query_params)
    url = f"{NODE_URL}/socket.io/{path}?{query_string}" if query_string else f"{NODE_URL}/socket.io/{path}"
    
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ['host']:
            headers[key] = value
    
    try:
        response = await http_client.request(
            method="GET",
            url=url,
            headers=headers
        )
        
        response_headers = {}
        for key, value in response.headers.items():
            if key.lower() not in ['content-encoding', 'transfer-encoding']:
                response_headers[key] = value
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers
        )
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": str(e)})

@app.get("/socket.io/")
async def proxy_socket_root(request: Request):
    """Proxy Socket.IO root GET requests"""
    query_string = str(request.query_params)
    url = f"{NODE_URL}/socket.io/?{query_string}" if query_string else f"{NODE_URL}/socket.io/"
    
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ['host']:
            headers[key] = value
    
    try:
        response = await http_client.request(
            method="GET",
            url=url,
            headers=headers
        )
        
        response_headers = {}
        for key, value in response.headers.items():
            if key.lower() not in ['content-encoding', 'transfer-encoding']:
                response_headers[key] = value
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers
        )
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": str(e)})

@app.post("/socket.io/{path:path}")
async def proxy_socket_post(request: Request, path: str):
    """Proxy Socket.IO POST requests"""
    url = f"{NODE_URL}/socket.io/{path}"
    body = await request.body()
    
    headers = {}
    for key, value in request.headers.items():
        if key.lower() not in ['host', 'content-length']:
            headers[key] = value
    
    try:
        response = await http_client.request(
            method="POST",
            url=url,
            content=body,
            headers=headers,
            params=request.query_params
        )
        
        response_headers = {}
        for key, value in response.headers.items():
            if key.lower() not in ['content-encoding', 'transfer-encoding']:
                response_headers[key] = value
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers
        )
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": str(e)})

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Proxy server running", "node_port": NODE_PORT}

@app.get("/health")
async def health():
    """Health check"""
    try:
        response = await http_client.get(f"{NODE_URL}/api/health", timeout=5.0)
        return {"proxy": "ok", "nodejs": response.json()}
    except:
        return {"proxy": "ok", "nodejs": "starting"}
