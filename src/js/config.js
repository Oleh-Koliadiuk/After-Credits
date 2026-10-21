window.AnimeTrackerConfig = window.AnimeTrackerConfig || {};

(() => {
  const hostname = window.location.hostname;
  const isLocal = ["localhost", "127.0.0.1", "0.0.0.0"].includes(hostname);
  window.AnimeTrackerConfig.apiBaseUrl ||= isLocal
    ? "http://127.0.0.1:8001/api"
    : "/api";
})();
