from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.role import Role
from app.models.token import RefreshToken
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.redis_service import RedisService
from app.services.session_service import SessionService
from app.utils.security import create_access_token, create_refresh_token, hash_password, verify_password

DEFAULT_ROLE_NAMES = ("Admin", "User", "Analyst")


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)
        self.redis_service = RedisService()
        self.session_service = SessionService(self.redis_service)

    def register(self, name: str, email: str, password: str, role_name: str | None = None) -> User:
        existing_user = self.user_repository.get_by_email(email)
        if existing_user:
            raise ValueError("Email already registered")

        self._ensure_default_roles()
        role_name = role_name or "User"
        role = self.db.query(Role).filter(Role.name == role_name).first()
        if not role:
            raise ValueError(f"Role not found: {role_name}")

        user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role_id=role.id,
            is_verified=True,
            is_active=True,
        )
        return self.user_repository.create(user)

    def login(self, email: str, password: str) -> tuple[User, str, str]:
        user = self.user_repository.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid credentials")
        if not user.is_active:
            raise ValueError("User is inactive")

        access_token = create_access_token(user.id, user.role_id)
        refresh_token = create_refresh_token(user.id)
        self._store_refresh_token(user.id, refresh_token)
        self.session_service.store_session(user.id, refresh_token)
        user.last_login = datetime.utcnow()
        self.user_repository.update(user)
        return user, access_token, refresh_token

    def refresh(self, refresh_token_value: str) -> tuple[User, str, str]:
        refresh_token = self.db.query(RefreshToken).filter(RefreshToken.token_hash == refresh_token_value).first()
        if not refresh_token or refresh_token.revoked or refresh_token.expires_at < datetime.utcnow():
            raise ValueError("Invalid refresh token")

        user = self.user_repository.get_by_id(refresh_token.user_id)
        if not user or not user.is_active:
            raise ValueError("Invalid refresh token")

        new_access_token = create_access_token(user.id, user.role_id)
        new_refresh_token = create_refresh_token(user.id)
        refresh_token.revoked = True
        refresh_token.token_hash = new_refresh_token
        refresh_token.expires_at = datetime.utcnow() + timedelta(days=7)
        self.session_service.store_session(user.id, new_refresh_token)
        self.db.commit()
        return user, new_access_token, new_refresh_token

    def logout(self, refresh_token_value: str) -> None:
        refresh_token = self.db.query(RefreshToken).filter(RefreshToken.token_hash == refresh_token_value).first()
        if refresh_token:
            refresh_token.revoked = True
            self.redis_service.set_value(f"blacklist:{refresh_token_value}", True, ttl_seconds=int(timedelta(days=7).total_seconds()))
            self.session_service.delete_session(refresh_token.user_id)
            self.db.commit()

    def _store_refresh_token(self, user_id: str, refresh_token_value: str) -> None:
        token = RefreshToken(
            user_id=user_id,
            token_hash=refresh_token_value,
            expires_at=datetime.utcnow() + timedelta(days=7),
        )
        self.db.add(token)
        self.db.commit()

    def _ensure_default_roles(self) -> None:
        existing_roles = {role.name for role in self.db.query(Role).all()}
        for role_name in DEFAULT_ROLE_NAMES:
            if role_name not in existing_roles:
                self.db.add(Role(name=role_name, description=f"{role_name} role"))
        self.db.commit()

    def revoke_token(self, token_value: str) -> None:
        self.redis_service.set_value(f"blacklist:{token_value}", True, ttl_seconds=int(timedelta(days=7).total_seconds()))
