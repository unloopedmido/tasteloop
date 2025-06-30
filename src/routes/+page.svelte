<script>
	import * as Button from '$lib/components/ui/button';
	import Home from '@lucide/svelte/icons/home';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
</script>

<div class="flex h-[calc(100vh-100px)] flex-col items-center justify-center">
	<h1 class="text-center text-5xl font-extrabold">Under Construction!</h1>
	<p class="mt-4 text-center text-lg">
		This page is currently under construction. Please check back later.
	</p>
	<div class="mt-8 flex justify-center gap-6">
		<a class={Button.buttonVariants()} href="/">
			<Home class="mr-2 h-4 w-4" />
			Go Home
		</a>
		<Button.Root variant="outline" onclick={() => window.location.reload()}>
			<RefreshCcw class="mr-2 h-4 w-4" />
			Try Again
		</Button.Root>
	</div>
</div>
