window.AnimeTracker = window.AnimeTracker || {};

(() => {
  const { api, i18n } = window.AnimeTracker;
  const ACCOUNTS_KEY = "aftercredits.accounts.v1";
  const LEGACY_SESSION_KEY = "aftercredits.session.v1";
  const LEGACY_ANIME_KEY = "aftercredits.anime.v1";
  const ITERATIONS = 210_000;

  function readLegacyAccounts() {
    try {
      const value = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
    } catch {
      return {};
    }
  }

  function fromBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  async function derive(password, salt) {
    const material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
      material,
      256,
    );
    return btoa(String.fromCharCode(...new Uint8Array(bits)));
  }

  async function readMatchingLegacyAccount(username, password) {
    const normalized = username.trim().toLocaleLowerCase();
    const account = readLegacyAccounts()[normalized];
    if (!account?.salt || !account?.passwordHash) return null;
    try {
      const candidate = await derive(password, fromBase64(account.salt));
      if (candidate !== account.passwordHash) return null;
      return { normalized, username: account.username || username.trim() };
    } catch {
      return null;
    }
  }

  function readLegacyAnime(normalized) {
    try {
      const items = JSON.parse(
        localStorage.getItem(`${LEGACY_ANIME_KEY}:${normalized}`) || "[]",
      );
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  async function migrateLegacyCollection(legacy) {
    if (!legacy) return;
    const items = readLegacyAnime(legacy.normalized);
    if (items.length) {
      await api.request("/collection/import", {
        method: "POST",
        body: { items },
      });
    }
    localStorage.removeItem(`${LEGACY_ANIME_KEY}:${legacy.normalized}`);
    const accounts = readLegacyAccounts();
    delete accounts[legacy.normalized];
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    if (localStorage.getItem(LEGACY_SESSION_KEY) === legacy.normalized) {
      localStorage.removeItem(LEGACY_SESSION_KEY);
    }
  }

  function localizedError(error) {
    if (error.code === "AUTH_INVALID" && error.remainingAttempts !== null) {
      return new Error(
        i18n.t("auth.err.passwordAttempts", {
          count: error.remainingAttempts,
        }),
      );
    }
    const keys = {
      INVALID_USERNAME: "auth.err.username",
      INVALID_INPUT: "auth.err.input",
      INVALID_EMAIL: "auth.err.gmail",
      EMAIL_TAKEN: "auth.err.emailTaken",
      PASSWORD_TOO_SHORT: "auth.err.passwordLength",
      USERNAME_TAKEN: "auth.err.exists",
      AUTH_INVALID: "auth.err.password",
      API_UNAVAILABLE: "auth.err.connection",
      RATE_LIMITED: "auth.err.rateLimited",
      IMPORT_CONFLICT: "auth.err.migration",
    };
    return new Error(i18n.t(keys[error.code] || "auth.err.connection"));
  }

  async function register(username, password, email) {
    try {
      const response = await api.request("/auth/register", {
        method: "POST",
        auth: false,
        body: { username, password, email },
      });
      api.setToken(response.access_token);
      const legacy = await readMatchingLegacyAccount(username, password);
      try {
        await migrateLegacyCollection(legacy);
      } catch (error) {
        api.clearToken();
        throw error;
      }
      return response.username;
    } catch (error) {
      throw localizedError(error);
    }
  }

  async function login(username, password) {
    try {
      const response = await api.request("/auth/login", {
        method: "POST",
        auth: false,
        body: { username, password },
      });
      api.setToken(response.access_token);
      const legacy = await readMatchingLegacyAccount(username, password);
      try {
        await migrateLegacyCollection(legacy);
      } catch (migrationError) {
        api.clearToken();
        throw migrationError;
      }
      return response.username;
    } catch (error) {
      if (error.status === 401) {
        const legacy = await readMatchingLegacyAccount(username, password);
        if (legacy) {
          try {
            const response = await api.request("/auth/register", {
              method: "POST",
              auth: false,
              body: { username: legacy.username, password },
            });
            api.setToken(response.access_token);
            await migrateLegacyCollection(legacy);
            return response.username;
          } catch (migrationError) {
            if (migrationError.code === "USERNAME_TAKEN") {
              throw new Error(i18n.t("auth.err.password"));
            }
            throw localizedError(migrationError);
          }
        }
      }
      throw localizedError(error);
    }
  }

  async function currentUser() {
    if (!sessionStorage.getItem("aftercredits.api.session.v1")) return "";
    try {
      const response = await api.request("/auth/me");
      return response.username;
    } catch (error) {
      if (error.status === 401) api.clearToken();
      if (error.code === "API_UNAVAILABLE") throw localizedError(error);
      return "";
    }
  }

  async function getProfile() {
    return api.request("/auth/me");
  }

  async function updateProfile(changes) {
    return api.request("/auth/profile", { method: "PATCH", body: changes });
  }

  function suggestedUsername() {
    const normalized = localStorage.getItem(LEGACY_SESSION_KEY);
    return normalized
      ? readLegacyAccounts()[normalized]?.username || normalized
      : "";
  }

  async function logout() {
    try {
      await api.request("/auth/logout", { method: "POST" });
    } catch {
      // The local token is still cleared when the server cannot be reached.
    } finally {
      api.clearToken();
    }
  }

  window.AnimeTracker.auth = {
    register,
    login,
    currentUser,
    getProfile,
    updateProfile,
    suggestedUsername,
    logout,
  };
})();
