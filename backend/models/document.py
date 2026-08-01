from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from backend.core.database import Base
from backend.models.user import generate_uuid

class DocumentStatusEnum(str, enum.Enum):
    Pending = 'Pending'
    Processing = 'Processing'
    Validation_Pending = 'Validation_Pending'
    Completed = 'Completed'
    Failed = 'Failed'

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    uploader_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    url = Column(String, nullable=False)
    public_id = Column(String, nullable=False)
    document_type = Column(String, default="Unknown")
    status = Column(Enum(DocumentStatusEnum), default=DocumentStatusEnum.Pending, index=True)
    confidence_score = Column(Float, nullable=True)
    
    # Store dynamic parsed data and errors
    extracted_data = Column(JSON, nullable=True)
    validation_errors = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    uploader = relationship("User", back_populates="documents")
    audit_logs = relationship("AuditLog", back_populates="document")
