import type { Anime } from '@/types/anime';
import type { RecommendationCache } from '@/types/recommendations';

const RECOMMENDATION_CONFIG = {
  CACHE_DURATION_MS: 6 * 60 * 60 * 1000, // 6 hours
  ADMIN_CACHE_DURATION_MS: 0,
  API_DELAY_MS: 1000,
  MAX_RECOMMENDATIONS: 5,
  JIKAN_API_BASE: 'https://api.jikan.moe/v4',
  GROQ_API_BASE: 'https://api.groq.com/openai/v1'
} as const;

export default class RecommendationCacheService {
  static getCacheDuration(isAdmin: boolean): number {
    return isAdmin
      ? RECOMMENDATION_CONFIG.ADMIN_CACHE_DURATION_MS
      : RECOMMENDATION_CONFIG.CACHE_DURATION_MS;
  }

  static calculateTimeLeft(createdAt: Date, cacheDuration: number): number {
    const elapsed = Date.now() - createdAt.getTime();
    return Math.max(0, (cacheDuration - elapsed) / 1000);
  }

  static isCacheValid(createdAt: Date, cacheDuration: number): boolean {
    return Date.now() - createdAt.getTime() < cacheDuration;
  }

  static async getCache(db: any, userId: string): Promise<RecommendationCache | null> {
    return db.recommendation.findFirst({
      where: { userId }
    });
  }

  static async setCache(db: any, userId: string, data: Anime[]): Promise<void> {
    await db.recommendation.upsert({
      where: { userId },
      update: {
        data: JSON.stringify(data),
        createdAt: new Date()
      },
      create: {
        userId,
        data: JSON.stringify(data)
      }
    });
  }

  static async clearCache(db: any, userId: string): Promise<void> {
    await db.recommendation.deleteMany({
      where: { userId }
    });
  }
}
