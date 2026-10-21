window.AnimeTracker = window.AnimeTracker || {};

(() => {
  const { api, i18n } = window.AnimeTracker;

  function localizedError(error) {
    if (error.status === 401) {
      api.clearToken();
      return new Error(i18n.t("collection.err.session"));
    }
    const key =
      error.code === "DUPLICATE_TITLE"
        ? "duplicate"
        : "collection.err.connection";
    return new Error(i18n.t(key));
  }

  async function request(path, options) {
    try {
      return await api.request(path, options);
    } catch (error) {
      throw localizedError(error);
    }
  }

  function load() {
    return request("/collection");
  }

  function add(item) {
    return request("/collection", { method: "POST", body: item });
  }

  function update(id, changes) {
    return request(`/collection/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: changes,
    });
  }

  function remove(id) {
    return request(`/collection/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  window.AnimeTracker.storage = { load, add, update, remove };
})();
