from fastapi import APIRouter
from backend.api import auth, documents, dashboard, reports, logs, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
