from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from .api.routes import auth, collection
from .core.database import Base, engine
from .core.rate_limit import IPRateLimitMiddleware

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:8000,http://127.0.0.1:8000,http://localhost:5500,http://127.0.0.1:5500",
    ).split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    added_joined_at = "joined_at" not in user_columns
    with engine.begin() as connection:
        if "email" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(254)"))
        if "avatar_data" not in user_columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN avatar_data TEXT"))
        if added_joined_at:
            connection.execute(text("ALTER TABLE users ADD COLUMN joined_at TIMESTAMP"))
            connection.execute(
                text("UPDATE users SET joined_at = CURRENT_TIMESTAMP WHERE joined_at IS NULL")
            )
            connection.execute(
                text("UPDATE users SET joined_at = '2026-10-20 00:00:00' WHERE id = 2")
            )
    yield


app = FastAPI(title="aftercredits API", version="0.1.0", lifespan=lifespan)
# CORS wraps the limiter so rate-limit responses retain the configured CORS headers.
app.add_middleware(IPRateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["Retry-After", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    max_age=600,
)
app.include_router(auth.router)
app.include_router(collection.router)


@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok"}
