from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from backend.models.user import RoleEnum

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(UserBase):
    password: str
    role: Optional[RoleEnum] = RoleEnum.User

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserOut(UserBase):
    id: str
    role: RoleEnum
    is_email_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut
