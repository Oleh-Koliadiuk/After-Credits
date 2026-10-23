from collections import OrderedDict, deque
from dataclasses import dataclass, field
import os
import time
from threading import Lock

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


def _positive_int(name: str, default: int, maximum: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        return default
    return value if 0 < value <= maximum else default


@dataclass
class _RateBucket:
    requests: deque[float] = field(default_factory=deque)
    blocked_until: float = 0


class IPRateLimitMiddleware(BaseHTTPMiddleware):
    """Small per-process API limiter; use a shared store and edge protection in production."""

    def __init__(self, app):
        super().__init__(app)
        self.api_limit = _positive_int("RATE_LIMIT_REQUESTS", 120, 10_000)
        self.api_window = _positive_int("RATE_LIMIT_WINDOW_SECONDS", 60, 86_400)
        self.api_block = _positive_int("RATE_LIMIT_BLOCK_SECONDS", 600, 604_800)
        self.auth_limit = _positive_int("AUTH_RATE_LIMIT_REQUESTS", 10, 1_000)
        self.auth_window = _positive_int("AUTH_RATE_LIMIT_WINDOW_SECONDS", 300, 86_400)
        self.auth_block = _positive_int("AUTH_RATE_LIMIT_BLOCK_SECONDS", 900, 604_800)
        self.max_clients = _positive_int("RATE_LIMIT_MAX_CLIENTS", 20_000, 100_000)
        self._buckets: OrderedDict[tuple[str, str], _RateBucket] = OrderedDict()
        self._blocked_ips: OrderedDict[str, float] = OrderedDict()
        self._lock = Lock()
        self._checks = 0

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        path = request.url.path
        if request.method == "OPTIONS" or not path.startswith("/api/"):
            return await call_next(request)

        client = request.client.host if request.client else "unknown"
        is_auth_attempt = path in {"/api/auth/login", "/api/auth/register"}
        bucket_name = "auth" if is_auth_attempt else "api"
        limit, window, block = (
            (self.auth_limit, self.auth_window, self.auth_block)
            if is_auth_attempt
            else (self.api_limit, self.api_window, self.api_block)
        )
        now = time.monotonic()
        key = (client, bucket_name)
        remaining = 0

        with self._lock:
            blocked_until = self._blocked_ips.get(client, 0)
            if blocked_until > now:
                self._blocked_ips.move_to_end(client)
                retry_after = max(1, int(blocked_until - now))
            else:
                self._blocked_ips.pop(client, None)
                retry_after = 0

            bucket = self._buckets.get(key)
            if not retry_after and bucket is None:
                bucket = _RateBucket()
                self._buckets[key] = bucket
                if len(self._buckets) > self.max_clients:
                    self._buckets.popitem(last=False)
            elif not retry_after:
                self._buckets.move_to_end(key)

            self._checks += 1
            if self._checks % 512 == 0:
                self._prune(now)

            if not retry_after:
                if bucket.blocked_until > now:
                    retry_after = max(1, int(bucket.blocked_until - now))
                else:
                    bucket.blocked_until = 0
                    while bucket.requests and now - bucket.requests[0] >= window:
                        bucket.requests.popleft()
                    if len(bucket.requests) >= limit:
                        bucket.blocked_until = now + block
                        self._blocked_ips[client] = bucket.blocked_until
                        self._blocked_ips.move_to_end(client)
                        if len(self._blocked_ips) > self.max_clients:
                            self._blocked_ips.popitem(last=False)
                        retry_after = block
                    else:
                        bucket.requests.append(now)
                        remaining = max(0, limit - len(bucket.requests))

        if retry_after:
            return JSONResponse(
                {"detail": {"code": "RATE_LIMITED"}},
                status_code=429,
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Limit": str(limit),
                    "Cache-Control": "no-store",
                },
            )
        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Limit"] = str(limit)
        return response

    def _prune(self, now: float) -> None:
        for ip, blocked_until in list(self._blocked_ips.items()):
            if blocked_until <= now:
                self._blocked_ips.pop(ip, None)
        for key, bucket in list(self._buckets.items()):
            window = self.auth_window if key[1] == "auth" else self.api_window
            while bucket.requests and now - bucket.requests[0] >= window:
                bucket.requests.popleft()
            if bucket.blocked_until <= now and not bucket.requests:
                self._buckets.pop(key, None)
