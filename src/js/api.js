window.AnimeTracker = window.AnimeTracker || {};

(() => {
  const TOKEN_KEY = "aftercredits.api.session.v1";
  const baseUrl = String(
    window.AnimeTrackerConfig.apiBaseUrl || "/api",
  ).replace(/\/$/, "");

  class ApiError extends Error {
    constructor(code, status, remainingAttempts = null) {
      super(code || "API_ERROR");
      this.name = "ApiError";
      this.code = code || "API_ERROR";
      this.status = status;
      this.remainingAttempts = remainingAttempts;
    }
  }

  async function request(path, { method = "GET", body, auth = true } = {}) {
    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const token = auth ? sessionStorage.getItem(TOKEN_KEY) : "";
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        credentials: "omit",
      });
    } catch {
      throw new ApiError("API_UNAVAILABLE", 0);
    }

    if (response.status === 204) return null;
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      // Keep the status code when a proxy returns a non-JSON error page.
    }
    if (!response.ok) {
      const detail = payload.detail;
      const code =
        typeof detail === "object" && !Array.isArray(detail)
          ? detail?.code
          : response.status === 422
            ? "INVALID_INPUT"
            : detail;
      const remainingHeader = response.headers.get("X-RateLimit-Remaining");
      const remainingAttempts =
        remainingHeader !== null && Number.isInteger(Number(remainingHeader))
          ? Number(remainingHeader)
          : null;
      throw new ApiError(
        code || "API_ERROR",
        response.status,
        remainingAttempts,
      );
    }
    return payload;
  }

  function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  window.AnimeTracker.api = { request, setToken, clearToken };
})();
