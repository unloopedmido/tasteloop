import type { Anime, AnimeRootResponse } from '@/types/anime';
import type { JikanAnimeResponse } from '@/types/recommendations';

export async function fetchAnimeDetails(animeId: string) {
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

const RECOMMENDATION_CONFIG = {
  CACHE_DURATION_MS: 6 * 60 * 60 * 1000, // 6 hours
  ADMIN_CACHE_DURATION_MS: 0,
  API_DELAY_MS: 1000,
  MAX_RECOMMENDATIONS: 5,
  JIKAN_API_BASE: 'https://api.jikan.moe/v4',
  GROQ_API_BASE: 'https://api.groq.com/openai/v1'
} as const;

export default class AnimeService {
  private static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async fetchAnimeData(title: string): Promise<Anime | null> {
    try {
      const response = await fetch(
        `${RECOMMENDATION_CONFIG.JIKAN_API_BASE}/anime?q=${encodeURIComponent(title)}&limit=1`
      );

      if (!response.ok) {
        console.warn(`Failed to fetch anime data for "${title}": ${response.status}`);
        return null;
      }

      const data: JikanAnimeResponse = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error(`Error fetching anime data for "${title}":`, error);
      return null;
    }
  }

  static async fetchMultipleAnimeData(titles: string[]): Promise<Anime[]> {
    const results: Anime[] = [];

    for (const title of titles) {
      const anime = await this.fetchAnimeData(title);
      if (anime) {
        results.push(anime);
      }

      // Rate limiting for Jikan API
      await this.delay(RECOMMENDATION_CONFIG.API_DELAY_MS);
    }

    return results;
  }
}
