window.AnimeTracker = window.AnimeTracker || {};

(() => {
  const STORAGE_KEY = "aftercredits.anime.v1";

  function keyFor(username) {
    return `${STORAGE_KEY}:${username.toLocaleLowerCase()}`;
  }

  function load(username) {
    try {
      const saved = JSON.parse(localStorage.getItem(keyFor(username)) || "[]");
      return Array.isArray(saved)
        ? saved
            .filter(
              (item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.title === "string",
            )
            .map((item) => ({
              ...item,
              status: ["watched", "watching", "planned"].includes(item.status)
                ? item.status
                : "watched",
              notes: typeof item.notes === "string" ? item.notes : "",
            }))
        : [];
    } catch {
      return [];
    }
  }

  function save(username, items) {
    localStorage.setItem(keyFor(username), JSON.stringify(items));
  }

  window.AnimeTracker.storage = { load, save };
})();
