import type { Anime, AnimeEpisode, AnimeRootResponse } from "@/types/anime";
import { log } from "@/utils/logger";

let cachedData: { data: AnimeRootResponse; timestamp: number } | null = null;

async function updateAnimeEpisodes(anime: Anime): Promise<Anime> {
  if (anime.episodes === null) {
    log.info(
      `Fetching episodes for anime: ${anime.title_english || anime.title}`
    );
    const episodeCount = await fetchAnimeEpisodes(anime.mal_id);
    return { ...anime, episodes: episodeCount };
  }
  return anime;
}

async function updateAnimeListEpisodes(animeList: Anime[]): Promise<Anime[]> {
  const updatedAnime = await Promise.all(
    animeList.map(async (anime) => await updateAnimeEpisodes(anime))
  );
  return updatedAnime;
}

export async function fetchTopAnime() {
  if (cachedData && Date.now() - cachedData.timestamp < 1000 * 60 * 60) {
    const updatedData = await updateAnimeListEpisodes(cachedData.data.data);
    return { ...cachedData.data, data: updatedData };
  }

  log.info("Fetching top anime from Jikan API");

  const animeData = await fetch(
    "https://api.jikan.moe/v4/top/anime?limit=10"
  ).then((res) => {
    if (!res.ok) log.error("Failed to fetch anime details");
    return res.json() as Promise<AnimeRootResponse>;
  });

  const updatedData = await updateAnimeListEpisodes(animeData.data);
  const finalData = { ...animeData, data: updatedData };

  cachedData = {
    data: finalData,
    timestamp: Date.now(),
  };

  return finalData;
}

export async function fetchAnime(malId: number) {
  const response = await fetch(
    `https://api.jikan.moe/v4/anime/${malId}/full`
  ).then((res) => {
    if (!res.ok) log.error("Failed to fetch anime details");
    return res.json() as Promise<{ data: Anime }>;
  });

  // Update episodes if they're null
  const updatedAnime = await updateAnimeEpisodes(response.data);

  return { ...response, data: updatedAnime };
}

export async function searchAnime(query?: string) {
  const response = query
    ? await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`
      ).then((res) => {
        if (!res.ok) log.error("Failed to fetch search results");
        return res.json() as Promise<AnimeRootResponse>;
      })
    : await fetchTopAnime();

  if (!query) {
    return response;
  }

  const updatedData = await updateAnimeListEpisodes(response.data);
  return { ...response, data: updatedData };
}

export async function fetchAnimeEpisodes(malId: number) {
  const data = await fetch(
    `https://api.jikan.moe/v4/anime/${malId}/episodes`
  ).then(
    (res) =>
      res.json() as Promise<{
        data: AnimeEpisode[];
        pagination: { last_visible_page: number };
      }>
  );

  if (!data || !data.data || !data.pagination) {
    log.error("Failed to fetch anime episodes");
    return 0;
  }

  let episodes = data.data.length * (data.pagination.last_visible_page - 1);

  const lastPage = await fetch(
    `https://api.jikan.moe/v4/anime/${malId}/episodes?page=${data.pagination.last_visible_page}`
  ).then((res) => res.json() as Promise<{ data: AnimeEpisode[] }>);

  if (lastPage && lastPage.data) {
    episodes += lastPage.data.length;
  }

  return episodes;
}
