from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.demo_users import DEMO_ROLES, DEMO_USERS
from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.models import audit_log, conversation, permission, role, role_permission, security_event, setting, token, user, user_role
from app.models.role import Role
from app.models.audit_log import AuditLog
from app.models.token import RefreshToken
from app.models.user import User
from app.models.user_role import UserRole
from app.utils.security import hash_password


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_security_event_columns()
    seed_default_roles()


def ensure_security_event_columns() -> None:
    """Apply only additive Phase 3.7 columns for databases initialized earlier."""
    columns = {
        "prompt": "TEXT",
        "authorization_decision": "VARCHAR(20)",
        "authorization_reason": "VARCHAR(500)",
        "detector_results": "JSON",
        "outcome": "VARCHAR(30)",
        "provider_status_code": "INTEGER",
        "response_assessment": "JSON",
        "response_outcome": "VARCHAR(30)",
        "latency_ms": "DOUBLE PRECISION",
        "metadata_json": "JSON",
        "error_type": "VARCHAR(200)",
        "error_message": "VARCHAR(1000)",
    }
    with engine.begin() as connection:
        for name, sql_type in columns.items():
            connection.execute(text(f'ALTER TABLE security_events ADD COLUMN IF NOT EXISTS "{name}" {sql_type}'))
        for index_name, columns_sql in {
            "ix_security_events_conversation_timestamp": '"conversation_id", "event_timestamp"',
            "ix_security_events_user_timestamp": '"user_id", "event_timestamp"',
            "ix_security_events_authorization_decision": '"authorization_decision"',
        }.items():
            connection.execute(text(f'CREATE INDEX IF NOT EXISTS "{index_name}" ON security_events ({columns_sql})'))


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
