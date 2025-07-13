import { env } from '@/env';
import type { AIRecommendationResponse } from '@/types/recommendations';
import { TRPCError } from '@trpc/server';

const RECOMMENDATION_CONFIG = {
  CACHE_DURATION_MS: 6 * 60 * 60 * 1000, // 6 hours
  ADMIN_CACHE_DURATION_MS: 0,
  API_DELAY_MS: 1000,
  MAX_RECOMMENDATIONS: 5,
  JIKAN_API_BASE: 'https://api.jikan.moe/v4',
  GROQ_API_BASE: 'https://api.groq.com/openai/v1'
} as const;

export default class AIRecommendationService {
  private static readonly SYSTEM_PROMPT = `
    You're an anime expert. Output EXACTLY 5 anime titles in a JSON array format.
    Requirements:
    • Match genres and popularity to the user's preferences
    • Do NOT include any title from the exclude list
    • Return only popular, well-known anime
    • Ensure variety in recommendations
    
    Example response format: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]
  `.trim();

  static async getRecommendations(genres: string[], excludeTitles: string[]): Promise<string[]> {
    const messages = [
      {
        role: 'system',
        content: this.SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: `
          Preferred genres: [${genres.join(', ')}]
          Exclude these titles: [${excludeTitles.join(', ')}]
        `.trim()
      }
    ];

    const response = await fetch(`${RECOMMENDATION_CONFIG.GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 150,
        messages
      })
    });

    if (!response.ok) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `AI service error: ${response.status}`
      });
    }

    const data: AIRecommendationResponse = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No content received from AI service'
      });
    }

    try {
      const recommendations = JSON.parse(content);

      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error('Invalid format');
      }

      return recommendations.slice(0, RECOMMENDATION_CONFIG.MAX_RECOMMENDATIONS);
    } catch (error) {
      console.error('Failed to parse AI recommendations:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process AI recommendations'
      });
    }
  }
}
