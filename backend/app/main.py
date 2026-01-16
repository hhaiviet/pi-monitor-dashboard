from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from datetime import datetime
from app.api.routes import system, n8n, processes, websocket
from app.services.system_monitor import system_monitor
from app.services.history_manager import history_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting background tasks...")
    
    # Create background task for storing metrics
    async def store_metrics_loop():
        """Store system metrics every 30 seconds"""
        while True:
            try:
                stats = system_monitor.get_stats()
                success = history_manager.store_metrics(
                    cpu=stats['cpu']['percent'],
                    memory=stats['memory']['percent'],
                    disk=stats['disk']['percent'],
                    temperature=stats.get('temperature', 0)
                )
                if success:
                    print(f"✅ Metrics stored at {datetime.now()}")
                else:
                    print("⚠️ Failed to store metrics")
            except Exception as e:
                print(f"❌ Error storing metrics: {e}")
            
            await asyncio.sleep(30)
    
    # Start the task
    task = asyncio.create_task(store_metrics_loop())
    
    yield
    
    # Shutdown
    print("🛑 Stopping background tasks...")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="Pi Monitor API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(system.router, prefix="/api/system", tags=["System"])
app.include_router(n8n.router, prefix="/api/n8n", tags=["n8n"])
app.include_router(processes.router, prefix="/api/processes", tags=["Processes"])
app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])

@app.get("/")
async def root():
    return {"message": "Pi Monitor API Running"}
