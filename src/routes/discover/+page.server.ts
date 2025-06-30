import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { AnimeRootResponse } from '$lib/types/anime';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await locals.auth();

	if (!user || !user.user) {
		throw redirect(302, '/auth/signin');
	}

	const animes = await fetch('https://api.jikan.moe/v4/top/anime').then(
		(res) => res.json() as Promise<AnimeRootResponse>
	);

	return {
		animes: animes.data
	};
};
