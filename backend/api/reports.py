from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Any, Optional
import csv
import io

from backend.core.database import SessionLocal
from backend.api import deps
from backend.models.user import User
from backend.models.document import Document
from backend.models.audit_log import AuditLog

router = APIRouter()

@router.get("/export/csv")
def export_reports_csv(
    status: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    query = db.query(Document)
    if current_user.role == "User":
        query = query.filter(Document.uploader_id == current_user.id)
    if status:
        query = query.filter(Document.status == status)
        
    documents = query.all()
    if not documents:
        raise HTTPException(status_code=404, detail="No documents found to export")
        
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Document ID', 'Title', 'Type', 'Status', 'Confidence Score', 'Created At'])
    
    for doc in documents:
        writer.writerow([
            doc.id,
            doc.title,
            doc.document_type,
            doc.status,
            doc.confidence_score or 0,
            doc.created_at.isoformat()
        ])
        
    # Log export
    audit = AuditLog(
        user_id=current_user.id,
        action="Export_Reports",
        resource="Document",
    )
    db.add(audit)
    db.commit()
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=documents_export.csv"}
    )
