from fastapi import APIRouter, HTTPException
from app.services.n8n_manager import n8n_manager

router = APIRouter()

@router.get("/status")
async def get_n8n_status():
    """Get n8n service status"""
    return n8n_manager.get_status()

@router.get("/workflows")
async def get_workflows():
    """List all workflows"""
    workflows = n8n_manager.get_workflows()
    return {"workflows": workflows, "count": len(workflows)}

@router.post("/workflows/{workflow_id}/activate")
async def activate_workflow(workflow_id: str):
    """Activate a workflow"""
    result = n8n_manager.activate_workflow(workflow_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@router.post("/workflows/{workflow_id}/deactivate")
async def deactivate_workflow(workflow_id: str):
    """Deactivate a workflow"""
    result = n8n_manager.deactivate_workflow(workflow_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result

@router.get("/executions")
async def get_executions(limit: int = 10):
    """Get recent workflow executions"""
    executions = n8n_manager.get_executions(limit=limit)
    return {"executions": executions, "count": len(executions)}

@router.get("/logs")
async def get_logs(lines: int = 100):
    """Get n8n logs"""
    logs = n8n_manager.get_logs(lines=lines)
    return {"logs": logs, "count": len(logs)}
