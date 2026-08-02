from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any, List, Optional
import time

from backend.core.database import SessionLocal
from backend.api import deps
from backend.models.user import User
from backend.models.document import Document, DocumentStatusEnum
from backend.models.audit_log import AuditLog
from backend.schemas.document import DocumentOut, DocumentUpdate, DocumentReview
from backend.services.upload_service import upload_file_to_cloudinary, delete_file_from_cloudinary
from backend.services.parser_service import process_document

router = APIRouter()

@router.post("/upload", response_model=dict)
async def upload_document(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    documentType: str = Form("Unknown"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    
    file_content = await file.read()
    if len(file_content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 25MB.")
        
    # Upload to Cloudinary
    upload_result = upload_file_to_cloudinary(file_content, file.filename)
    
    doc = Document(
        uploader_id=current_user.id,
        title=file.filename,
        original_filename=file.filename,
        url=upload_result["url"],
        public_id=upload_result["public_id"],
        document_type=documentType,
        status=DocumentStatusEnum.Processing
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Log upload
    audit = AuditLog(
        user_id=current_user.id,
        action="Upload",
        resource="Document",
        resource_id=doc.id,
        document_id=doc.id,
        ip_address=request.client.host if request.client else "Unknown"
    )
    db.add(audit)
    db.commit()
    
    # Dispatch the document to the AI parser background task
    doc.status = DocumentStatusEnum.Pending
    db.commit()
    
    background_tasks.add_task(process_document, str(doc.id), file_content, file.content_type)
    
    return {
        "message": "Document uploaded successfully", 
        "document": {
            "id": str(doc.id),
            "title": doc.title,
            "document_type": doc.document_type,
            "status": doc.status,
            "url": doc.url
        }
    }

@router.get("", response_model=dict)
def get_documents(
    status: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    query = db.query(Document)
    if current_user.role == "User":
        query = query.filter(Document.uploader_id == current_user.id)
        
    if status:
        query = query.filter(Document.status == status)
    if type:
        query = query.filter(Document.document_type == type)
        
    documents = query.order_by(Document.created_at.desc()).all()
    
    docs_out = []
    for d in documents:
        docs_out.append({
            "_id": str(d.id),
            "id": str(d.id),
            "title": d.title,
            "documentType": d.document_type or "Unknown",
            "confidenceScore": d.confidence_score,
            "createdAt": d.created_at.isoformat() if d.created_at else "",
            "status": d.status,
            "uploader": {"name": d.uploader.name, "email": d.uploader.email} if getattr(d, "uploader", None) else None
        })
        
    return {"documents": docs_out}

@router.get("/{id}", response_model=DocumentOut)
def get_document(
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if current_user.role == "User" and doc.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return doc

@router.delete("/{id}")
def delete_document(
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    delete_file_from_cloudinary(doc.public_id)
    
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}

@router.put("/{id}/review")
def review_document(
    id: str,
    review_in: DocumentReview,
    request: Request,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_analyst_or_admin)
) -> Any:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if review_in.action == "approve":
        doc.status = DocumentStatusEnum.Completed
        if review_in.extractedData:
            doc.extracted_data = review_in.extractedData
    elif review_in.action == "reject":
        doc.status = DocumentStatusEnum.Failed
        doc.validation_errors = {"remarks": review_in.remarks or "Rejected during manual review"}
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    db.commit()
    db.refresh(doc)
    
    audit = AuditLog(
        user_id=current_user.id,
        action=f"Review_{review_in.action.capitalize()}",
        resource="Document",
        resource_id=doc.id,
        document_id=doc.id,
        details={"remarks": review_in.remarks},
        ip_address=request.client.host if request.client else "Unknown"
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Document review processed successfully", "document": DocumentOut.model_validate(doc).model_dump()}

@router.put("/{id}")
def update_document(
    id: str,
    doc_in: DocumentUpdate,
    request: Request,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if current_user.role == "User" and doc.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if doc.status not in [DocumentStatusEnum.Completed, DocumentStatusEnum.Validation_Pending]:
        raise HTTPException(status_code=400, detail="Document cannot be edited in current state")
        
    doc.extracted_data = doc_in.extracted_data
    if doc.status == DocumentStatusEnum.Validation_Pending:
        doc.status = DocumentStatusEnum.Completed
        
    db.commit()
    db.refresh(doc)
    
    audit = AuditLog(
        user_id=current_user.id,
        action="Edit_Extracted_Data",
        resource="Document",
        resource_id=doc.id,
        document_id=doc.id,
        ip_address=request.client.host if request.client else "Unknown"
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Document updated successfully", "document": DocumentOut.model_validate(doc).model_dump()}
