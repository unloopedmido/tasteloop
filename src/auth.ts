import { prisma } from '$lib/db';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { SvelteKitAuth } from '@auth/sveltekit';
import Discord from '@auth/sveltekit/providers/discord';

export const { handle } = SvelteKitAuth({
	adapter: PrismaAdapter(prisma),
	providers: [Discord]
});
