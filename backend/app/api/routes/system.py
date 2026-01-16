from fastapi import APIRouter, HTTPException
from app.services import system_monitor
from app.services.history_manager import history_manager

router = APIRouter()

@router.get("/stats")
def get_stats():
    return system_monitor.get_system_stats()

@router.get("/info")
def get_info():
    return system_monitor.get_system_info()

@router.get("/processes")
def get_processes():
    return system_monitor.get_processes()

@router.post("/processes/{pid}/kill")
def kill_process(pid: int):
    success = system_monitor.kill_process(pid)
    if not success:
        raise HTTPException(status_code=404, detail="Process not found")
    return {"status": "success", "message": f"Process {pid} terminated"}

@router.get("/history")
async def get_history(hours: int = 24):
    """Get historical system metrics"""
    history = history_manager.get_history(hours=hours)
    return {"data": history, "count": len(history)}
