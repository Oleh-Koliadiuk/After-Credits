window.AnimeTracker = window.AnimeTracker || {};

(() => {
  const API_URL = "https://graphql.anilist.co";
  const REQUEST_TIMEOUT_MS = 8_000;
  const SEARCH_QUERY = `
    query SearchAnime($search: String!) {
      Page(page: 1, perPage: 24) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
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
  const FEATURED_QUERY = `
    query FeaturedAnime {
      Page(page: 1, perPage: 5) {
        media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
          title { english romaji }
          bannerImage
          coverImage { extraLarge large }
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
        const error = new Error(`AniList returned ${response.status}.`);
        error.code = response.status === 429 ? "SEARCH_BUSY" : "SEARCH_FAILED";
        throw error;
      }

      const payload = await response.json();
      if (payload.errors?.length) {
        const error = new Error("AniList could not search these titles.");
        error.code = "SEARCH_FAILED";
        throw error;
      }
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
        const timeoutError = new Error("AniList search timed out.");
        timeoutError.code = "SEARCH_TIMEOUT";
        throw timeoutError;
      }
      if (error instanceof TypeError) {
        const networkError = new Error("AniList could not be reached.");
        networkError.code = "SEARCH_FAILED";
        throw networkError;
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortRequest);
    }
  }

  async function featured() {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5_000);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: FEATURED_QUERY }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Featured titles unavailable.");
      const payload = await response.json();
      if (payload.errors?.length)
        throw new Error("Featured titles unavailable.");
      return (payload.data?.Page?.media || [])
        .map((anime) => ({
          title: anime.title?.english || anime.title?.romaji || "Anime",
          imageUrl:
            anime.bannerImage ||
            anime.coverImage?.extraLarge ||
            anime.coverImage?.large ||
            "",
        }))
        .filter((anime) => anime.imageUrl);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  window.AnimeTracker.animeApi = { search, featured };
})();
