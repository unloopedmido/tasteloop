import type { Anime, AnimeRootResponse } from '$lib/types/anime';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { saveSchema } from './schema';
import { prisma } from '$lib/db';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ locals }) => {
  const user = await locals.auth();

  if (!user || !user.user) {
    throw redirect(302, '/auth/signin');
  }

  const animes = await fetch('https://api.jikan.moe/v4/top/anime').then(
    (res) => res.json() as Promise<AnimeRootResponse>
  );

  const userAnimes = await prisma.anime.findMany({ where: { userId: user.user.id } });

  return {
    animes: animes.data,
    userAnimes,
    form: await superValidate(zod(saveSchema))
  };
};

export const actions: Actions = {
  default: async (event) => {
    console.log('Form Submitted');
    const userAuth = await event.locals.auth();
    if (!userAuth?.user) {
      return fail(401, { error: 'User not authenticated' });
    }

    const animes = await prisma.anime.findMany({ where: { userId: userAuth.user.id } });

    const form = await superValidate(event, zod(saveSchema));
    if (!form.valid) {
      return fail(400, { error: 'Invalid form data', form });
    }

    const malId = form.data.malId;

    if (animes.some((anime) => anime.malId === malId)) {
      return fail(400, { error: 'Anime already exists in your watchlist' });
    }

    const { status, startDate, endDate, eps_watched, score } = form.data;

    let animeData: Anime;
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      animeData = (await res.json()).data;
    } catch {
      return fail(502, { error: 'Failed to fetch anime info' });
    }

    if (eps_watched > (animeData.episodes ?? 0)) {
      return fail(400, { error: 'Episodes watched cannot exceed total episodes' });
    }

    const record = await prisma.anime.create({
      data: {
        malId,
        userId: userAuth.user.id,
        imageUrl: animeData.images.jpg.large_image_url,
        title: animeData.title,
        status,
        startDate,
        endDate,
        eps_total: animeData.episodes,
        eps_watched,
        score
      }
    });

    return { success: true, record };
  }
};
