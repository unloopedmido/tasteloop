<script lang="ts">
	import { page } from '$app/state';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Home from '@lucide/svelte/icons/home';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';

	const errors = {
		404: {
			title: 'Page Not Found',
			description: "The page you're looking for doesn't exist or has been moved."
		},
		500: {
			title: 'Internal Server Error',
			description: 'We encountered an internal error. Our team has been notified.'
		},
		403: {
			title: 'Access Forbidden',
			description: "You don't have permission to access this resource."
		},
		400: {
			title: 'Bad Request',
			description: 'The request could not be understood by the server due to malformed syntax.'
		},
		401: {
			title: 'Unauthorized',
			description: 'You must authenticate to access this resource.'
		}
	};
</script>

<div class="flex h-[calc(100vh-100px)] flex-col items-center justify-center">
	<h1 class="text-center text-5xl font-extrabold">
		{errors[page.status as keyof typeof errors]?.title || 'Unknown Error'}
	</h1>
	<p class="mt-4 text-center text-lg">
		{errors[page.status as keyof typeof errors]?.description || 'An unexpected error occurred.'}
	</p>
	<div class="mt-8 flex justify-center gap-6">
		<a class={buttonVariants()} href="/">
			<Home class="mr-2 h-4 w-4" />
			Go Home
		</a>
		<Button variant="outline" onclick={() => window.location.reload()}>
			<RefreshCcw class="mr-2 h-4 w-4" />
			Try Again
		</Button>
	</div>
</div>
