import type { Anime } from './anime';

export interface RecommendationCache {
  id: string;
  userId: string;
  data: string;
  createdAt: Date;
}

export interface AIRecommendationResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface JikanAnimeResponse {
  data: Anime[];
}
