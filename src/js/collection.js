window.AnimeTracker = window.AnimeTracker || {};

(() => {
  const STATUSES = ["watched", "watching", "planned"];

  function add(
    items,
    { title, rating, watchedAt, malId, imageUrl, status, notes },
  ) {
    const i18n = window.AnimeTracker.i18n;
    const normalizedTitle = title.trim();
    if (!normalizedTitle) throw new Error(i18n.t("enterTitle"));
    if (
      items.some(
        (item) =>
          item.title.toLocaleLowerCase() ===
          normalizedTitle.toLocaleLowerCase(),
      )
    ) {
      throw new Error(i18n.t("duplicate"));
    }
    const score = rating === "" || rating === null ? null : Number(rating);
    if (
      score !== null &&
      (!Number.isFinite(score) ||
        score < 1 ||
        score > 10 ||
        !Number.isInteger(score * 2))
    ) {
      throw new Error(i18n.t("ratingError"));
    }

    return [
      {
        id: crypto.randomUUID(),
        title: normalizedTitle,
        rating: score,
        watchedAt,
        status: STATUSES.includes(status) ? status : "watched",
        notes: typeof notes === "string" ? notes.trim().slice(0, 2000) : "",
        malId: malId || null,
        imageUrl: imageUrl || "",
      },
      ...items,
    ];
  }

  function remove(items, id) {
    return items.filter((item) => item.id !== id);
  }

  function updateStatus(items, id, status) {
    if (!STATUSES.includes(status)) return items;
    return items.map((item) => (item.id === id ? { ...item, status } : item));
  }

  function updateNotes(items, id, notes) {
    return items.map((item) =>
      item.id === id
        ? {
            ...item,
            notes: String(notes || "")
              .trim()
              .slice(0, 2000),
          }
        : item,
    );
  }

  function filter(items, query, status = "all") {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return items.filter((item) => {
      const matchesTitle = item.title
        .toLocaleLowerCase()
        .includes(normalizedQuery);
      const matchesStatus = status === "all" || item.status === status;
      return matchesTitle && matchesStatus;
    });
  }

  function getStats(items) {
    const ratings = items
      .map((item) => Number(item.rating))
      .filter((rating) => Number.isFinite(rating) && rating > 0);
    const latest =
      items
        .map((item) => item.watchedAt)
        .filter(Boolean)
        .sort()
        .at(-1) || "";
    return {
      count: items.length,
      statusCounts: {
        watched: items.filter((item) => item.status === "watched").length,
        watching: items.filter((item) => item.status === "watching").length,
        planned: items.filter((item) => item.status === "planned").length,
      },
      averageRating: ratings.length
        ? (
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          ).toFixed(1)
        : "—",
      latestDate: latest,
    };
  }

  window.AnimeTracker.collection = {
    add,
    remove,
    updateStatus,
    updateNotes,
    filter,
    getStats,
  };
})();
