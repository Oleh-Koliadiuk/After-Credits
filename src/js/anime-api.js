window.AnimeTracker = window.AnimeTracker || {};

(() => {
  const API_URL = "https://graphql.anilist.co";
  const REQUEST_TIMEOUT_MS = 8_000;
  const SEARCH_QUERY = `
    query SearchAnime($search: String!) {
      Page(page: 1, perPage: 24) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          idMal
          title { romaji english native }
          synonyms
          coverImage { large }
          startDate { year }
          format
          episodes
          averageScore
        }
      }
    }
  `;

  const scripts = [
    /\p{Script=Cyrillic}/u,
    /\p{Script=Hiragana}/u,
    /\p{Script=Katakana}/u,
    /\p{Script=Han}/u,
    /\p{Script=Hangul}/u,
    /\p{Script=Arabic}/u,
    /\p{Script=Hebrew}/u,
    /\p{Script=Thai}/u,
    /\p{Script=Devanagari}/u,
    /\p{Script=Greek}/u,
  ];

  function chooseTitle(anime, query) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const synonyms = anime.synonyms || [];
    const exactSynonym = synonyms.find(
      (title) => title.toLocaleLowerCase() === normalizedQuery,
    );
    if (exactSynonym) return exactSynonym;
    const script = scripts.find((expression) => expression.test(query));
    if (script) {
      const matchingSynonym = synonyms.find((title) => script.test(title));
      if (matchingSynonym) return matchingSynonym;
      if (anime.title?.native && script.test(anime.title.native))
        return anime.title.native;
    }
    return (
      anime.title?.english ||
      anime.title?.romaji ||
      anime.title?.native ||
      "Untitled anime"
    );
  }

  async function search(query, signal) {
    const requestController = new AbortController();
    const abortRequest = () => requestController.abort();
    if (signal?.aborted) abortRequest();
    else signal?.addEventListener("abort", abortRequest, { once: true });
    const timeoutId = window.setTimeout(
      () => requestController.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: { search: query },
        }),
        signal: requestController.signal,
      });
      if (!response.ok) {
        if (response.status === 429)
          throw new Error("Search is busy. Try again in a moment.");
        throw new Error(
          `The search service returned an error (${response.status}). Try again.`,
        );
      }

      const payload = await response.json();
      if (payload.errors?.length)
        throw new Error("Could not search anime titles. Try again.");
      return (payload.data?.Page?.media || []).map((anime) => ({
        id: anime.idMal || null,
        title: chooseTitle(anime, query),
        originalTitle: anime.title?.romaji || "",
        imageUrl: anime.coverImage?.large || "",
        year: anime.startDate?.year || "",
        type: anime.format || "Anime",
        episodes: anime.episodes || "?",
        score: anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null,
      }));
    } catch (error) {
      if (signal?.aborted) throw error;
      if (requestController.signal.aborted) {
        throw new Error(
          "Search took too long. Check your connection and try again.",
        );
      }
      if (error instanceof TypeError) {
        throw new Error(
          "Couldn’t load titles. Check your connection and try again.",
        );
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortRequest);
    }
  }

  window.AnimeTracker.animeApi = { search };
})();
