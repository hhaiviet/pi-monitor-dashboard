from fastapi import APIRouter
from app.services.system_monitor import system_monitor
from app.services.history_manager import history_manager
from datetime import datetime

router = APIRouter()

@router.get("/stats")
async def get_stats():
    return system_monitor.get_stats()

@router.get("/info")
async def get_info():
    return system_monitor.get_system_info()

@router.get("/history")
async def get_history(hours: int = 24):
    """Get system metrics history"""
    data = history_manager.get_history(hours)
    return {
        "hours": hours,
        "count": len(data),
        "data": data
    }

@router.get("/history/debug")
async def debug_history():
    """Debug endpoint to check history data"""
    try:
        latest = history_manager.get_latest(limit=5)
        count = len(history_manager.get_history(hours=24))
        
        return {
            "total_records_24h": count,
            "latest_5_records": latest,
            "database_engine": str(history_manager.engine.url),
            "status": "ok" if count > 0 else "no_data"
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/history/force-store")
async def force_store_metric():
    """Force store current metric (for testing)"""
    try:
        stats = system_monitor.get_stats()
        success = history_manager.store_metrics(
            cpu=stats['cpu']['percent'],
            memory=stats['memory']['percent'],
            disk=stats['disk']['percent'],
            temperature=stats.get('temperature', 0)
        )
        return {
            "success": success,
            "stored_at": datetime.now().isoformat(),
            "data": stats
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
