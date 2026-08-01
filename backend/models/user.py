from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from backend.core.database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class RoleEnum(str, enum.Enum):
    Admin = 'Admin'
    Analyst = 'Analyst'
    User = 'User'

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.User, nullable=False)
    is_email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    documents = relationship("Document", back_populates="uploader", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
