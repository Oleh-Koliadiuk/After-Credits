from datetime import date
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

Status = Literal["watched", "watching", "planned"]


class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def normalize_username_input(cls, value: str) -> str:
        value = value.strip()
        if not 3 <= len(value) <= 30 or not value.isascii() or not all(
            char.isalnum() or char in "_.-" for char in value
        ):
            raise ValueError("INVALID_USERNAME")
        return value


class AnimeEntryInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = None
    title: str = Field(min_length=1, max_length=160)
    rating: float | None = None
    watchedAt: date | None = None
    status: Status = "watched"
    notes: str = Field(default="", max_length=2000)
    malId: int | None = Field(default=None, ge=1)
    imageUrl: str = Field(default="", max_length=2048)

    @field_validator("id")
    @classmethod
    def validate_id(cls, value: str | None) -> str | None:
        if value is None:
            return None
        try:
            return str(UUID(value))
        except ValueError as error:
            raise ValueError("INVALID_ENTRY_ID") from error

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("TITLE_REQUIRED")
        return value

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, value: float | None) -> float | None:
        if value is None:
            return value
        if value < 1 or value > 10 or abs(value * 2 - round(value * 2)) > 1e-8:
            raise ValueError("INVALID_RATING")
        return value

    @field_validator("watchedAt", mode="before")
    @classmethod
    def empty_date_to_none(cls, value):
        return None if value == "" else value

    @field_validator("imageUrl")
    @classmethod
    def validate_image_url(cls, value: str) -> str:
        if value and not value.startswith("https://"):
            raise ValueError("INVALID_IMAGE_URL")
        return value


class AnimeEntryUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rating: float | None = None
    watchedAt: date | None = None
    status: Status | None = None
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, value: float | None) -> float | None:
        if value is not None and (
            value < 1 or value > 10 or abs(value * 2 - round(value * 2)) > 1e-8
        ):
            raise ValueError("INVALID_RATING")
        return value


class ImportRequest(BaseModel):
    items: list[AnimeEntryInput] = Field(max_length=2000)


class SessionResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
