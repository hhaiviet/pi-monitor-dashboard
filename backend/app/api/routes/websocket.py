from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.system_monitor import system_monitor
import asyncio
import json

router = APIRouter()

@router.websocket("/system")
async def websocket_endpoint(websocket: WebSocket):
    # Log connection attempt
    print(f"🔌 WebSocket connection attempt from {websocket.client}")
    # We can accept any origin for this simple dashboard
    await websocket.accept()
    print(f"✅ WebSocket connection accepted")
    
    try:
        while True:
            # Use the new get_stats method from the refactored system_monitor
            stats = system_monitor.get_stats()
            # Ensure stats is serializable
            await websocket.send_text(json.dumps(stats))
            await asyncio.sleep(2) # Update every 2 seconds
    except WebSocketDisconnect:
        print("📴 WebSocket client disconnected")
    except Exception as e:
        print(f"❌ WebSocket Error: {e}")
        try:
            await websocket.close()
        except:
            pass
