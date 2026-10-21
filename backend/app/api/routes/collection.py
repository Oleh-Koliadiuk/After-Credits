import time
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.security import current_user
from ...models import AnimeEntry, User
from ...schemas import AnimeEntryInput, AnimeEntryUpdate, ImportRequest

router = APIRouter(prefix="/api/collection", tags=["collection"])


def public_entry(entry: AnimeEntry) -> dict:
    return {
        "id": entry.id,
        "title": entry.title,
        "rating": entry.rating,
        "watchedAt": entry.watched_at.isoformat() if entry.watched_at else "",
        "status": entry.status,
        "notes": entry.notes,
        "malId": entry.mal_id,
        "imageUrl": entry.image_url,
    }


def create_entry(db: Session, user: User, item: AnimeEntryInput) -> AnimeEntry:
    title_key = item.title.casefold()
    duplicate = db.scalar(
        select(AnimeEntry.id).where(
            AnimeEntry.user_id == user.id, AnimeEntry.title_key == title_key
        )
    )
    if duplicate:
        raise HTTPException(status_code=409, detail={"code": "DUPLICATE_TITLE"})
    entry = AnimeEntry(
        id=item.id or str(uuid4()),
        user_id=user.id,
        title=item.title,
        title_key=title_key,
        rating=item.rating,
        watched_at=item.watchedAt,
        status=item.status,
        notes=item.notes.strip(),
        mal_id=item.malId,
        image_url=item.imageUrl,
        created_at=time.time(),
    )
    db.add(entry)
    return entry


@router.get("")
def list_collection(
    user: User = Depends(current_user), db: Session = Depends(get_db)
):
    entries = db.scalars(
        select(AnimeEntry)
        .where(AnimeEntry.user_id == user.id)
        .order_by(AnimeEntry.created_at.desc(), AnimeEntry.id.desc())
    ).all()
    return [public_entry(entry) for entry in entries]


@router.post("", status_code=201)
def add_entry(
    item: AnimeEntryInput,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    entry = create_entry(db, user, item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail={"code": "DUPLICATE_TITLE"})
    db.refresh(entry)
    return public_entry(entry)


@router.post("/import")
def import_collection(
    request: ImportRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    imported = 0
    seen_titles: set[str] = set()
    for index, item in enumerate(request.items):
        title_key = item.title.casefold()
        if title_key in seen_titles:
            continue
        seen_titles.add(title_key)
        duplicate = db.scalar(
            select(AnimeEntry.id).where(
                AnimeEntry.user_id == user.id, AnimeEntry.title_key == title_key
            )
        )
        if duplicate:
            continue
        db.add(
            AnimeEntry(
                id=item.id or str(uuid4()),
                user_id=user.id,
                title=item.title,
                title_key=title_key,
                rating=item.rating,
                watched_at=item.watchedAt,
                status=item.status,
                notes=item.notes.strip(),
                mal_id=item.malId,
                image_url=item.imageUrl,
                created_at=time.time() - index,
            )
        )
        imported += 1
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail={"code": "IMPORT_CONFLICT"})
    return {"imported": imported}


@router.patch("/{entry_id}")
def update_entry(
    entry_id: str,
    changes: AnimeEntryUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.id == entry_id, AnimeEntry.user_id == user.id
        )
    )
    if entry is None:
        raise HTTPException(status_code=404, detail={"code": "ENTRY_NOT_FOUND"})
    fields = changes.model_fields_set
    if "status" in fields and changes.status is not None:
        entry.status = changes.status
    if "notes" in fields and changes.notes is not None:
        entry.notes = changes.notes.strip()
    if "rating" in fields:
        entry.rating = changes.rating
    if "watchedAt" in fields:
        entry.watched_at = changes.watchedAt
    db.commit()
    db.refresh(entry)
    return public_entry(entry)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: str,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    entry = db.scalar(
        select(AnimeEntry).where(
            AnimeEntry.id == entry_id, AnimeEntry.user_id == user.id
        )
    )
    if entry is None:
        raise HTTPException(status_code=404, detail={"code": "ENTRY_NOT_FOUND"})
    db.delete(entry)
    db.commit()
