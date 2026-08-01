from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import Any

from backend.core.database import SessionLocal
from backend.core import security
from backend.api import deps
from backend.models.user import User
from backend.models.audit_log import AuditLog
from backend.schemas.user import UserCreate, UserOut, Token, UserUpdate, UserLogin

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(deps.get_db)) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=409,
            detail="The user with this username already exists in the system.",
        )
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Audit Log
    audit = AuditLog(
        user_id=user.id,
        action="Register",
        resource="User",
        resource_id=user.id,
        ip_address=request.client.host if request.client else "Unknown"
    )
    db.add(audit)
    db.commit()
    
    return user

@router.post("/login", response_model=Token)
def login(
    response: Response,
    login_data: UserLogin,
    db: Session = Depends(deps.get_db)
) -> Any:
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not security.verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = security.create_access_token(user.id)
    refresh_token = security.create_refresh_token(user.id)
    
    # Set cookies
    response.set_cookie(key="accessToken", value=access_token, httponly=True, max_age=604800)
    response.set_cookie(key="refreshToken", value=refresh_token, httponly=True, max_age=604800)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(response: Response, current_user: User = Depends(deps.get_current_user)) -> Any:
    response.delete_cookie("accessToken")
    response.delete_cookie("refreshToken")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(deps.get_current_user)) -> Any:
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    user_in: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    if user_in.name:
        current_user.name = user_in.name
    if user_in.email:
        user = db.query(User).filter(User.email == user_in.email, User.id != current_user.id).first()
        if user:
             raise HTTPException(status_code=409, detail="Email already in use")
        current_user.email = user_in.email
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user
