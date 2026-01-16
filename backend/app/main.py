from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import system, n8n, websocket, processes
from app.api.routes import router as api_router
from app.services.history_manager import history_manager
from app.services import system_monitor
import os
from dotenv import load_dotenv
import asyncio

load_dotenv()

app = FastAPI(
    title="Pi Monitor API",
    description="Raspberry Pi Resource Monitoring API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
app.include_router(websocket.router, prefix="/ws")

@app.get("/")
def read_root():
    return {"status": "online", "service": "Pi Monitor API"}

async def store_metrics_task():
    """Background task to store metrics every 30 seconds"""
    while True:
        try:
            stats = system_monitor.get_system_stats()
            # Handle case where stats might return nested structure depending on implementation
            # Based on previous implementation:
            # { "cpu": X, "ram": { "percent": Y }, "disk": { "percent": Z }, "temperature": T }
            
            cpu = stats.get('cpu', 0)
            ram = stats.get('ram', {}).get('percent', 0)
            disk = stats.get('disk', {}).get('percent', 0)
            temp = stats.get('temperature', 0)

            history_manager.store_metrics(
                cpu=float(cpu),
                memory=float(ram),
                disk=float(disk),
                temperature=float(temp)
            )
        except Exception as e:
            print(f"Error storing metrics: {e}")
        
        await asyncio.sleep(30)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(store_metrics_task())
