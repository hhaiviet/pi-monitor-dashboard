from fastapi import APIRouter
from app.api.routes import system, n8n, processes

router = APIRouter()

router.include_router(system.router, prefix="/system", tags=["System"])
router.include_router(n8n.router, prefix="/n8n", tags=["n8n"])
router.include_router(processes.router, prefix="/processes", tags=["Processes"])
