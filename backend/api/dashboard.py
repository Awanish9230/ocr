from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any

from backend.core.database import SessionLocal
from backend.api import deps
from backend.models.user import User
from backend.models.document import Document, DocumentStatusEnum

router = APIRouter()

@router.get("", response_model=dict)
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    query = db.query(Document)
    if current_user.role == "User":
        query = query.filter(Document.uploader_id == current_user.id)
        
    total_documents = query.count()
    successful = query.filter(Document.status == DocumentStatusEnum.Completed).count()
    failed = query.filter(Document.status == DocumentStatusEnum.Failed).count()
    pending_review = query.filter(Document.status == DocumentStatusEnum.Validation_Pending).count()
    
    success_rate = (successful / total_documents * 100) if total_documents > 0 else 0
    
    failure_rate = (failed / total_documents * 100) if total_documents > 0 else 0
    
    # Document types breakdown
    doc_types = db.query(Document.document_type, func.count(Document.id)).filter(
        Document.uploader_id == current_user.id if current_user.role == "User" else True
    ).group_by(Document.document_type).all()
    
    types_breakdown = [{"name": dt[0] or "Unknown", "value": dt[1]} for dt in doc_types]
    
    # Recent Uploads
    recent_query = db.query(Document).order_by(Document.created_at.desc())
    if current_user.role == "User":
        recent_query = recent_query.filter(Document.uploader_id == current_user.id)
    recent_uploads = recent_query.limit(5).all()
    
    # Serialize recent uploads for JSON
    recent_uploads_json = [
        {
            "_id": str(doc.id),
            "title": doc.title,
            "documentType": doc.document_type or "Unknown",
            "createdAt": doc.created_at.isoformat() if doc.created_at else "",
            "status": doc.status
        }
        for doc in recent_uploads
    ]
    
    return {
        "stats": {
            "totalDocuments": total_documents,
            "successRate": round(success_rate, 2),
            "pendingReviewDocs": pending_review,
            "failureRate": round(failure_rate, 2),
        },
        "recentUploads": recent_uploads_json,
        "charts": {
            "documentTypes": types_breakdown,
            "monthlyUploads": [] # Mock or implement later
        }
    }
