from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from backend.models.document import DocumentStatusEnum

class DocumentBase(BaseModel):
    title: str
    document_type: str
    
class DocumentOut(DocumentBase):
    id: str
    original_filename: str
    url: str
    status: DocumentStatusEnum
    confidence_score: Optional[float] = None
    extracted_data: Optional[Dict[str, Any]] = None
    validation_errors: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentUpdate(BaseModel):
    extracted_data: Dict[str, Any]
    
class DocumentReview(BaseModel):
    action: str # "approve" or "reject"
    extractedData: Optional[Dict[str, Any]] = None
    remarks: Optional[str] = None
