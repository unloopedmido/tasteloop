import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { Anime } from '@/types/anime';
import { env } from '@/env';
import RecommendationCacheService from '@/server/cache';
import AIRecommendationService from '@/server/ai';
import AnimeService from '@/server/anime';

export const animeRouter = createTRPCRouter({
  recommendations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const isAdmin = process.env.ADMIN_USERS?.split(',').includes(userId) ?? false;
    const cacheDuration = RecommendationCacheService.getCacheDuration(isAdmin);

    // Check cache first
    const cachedRecommendation = await RecommendationCacheService.getCache(ctx.db, userId);

    if (
      cachedRecommendation &&
      RecommendationCacheService.isCacheValid(cachedRecommendation.createdAt, cacheDuration)
    ) {
      const timeLeft = RecommendationCacheService.calculateTimeLeft(
        cachedRecommendation.createdAt,
        cacheDuration
      );

      return {
        recommendations: JSON.parse(cachedRecommendation.data),
        timeLeft,
        fromCache: true
      };
    }

    // Get user's anime preferences
    const userAnimes = await ctx.db.anime.findMany({
      where: { userId },
      select: {
        title: true,
        genres: true
      }
    });

    if (userAnimes.length === 0) {
      return {
        recommendations: [],
        timeLeft: cacheDuration / 1000,
        fromCache: false
      };
    }

    // Extract user preferences
    const watchedTitles = userAnimes.map((anime) => anime.title);
    const allGenres = userAnimes.flatMap((anime) => (anime.genres ? JSON.parse(anime.genres) : []));
    const uniqueGenres = [...new Set(allGenres)];

    try {
      // Get AI recommendations
      const aiRecommendations = await AIRecommendationService.getRecommendations(
        uniqueGenres,
        watchedTitles
      );

      // Fetch anime data from Jikan API
      const recommendationsWithData = await AnimeService.fetchMultipleAnimeData(aiRecommendations);

      // Cache the results
      if (recommendationsWithData.length > 0) {
        await RecommendationCacheService.setCache(ctx.db, userId, recommendationsWithData);
      }

      return {
        recommendations: recommendationsWithData,
        timeLeft: cacheDuration / 1000,
        fromCache: false
      };
    } catch (error) {
      console.error('Recommendation generation failed:', error);

      // Return cached data if available, even if expired
      if (cachedRecommendation) {
        return {
          recommendations: JSON.parse(cachedRecommendation.data),
          timeLeft: 0,
          fromCache: true,
          error: 'Using cached data due to service error'
        };
      }

      throw error;
    }
  }),

  userAnimes: protectedProcedure.query(({ ctx }) => {
    return ctx.db.anime.findMany({
      where: { userId: ctx.session.user.id }
    });
  }),

  remove: protectedProcedure
    .input(z.object({ malId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const anime = await ctx.db.anime.findFirst({
        where: { malId: input.malId, userId: ctx.session.user.id }
      });

      if (!anime) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Anime with ID ${input.malId} not found in your watchlist.`
        });
      }

      await ctx.db.anime.delete({
        where: { id: anime.id }
      });

      return { success: true, message: 'Anime removed from watchlist.' };
    }),

  save: protectedProcedure
    .input(
      z.object({
        malId: z.number(),
        status: z.enum(['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLANNING']),
        eps_watched: z.number().int(),
        score: z.number().min(0).max(10)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const animes = await ctx.db.anime.findMany({ where: { userId: ctx.session.user.id } });

      if (animes.some((anime) => anime.malId === input.malId)) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Anime already exists in your watchlist.'
        });
      }

      const res = await fetch(`https://api.jikan.moe/v4/anime/${input.malId}`).then(
        async (res) => (await res.json()) as { data: Anime }
      );
      const anime = res.data;
      if (!anime)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Anime with MAL ID ${input.malId} not found.`
        });

      if (input.eps_watched > (anime.episodes ?? 0)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Episodes watched cannot exceed total episodes (${anime.episodes ?? 0}).`
        });
      }

      const record = await ctx.db.anime.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          imageUrl: anime.images.jpg.large_image_url,
          title: anime.title,
          eps_total: anime.episodes ?? 0,
          year: anime.year ?? null,
          genres: anime.genres ? JSON.stringify(anime.genres.map((g) => g.name)) : null
        }
      });

      return { success: true, record };
    })
});
