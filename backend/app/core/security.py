import hashlib
import os
import secrets
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .database import get_db
from ..models import LoginSession, User

password_hasher = PasswordHash.recommended()
DUMMY_PASSWORD_HASH = password_hasher.hash("constant-time-placeholder-password")
SESSION_TTL_DAYS = max(1, min(int(os.getenv("SESSION_TTL_DAYS", "30")), 90))
bearer_scheme = HTTPBearer(auto_error=False)


def token_digest(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def issue_session(db: Session, user: User) -> tuple[str, int]:
    now = int(time.time())
    expires_at = now + SESSION_TTL_DAYS * 24 * 60 * 60
    token = secrets.token_urlsafe(32)
    db.add(
        LoginSession(
            token_hash=token_digest(token), user_id=user.id, expires_at=expires_at
        )
    )
    db.execute(delete(LoginSession).where(LoginSession.expires_at <= now))
    db.commit()
    return token, expires_at


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTH_REQUIRED"},
        )

    now = int(time.time())
    session = db.scalar(
        select(LoginSession).where(
            LoginSession.token_hash == token_digest(credentials.credentials),
            LoginSession.expires_at > now,
        )
    )
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "SESSION_EXPIRED"},
        )
    return session.user
