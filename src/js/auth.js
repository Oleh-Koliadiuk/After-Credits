window.AnimeTracker = window.AnimeTracker || {};

(() => {
  const i18n = window.AnimeTracker.i18n;
  const ACCOUNTS_KEY = "aftercredits.accounts.v1";
  const SESSION_KEY = "aftercredits.session.v1";
  const ITERATIONS = 210_000;

  function readAccounts() {
    try {
      const value = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value)
        ? value
        : {};
    } catch {
      return {};
    }
  }

  function toBase64(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
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
    return toBase64(bits);
  }

  async function register(username, password) {
    const normalized = username.trim().toLocaleLowerCase();
    if (!/^[a-z0-9_.-]{3,30}$/.test(normalized))
      throw new Error(i18n.t("auth.err.username"));
    if (password.length < 8) throw new Error(i18n.t("auth.err.passwordLength"));
    const accounts = readAccounts();
    if (accounts[normalized]) throw new Error(i18n.t("auth.err.exists"));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    accounts[normalized] = {
      username: username.trim(),
      salt: toBase64(salt),
      passwordHash: await derive(password, salt),
    };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    localStorage.setItem(SESSION_KEY, normalized);
    return accounts[normalized].username;
  }

  async function login(username, password) {
    const normalized = username.trim().toLocaleLowerCase();
    const account = readAccounts()[normalized];
    if (!account) throw new Error(i18n.t("auth.err.missing"));
    const candidate = await derive(password, fromBase64(account.salt));
    if (candidate !== account.passwordHash)
      throw new Error(i18n.t("auth.err.password"));
    localStorage.setItem(SESSION_KEY, normalized);
    return account.username;
  }

  function currentUser() {
    const normalized = localStorage.getItem(SESSION_KEY);
    return normalized ? readAccounts()[normalized]?.username || "" : "";
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  window.AnimeTracker.auth = { register, login, currentUser, logout };
})();
