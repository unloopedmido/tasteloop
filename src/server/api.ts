import type { Anime, AnimeRootResponse } from '@/types/anime';

export default async function fetchAnimeDetails(animeId: string) {
  console.log(`[API] Fetching details for anime ID: ${animeId} from Jikan API`);
  return fetch(`https://api.jikan.moe/v4/anime/${encodeURIComponent(animeId)}/full`)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch anime details');
      return res.json();
    })
    .then((json: { data: Anime }) => json.data);
}

export async function fetchTopAnime() {
  console.log('[API] Fetching top anime from Jikan API');
  return fetch('https://api.jikan.moe/v4/top/anime')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch anime details');
      return res.json();
    })
    .then((data: AnimeRootResponse) => data.data);
}

const animeCache = new Map<string, { data: Anime; expiresAt: number }>();

export function getCachedAnime(id: string): Anime | null {
  const cached = animeCache.get(id);
  if (!cached || cached.expiresAt < Date.now()) {
    animeCache.delete(id);
    return null;
  }
  return cached.data;
}

export function setCachedAnime(id: string, data: Anime) {
  animeCache.set(id, {
    data,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
}
