from fastapi import APIRouter, HTTPException
from app.services.process_manager import process_manager

router = APIRouter()

@router.get("")
async def get_processes(sort_by: str = "cpu", limit: int = 50):
    """Get list of running processes"""
    processes = process_manager.get_processes(sort_by=sort_by, limit=limit)
    return {"processes": processes, "count": len(processes)}

@router.delete("/{pid}")
async def kill_process(pid: int, force: bool = False):
    """Kill a process by PID"""
    result = process_manager.kill_process(pid, force=force)
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    
    return result
