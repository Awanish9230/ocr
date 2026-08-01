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
    
    # Document types breakdown
    doc_types = db.query(Document.document_type, func.count(Document.id)).filter(
        Document.uploader_id == current_user.id if current_user.role == "User" else True
    ).group_by(Document.document_type).all()
    
    types_breakdown = [{"name": dt[0], "value": dt[1]} for dt in doc_types]
    
    return {
        "stats": {
            "total_uploaded": total_documents,
            "successfully_parsed": successful,
            "failed_parsing": failed,
            "pending_review": pending_review,
            "success_rate": round(success_rate, 2),
            "average_processing_time": "N/A" # Implement later if tracking processing time
        },
        "documentTypes": types_breakdown,
        "monthlyUploads": [] # Mock or implement later
    }
