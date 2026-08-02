from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from backend.core.database import SessionLocal
from backend.api import deps
from backend.models.user import User, RoleEnum
from backend.models.audit_log import AuditLog
from backend.schemas.user import UserOut
from pydantic import BaseModel

router = APIRouter()

class RoleUpdate(BaseModel):
    role: RoleEnum

@router.get("", response_model=dict)
def get_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    users = db.query(User).order_by(User.created_at.desc()).all()
    
    users_out = []
    for u in users:
        users_out.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "is_email_verified": u.is_email_verified,
            "createdAt": u.created_at.isoformat() if u.created_at else ""
        })
        
    return {"users": users_out}

@router.put("/{user_id}/role", response_model=dict)
def update_user_role(
    user_id: str,
    role_in: RoleUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    old_role = user.role
    user.role = role_in.role
    db.commit()
    
    audit = AuditLog(
        user_id=current_user.id, 
        action="Update_Role", 
        resource="User", 
        resource_id=user.id,
        details={"old_role": old_role, "new_role": user.role}
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success", "message": "Role updated successfully"}

@router.delete("/{user_id}", response_model=dict)
def delete_user(
    user_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    db.delete(user)
    db.commit()
    
    audit = AuditLog(
        user_id=current_user.id, 
        action="Delete_User", 
        resource="User", 
        resource_id=user_id
    )
    db.add(audit)
    db.commit()
    
    return {"status": "success", "message": "User deleted successfully"}
