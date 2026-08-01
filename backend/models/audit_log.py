from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.core.database import Base
from backend.models.user import generate_uuid

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String, nullable=False, index=True) # e.g. Upload, Review, Login
    resource = Column(String, nullable=False) # e.g. Document, User
    resource_id = Column(String, nullable=True)
    document_id = Column(String, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="audit_logs")
    document = relationship("Document", back_populates="audit_logs")
