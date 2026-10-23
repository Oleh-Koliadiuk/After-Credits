from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.security import (
    DUMMY_PASSWORD_HASH,
    bearer_scheme,
    current_user,
    issue_session,
    password_hasher,
    token_digest,
)
from ...models import AnimeEntry, LoginSession, User
from ...schemas import Credentials, ProfileUpdate, SessionResponse

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=SessionResponse, status_code=201)
def register(credentials: Credentials, db: Session = Depends(get_db)):
    normalized = credentials.username.casefold()
    if db.scalar(select(User.id).where(User.username_normalized == normalized)):
        raise HTTPException(status_code=409, detail={"code": "USERNAME_TAKEN"})
    if credentials.email and db.scalar(select(User.id).where(User.email == credentials.email)):
        raise HTTPException(status_code=409, detail={"code": "EMAIL_TAKEN"})
    user = User(
        username=credentials.username,
        username_normalized=normalized,
        password_hash=password_hasher.hash(credentials.password),
        email=credentials.email,
    )
    db.add(user)
    try:
        db.flush()
        token, _ = issue_session(db, user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail={"code": "USERNAME_TAKEN"})
    return SessionResponse(access_token=token, username=user.username)


@router.post("/login", response_model=SessionResponse)
def login(credentials: Credentials, db: Session = Depends(get_db)):
    normalized = credentials.username.casefold()
    user = db.scalar(select(User).where(User.username_normalized == normalized))
    stored_hash = user.password_hash if user else DUMMY_PASSWORD_HASH
    valid = password_hasher.verify(credentials.password, stored_hash)
    if user is None or not valid:
        raise HTTPException(status_code=401, detail={"code": "AUTH_INVALID"})
    token, _ = issue_session(db, user)
    return SessionResponse(access_token=token, username=user.username)


@router.post("/logout", status_code=204)
def logout(
    response: Response,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    if credentials is not None and credentials.scheme.lower() == "bearer":
        session = db.scalar(
            select(LoginSession).where(
                LoginSession.token_hash == token_digest(credentials.credentials)
            )
        )
        if session:
            db.delete(session)
            db.commit()
    response.status_code = 204
    return response


@router.get("/me")
def me(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return {
        "username": user.username,
        "email": user.email,
        "avatarData": user.avatar_data,
        "joinedAt": user.joined_at.isoformat(),
        "titleCount": db.query(AnimeEntry).filter(AnimeEntry.user_id == user.id).count(),
    }


@router.patch("/profile")
def update_profile(
    changes: ProfileUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    if "username" in changes.model_fields_set:
        if not changes.username:
            raise HTTPException(status_code=422, detail={"code": "INVALID_USERNAME"})
        normalized = changes.username.casefold()
        existing_user_id = db.scalar(
            select(User.id).where(
                User.username_normalized == normalized,
                User.id != user.id,
            )
        )
        if existing_user_id is not None:
            raise HTTPException(status_code=409, detail={"code": "USERNAME_TAKEN"})
        user.username = changes.username
        user.username_normalized = normalized
    if "email" in changes.model_fields_set:
        user.email = changes.email
    if "avatarData" in changes.model_fields_set:
        user.avatar_data = changes.avatarData
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail={"code": "USERNAME_TAKEN"}) from error
    db.refresh(user)
    return {
        "username": user.username,
        "email": user.email,
        "avatarData": user.avatar_data,
        "joinedAt": user.joined_at.isoformat(),
        "titleCount": db.query(AnimeEntry).filter(AnimeEntry.user_id == user.id).count(),
    }
