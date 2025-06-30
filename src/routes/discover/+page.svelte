<script lang="ts">
	import type { Anime } from '$lib/types/anime';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselNext,
		CarouselPrevious
	} from '$lib/components/ui/carousel';
	import TV from '@lucide/svelte/icons/tv';
	import Star from '@lucide/svelte/icons/star';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Play from '@lucide/svelte/icons/play';
	import Heart from '@lucide/svelte/icons/heart';
	import TrendingUp from '@lucide/svelte/icons/trending-up';

	export let data: {
		animes: Anime[];
	};

	// Get top 5 animes for featured carousel (assuming they're sorted by score or popularity)
	$: featuredAnimes = data.animes.slice(0, 5);
	$: catalogAnimes = data.animes.slice(5);
</script>

<div class="bg-background min-h-screen">
	<!-- Compact header section -->
	<div class="bg-muted/20 border-b">
		<div class="container mx-auto px-6 py-8">
			<div class="mx-auto max-w-2xl text-center">
				<h1 class="mb-2 text-3xl font-bold tracking-tight">Discover Anime</h1>
				<p class="text-muted-foreground">
					Explore curated collections and find your next favorite series
				</p>
			</div>
		</div>
	</div>

	<!-- Featured animes carousel section -->
	<div class="container mx-auto px-6 py-8">
		<div class="mb-6 flex items-center gap-3">
			<TrendingUp class="text-primary h-5 w-5" />
			<h2 class="text-xl font-semibold">Featured This Week</h2>
			<Badge variant="secondary" class="text-xs">Top Rated</Badge>
		</div>

		<!-- Carousel implementation with featured animes -->
		<Carousel class="w-full">
			<CarouselContent class="-ml-2 md:-ml-4">
				{#each featuredAnimes as anime}
					<CarouselItem class="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3">
						<div
							class="group bg-muted/30 hover:border-primary/20 relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-lg"
						>
							<div class="flex">
								<!-- Compact image on the left -->
								<div class="relative w-24 flex-shrink-0">
									<img
										src={anime.images.jpg.large_image_url}
										alt={anime.title}
										class="aspect-[3/4] w-full object-cover"
									/>
									{#if anime.score}
										<div
											class="bg-primary text-primary-foreground absolute top-1 right-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium"
										>
											<Star class="h-2.5 w-2.5 fill-current" />
											{anime.score}
										</div>
									{/if}
								</div>

								<!-- Content area with all essential information visible -->
								<div class="min-w-0 flex-1 p-4">
									<div class="space-y-2">
										<h3 class="line-clamp-2 text-sm leading-tight font-semibold">
											{anime.title}
										</h3>

										<!-- Always visible metadata -->
										<div class="text-muted-foreground flex items-center gap-3 text-xs">
											{#if anime.episodes}
												<div class="flex items-center gap-1">
													<TV class="h-3 w-3" />
													<span>{anime.episodes} eps</span>
												</div>
											{/if}
											{#if anime.year}
												<div class="flex items-center gap-1">
													<Calendar class="h-3 w-3" />
													<span>{anime.year}</span>
												</div>
											{/if}
										</div>

										<!-- Status and type badges -->
										<div class="flex items-center gap-2">
											<Badge variant="secondary" class="text-xs">
												{anime.status}
											</Badge>
											{#if anime.type}
												<Badge variant="outline" class="text-xs">
													{anime.type}
												</Badge>
											{/if}
										</div>

										<!-- Action buttons that appear on hover -->
										<div
											class="flex gap-2 pt-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
										>
											<Button size="sm" class="h-7 gap-1 text-xs">
												<Play class="h-3 w-3" />
												Watch
											</Button>
											<Button variant="outline" size="sm" class="h-7 gap-1 text-xs">
												<Heart class="h-3 w-3" />
												Save
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</CarouselItem>
				{/each}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	</div>

	<!-- Main catalog section with uniform, information-rich grid -->
	<div class="container mx-auto px-6 pb-12">
		<div class="mb-6">
			<h2 class="mb-2 text-xl font-semibold">All Series</h2>
			<p class="text-muted-foreground text-sm">Browse our complete collection</p>
		</div>

		<!-- Clean, uniform grid with all information visible -->
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each catalogAnimes as anime}
				<div class="group space-y-3">
					<!-- Image container with consistent aspect ratio -->
					<div class="bg-muted relative overflow-hidden rounded-lg">
						<img
							src={anime.images.jpg.large_image_url}
							alt={anime.title}
							class="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>

						<!-- Score badge always visible -->
						{#if anime.score}
							<div
								class="bg-background/90 text-foreground absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-sm"
							>
								<Star class="fill-primary text-primary h-3 w-3" />
								{anime.score}
							</div>
						{/if}

						<!-- Hover overlay with action -->
						<div
							class="bg-background/80 absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
						>
							<Button size="sm" class="gap-2">
								<Play class="h-4 w-4" />
								Watch
							</Button>
						</div>
					</div>

					<!-- Title and metadata always visible below image -->
					<div class="space-y-2">
						<h3 class="line-clamp-2 text-sm leading-tight font-medium">
							{anime.title}
						</h3>

						<!-- Essential info always shown -->
						<div class="space-y-1">
							<div class="text-muted-foreground flex items-center justify-between text-xs">
								<div class="flex items-center gap-2">
									{#if anime.episodes}
										<span>{anime.episodes} eps</span>
									{/if}
									{#if anime.year}
										<span>• {anime.year}</span>
									{/if}
								</div>
							</div>

							<!-- Status and type in a clean row -->
							<div class="flex items-center gap-1.5">
								<Badge variant="secondary" class="px-2 py-0 text-xs">
									{anime.status}
								</Badge>
								{#if anime.type}
									<Badge variant="outline" class="px-2 py-0 text-xs">
										{anime.type}
									</Badge>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Load more section -->
		<div class="mt-12 text-center">
			<Button variant="outline" size="lg">Load More Series</Button>
		</div>
	</div>
</div>
