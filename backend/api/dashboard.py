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
    
    avg_processing_time = db.query(func.avg(Document.processing_time)).filter(Document.processing_time.isnot(None))
    if current_user.role == "User":
        avg_processing_time = avg_processing_time.filter(Document.uploader_id == current_user.id)
    avg_processing_time = avg_processing_time.scalar() or 0
    
    # Document types breakdown
    doc_types = db.query(Document.document_type, func.count(Document.id)).filter(
        Document.uploader_id == current_user.id if current_user.role == "User" else True
    ).group_by(Document.document_type).all()
    
    types_breakdown = [{"name": dt[0] or "Unknown", "value": dt[1]} for dt in doc_types]
    
    # Daily Uploads (Last 7 days)
    from datetime import datetime, timedelta, timezone
    today = datetime.now(timezone.utc)
    daily_uploads = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        count = query.filter(func.date(Document.created_at) == day.date()).count()
        daily_uploads.append({"date": day_str, "count": count})
        
    # Monthly Uploads (This year)
    monthly_uploads = []
    for i in range(1, 13):
        count = query.filter(func.extract('month', Document.created_at) == i, func.extract('year', Document.created_at) == today.year).count()
        monthly_uploads.append({"month": i, "count": count})
    
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
            "averageProcessingTime": round(avg_processing_time, 2)
        },
        "recentUploads": recent_uploads_json,
        "charts": {
            "documentTypes": types_breakdown,
            "dailyUploads": daily_uploads,
            "monthlyUploads": monthly_uploads
        }
    }
