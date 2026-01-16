from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services import system_monitor
import asyncio
import json

router = APIRouter()

@router.websocket("/system")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = system_monitor.get_system_stats()
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(2) # Update every 2 seconds
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()
