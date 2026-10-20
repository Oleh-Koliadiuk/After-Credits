window.AnimeTracker = window.AnimeTracker || {};

(() => {
  function formatDate(value) {
    if (!value) return window.AnimeTracker.i18n.t("dateNotSet");
    return new Intl.DateTimeFormat(window.AnimeTracker.i18n.language, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));
  }

  function createCard(item, onRemove, onChangeStatus, onEditNotes) {
    const card = document.createElement("article");
    card.className = "anime-card";
    const art = document.createElement("div");
    art.className = "card-art";
    art.setAttribute("aria-hidden", "true");
    const artMark = document.createElement("span");
    artMark.textContent = "✳";
    art.append(artMark);
    if (item.imageUrl) {
      const poster = document.createElement("img");
      poster.src = item.imageUrl;
      poster.alt = "";
      poster.loading = "lazy";
      poster.referrerPolicy = "no-referrer";
      art.append(poster);
      artMark.hidden = true;
    }

    const details = document.createElement("div");
    details.className = "card-details";
    const meta = document.createElement("div");
    meta.className = "card-meta";
    const finished = document.createElement("span");
    finished.textContent = formatDate(item.watchedAt);
    meta.append(finished);
    if (item.rating) {
      const rating = document.createElement("span");
      rating.className = "card-rating";
      rating.textContent = `★ ${Number(item.rating).toFixed(1)}`;
      meta.append(rating);
    }

    const title = document.createElement("h3");
    title.textContent = item.title;
    const status = document.createElement("select");
    status.className = `card-status status-${item.status}`;
    status.setAttribute(
      "aria-label",
      window.AnimeTracker.i18n.t("statusForTitle", { title: item.title }),
    );
    for (const statusKey of ["watched", "watching", "planned"]) {
      const option = document.createElement("option");
      option.value = statusKey;
      option.textContent = window.AnimeTracker.i18n.t(`status.${statusKey}`);
      option.selected = item.status === statusKey;
      status.append(option);
    }
    status.addEventListener("change", () =>
      onChangeStatus(item.id, status.value),
    );
    const note = document.createElement("p");
    note.className = "card-note";
    note.hidden = !item.notes;
    note.textContent = item.notes || "";
    const actions = document.createElement("div");
    actions.className = "card-actions";
    const editNote = document.createElement("button");
    editNote.type = "button";
    editNote.className = "note-button";
    editNote.textContent = window.AnimeTracker.i18n.t(
      item.notes ? "editNote" : "addNote",
    );
    editNote.addEventListener("click", () => onEditNotes(item));
    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = window.AnimeTracker.i18n.t("remove");
    remove.setAttribute(
      "aria-label",
      window.AnimeTracker.i18n.t("removeTitle", { title: item.title }),
    );
    remove.addEventListener("click", () => onRemove(item.id));
    actions.append(editNote, remove);
    details.append(meta, status, title, note, actions);
    card.append(art, details);
    return card;
  }

  function render(
    items,
    query,
    statusFilter,
    onRemove,
    onChangeStatus,
    onEditNotes,
  ) {
    const grid = document.querySelector("#anime-grid");
    const emptyState = document.querySelector("#empty-state");
    const visibleItems = window.AnimeTracker.collection.filter(
      items,
      query,
      statusFilter,
    );
    grid.replaceChildren(
      ...visibleItems.map((item) =>
        createCard(item, onRemove, onChangeStatus, onEditNotes),
      ),
    );
    emptyState.hidden = visibleItems.length > 0;
    grid.hidden = visibleItems.length === 0;
    if (visibleItems.length === 0 && items.length > 0) {
      const emptyKey =
        statusFilter === "all" ? "emptyFilter" : `emptyStatus.${statusFilter}`;
      document.querySelector("#empty-title").textContent =
        window.AnimeTracker.i18n.t(emptyKey);
      document.querySelector("#empty-description").textContent =
        window.AnimeTracker.i18n.t("emptyStatusDescription");
      document.querySelector("#empty-kicker").textContent =
        window.AnimeTracker.i18n.t("statusSection");
    } else {
      document.querySelector("#empty-title").textContent =
        window.AnimeTracker.i18n.t("emptyTitle");
      document.querySelector("#empty-description").textContent =
        window.AnimeTracker.i18n.t("emptyDescription");
      document.querySelector("#empty-kicker").textContent =
        window.AnimeTracker.i18n.t("newChapter");
    }

    const stats = window.AnimeTracker.collection.getStats(items);
    document.querySelector("#completed-count").textContent = String(
      stats.statusCounts.watched,
    ).padStart(2, "0");
    document.querySelector("#nav-count").textContent = stats.count;
    document.querySelector("#list-count").textContent =
      window.AnimeTracker.i18n.formatCount(visibleItems.length);
    document.querySelector("#completed-count").nextElementSibling.textContent =
      window.AnimeTracker.i18n.titleUnit(stats.statusCounts.watched);
    document.querySelector("#collection-list-title").textContent =
      statusFilter === "all"
        ? window.AnimeTracker.i18n.t("collectionTitles")
        : window.AnimeTracker.i18n.t(`status.${statusFilter}`);
    document.querySelector("#average-rating").textContent = stats.averageRating;
    document.querySelector("#latest-date").textContent = stats.latestDate
      ? formatDate(stats.latestDate)
      : "—";
    const counts = { all: stats.count, ...stats.statusCounts };
    document.querySelectorAll("[data-status-filter]").forEach((button) => {
      const key = button.dataset.statusFilter;
      const count = button.querySelector(".filter-count");
      if (count) count.textContent = String(counts[key] || 0);
      button.classList.toggle("active", key === statusFilter);
      button.setAttribute("aria-pressed", String(key === statusFilter));
    });
  }

  function renderSuggestions(results, onSelect) {
    const list = document.querySelector("#anime-suggestions");
    const input = document.querySelector("#anime-title");
    list.replaceChildren();
    for (const anime of results) {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "anime-suggestion";
      option.setAttribute("role", "option");
      const poster = document.createElement("img");
      poster.className = "suggestion-poster";
      poster.alt = window.AnimeTracker.i18n.t("posterFor", {
        title: anime.title,
      });
      poster.loading = "lazy";
      if (anime.imageUrl) poster.src = anime.imageUrl;
      const copy = document.createElement("span");
      copy.className = "suggestion-copy";
      const title = document.createElement("strong");
      title.textContent = anime.title;
      const meta = document.createElement("span");
      meta.textContent = [
        anime.year,
        window.AnimeTracker.i18n.t(`format.${anime.type}`),
      ]
        .filter(Boolean)
        .join(" · ");
      const score = document.createElement("span");
      score.className = "suggestion-score";
      score.textContent = anime.score ? `★ ${anime.score}` : "";
      copy.append(title, meta, score);
      option.append(poster, copy);
      option.addEventListener("click", () => onSelect(anime));
      list.append(option);
    }
    list.hidden = results.length === 0;
    input.setAttribute("aria-expanded", String(results.length > 0));
  }

  function setSearchStatus(message) {
    document.querySelector("#search-status").textContent = message;
  }

  window.AnimeTracker.view = { render, renderSuggestions, setSearchStatus };
})();
