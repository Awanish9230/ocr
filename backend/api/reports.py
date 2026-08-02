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

import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import json

def format_extracted_value(val):
    if isinstance(val, list):
        items = []
        for item in val:
            if isinstance(item, dict):
                items.append(", ".join(f"{k}: {v}" for k, v in item.items()))
            else:
                items.append(str(item))
        return " | ".join(items)
    elif isinstance(val, dict):
        return ", ".join(f"{k}: {v}" for k, v in val.items())
    return str(val)

@router.get("/export/excel/{id}")
def export_report_excel(
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if current_user.role == "User" and doc.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    data = {
        "File Name": [doc.title],
        "Type": [doc.document_type],
        "Status": [doc.status],
        "Processing Time (s)": [doc.processing_time],
        "Review Status": [doc.status],
        "Confidence Score": [doc.confidence_score],
    }

    # Flatten extracted data
    if doc.extracted_data:
        for k, v in doc.extracted_data.items():
            if isinstance(v, (list, dict)):
                data[f"Extracted: {k}"] = [format_extracted_value(v)]
            else:
                data[f"Extracted: {k}"] = [v]
                
    if doc.validation_errors:
        data["Validation Results"] = [json.dumps(doc.validation_errors)]
        
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Report')
        
    audit = AuditLog(user_id=current_user.id, action="Export_Report_Excel", resource="Document", document_id=doc.id)
    db.add(audit)
    db.commit()
    
    return Response(
        content=output.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=report_{id}.xlsx"}
    )

@router.get("/export/pdf/{id}")
def export_report_pdf(
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if current_user.role == "User" and doc.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    output = io.BytesIO()
    p = canvas.Canvas(output, pagesize=letter)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, 750, f"Report for Document: {doc.title}")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, 720, f"Document Type: {doc.document_type}")
    p.drawString(50, 700, f"Status: {doc.status}")
    p.drawString(50, 680, f"Processing Time: {doc.processing_time}s")
    p.drawString(50, 660, f"Confidence Score: {doc.confidence_score}%")
    
    y = 620
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Extracted Fields:")
    y -= 20
    p.setFont("Helvetica", 10)
    
    if doc.extracted_data:
        for k, v in doc.extracted_data.items():
            if y < 100:
                p.showPage()
                y = 750
            if isinstance(v, (list, dict)):
                formatted = format_extracted_value(v)
                text = f"{k}: {formatted[:100]}..." if len(formatted) > 100 else f"{k}: {formatted}"
            else:
                text = f"{k}: {v}"
            p.drawString(60, y, text)
            y -= 15
            
    if doc.validation_errors:
        y -= 20
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, "Validation Results:")
        y -= 20
        p.setFont("Helvetica", 10)
        p.drawString(60, y, json.dumps(doc.validation_errors))
        
    p.showPage()
    p.save()
    
    audit = AuditLog(user_id=current_user.id, action="Export_Report_PDF", resource="Document", document_id=doc.id)
    db.add(audit)
    db.commit()
    
    return Response(
        content=output.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{id}.pdf"}
    )
