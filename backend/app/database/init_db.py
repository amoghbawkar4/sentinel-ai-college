from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.models import audit_log, conversation, permission, role, role_permission, setting, token, user, user_role
from app.models.role import Role
from app.models.user import User
from app.utils.security import hash_password


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    seed_default_roles()


def seed_default_roles() -> None:
    db: Session = SessionLocal()
    try:
        existing_roles = {item.name for item in db.query(Role).all()}
        defaults = [
            ("Admin", "Administrator role"),
            ("User", "Standard user role"),
            ("Analyst", "Security analyst role"),
        ]
        for name, description in defaults:
            if name not in existing_roles:
                db.add(Role(name=name, description=description))

        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        if admin_role:
            existing_admin = db.query(User).filter(User.email == settings.seeded_admin_email).first()
            if not existing_admin:
                db.add(
                    User(
                        name=settings.seeded_admin_name,
                        email=settings.seeded_admin_email,
                        password_hash=hash_password(settings.seeded_admin_password),
                        role_id=admin_role.id,
                        is_verified=True,
                        is_active=True,
                    )
                )
        db.commit()
    finally:
        db.close()
