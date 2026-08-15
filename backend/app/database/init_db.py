from sqlalchemy.orm import Session

from app.core.demo_users import DEMO_ROLES, DEMO_USERS
from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.models import audit_log, conversation, permission, role, role_permission, setting, token, user, user_role
from app.models.role import Role
from app.models.audit_log import AuditLog
from app.models.token import RefreshToken
from app.models.user import User
from app.models.user_role import UserRole
from app.utils.security import hash_password


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    seed_default_roles()


def seed_default_roles() -> None:
    db: Session = SessionLocal()
    try:
        existing_roles = {item.name for item in db.query(Role).all()}
        defaults = list(DEMO_ROLES)
        for name, description in defaults:
            if name not in existing_roles:
                db.add(Role(name=name, description=description))

        db.flush()
        legacy_admin = db.query(User).filter(User.email == "admin@example.com").first()
        if legacy_admin:
            db.query(RefreshToken).filter(RefreshToken.user_id == legacy_admin.id).delete()
            db.query(AuditLog).filter(AuditLog.user_id == legacy_admin.id).delete()
            db.query(UserRole).filter(UserRole.user_id == legacy_admin.id).delete()
            db.delete(legacy_admin)
            db.flush()

        role_by_name = {role.name: role for role in db.query(Role).all()}
        for name, email, password in DEMO_USERS:
            if not db.query(User).filter(User.email == email).first():
                db.add(User(name=name, email=email, password_hash=hash_password(password), role_id=role_by_name[name].id, is_verified=True, is_active=True))
        db.commit()
    finally:
        db.close()
