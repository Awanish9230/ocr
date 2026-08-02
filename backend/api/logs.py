from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any
import json

from backend.core.database import SessionLocal
from backend.api import deps
from backend.models.user import User
from backend.models.audit_log import AuditLog
from backend.models.document import Document

router = APIRouter()

@router.get("", response_model=dict)
def get_logs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    query = db.query(AuditLog, Document.title).outerjoin(Document, AuditLog.document_id == Document.id)
    
    if current_user.role == "User":
        query = query.filter(AuditLog.user_id == current_user.id)
        
    logs = query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    
    logs_out = []
    for log, doc_title in logs:
        logs_out.append({
            "id": log.id,
            "action": log.action,
            "resource": log.resource,
            "documentId": log.document_id,
            "documentTitle": doc_title or "Unknown Document",
            "timestamp": log.timestamp.isoformat(),
            "details": log.details,
            "ipAddress": log.ip_address
        })
        
    return {"logs": logs_out}
