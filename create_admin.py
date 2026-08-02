from backend.core.database import SessionLocal
from backend.models.user import User, RoleEnum
from backend.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        email = "admin@example.com"
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            if existing.role != RoleEnum.Admin:
                existing.role = RoleEnum.Admin
                db.commit()
                print("Existing user updated to Admin role.")
            else:
                print("Admin user already exists.")
            return

        new_user = User(
            name="System Admin",
            email=email,
            password_hash=get_password_hash("admin123"),
            role=RoleEnum.Admin
        )
        db.add(new_user)
        db.commit()
        print("Admin user created successfully:")
        print(f"Email: {email}")
        print(f"Password: admin123")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
