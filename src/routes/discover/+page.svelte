<script lang="ts">
  import * as Carousel from '$lib/components/ui/carousel';
  import * as Button from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Badge } from '$lib/components/ui/badge';
  import { cn } from '$lib/utils';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Bookmark from '@lucide/svelte/icons/bookmark';
  import Play from '@lucide/svelte/icons/play';
  import Form from './form.svelte';
  import type { PageData } from './$types.js';

  let { data }: { data: PageData } = $props();

  const featured = data.animes.slice(0, 5);
  const rest = data.animes.slice(5);

  const categories = {
    all: rest,
    popular: rest.slice(0, 8),
    recent: rest.filter((anime) => anime.year && anime.year >= 2021).slice(0, 8)
  };
</script>

<section class="py-15">
  <div class="container mx-auto px-4">
    <div class="mb-8 flex flex-col space-y-2">
      <h1 class="text-4xl font-bold tracking-tight md:text-5xl">Featured Anime</h1>
      <p class="text-muted-foreground text-lg">
        Discover the latest and greatest series curated just for you
      </p>
    </div>

    <Carousel.Root class="w-full">
      <Carousel.Content class="-ml-4">
        {#each featured as anime}
          <Carousel.Item class="pl-4 md:basis-1/2 lg:basis-1/3">
            <Card.Root
              class="overflow-hidden border-0 pt-0 shadow-lg transition-all hover:scale-99"
            >
              <div class="relative">
                <img
                  src={anime.images.jpg.large_image_url}
                  alt={anime.title}
                  class="h-[250px] w-full object-cover"
                />
                {#if anime.airing}
                  <Badge
                    class="bg-primary/90 text-primary-foreground absolute top-3 right-3 px-2 py-1"
                  >
                    Now Airing
                  </Badge>
                {/if}
              </div>
              <Card.Content class="p-5">
                <h3 class="mb-2 truncate text-xl leading-tight font-bold">
                  {anime.title}
                </h3>
                <div class="text-muted-foreground mb-4 flex items-center gap-3 text-sm">
                  <span class="flex items-center gap-1">
                    <span class="text-primary">{anime.score || 'N/A'}</span>
                    <span class="text-xs">/ 10</span>
                  </span>
                  <span>•</span>
                  <span>{anime.year || 'Unknown'}</span>
                  <span>•</span>
                  <span>{anime.episodes || '?'} episodes</span>
                </div>

                {#if anime.genres && anime.genres.length}
                  <div class="mb-4 flex flex-wrap gap-2">
                    {#each anime.genres.slice(0, 3) as genre}
                      <Badge variant="outline" class="bg-secondary/30">{genre.name}</Badge>
                    {/each}
                  </div>
                {/if}

                <div class="mt-4 flex gap-3">
                  <Dialog.Root>
                    {#if data.userAnimes.some((a) => a.malId === anime.mal_id)}{:else}
                      <Dialog.Trigger>
                        <Button.Root variant="default" class="gap-2">
                          <Bookmark size={16} />
                          <span>Add to Watchlist</span>
                        </Button.Root>
                      </Dialog.Trigger>
                    {/if}
                    <Dialog.Content>
                      <Dialog.Header>
                        <Dialog.Title>Add to Watchlist</Dialog.Title>
                        <Dialog.Description>
                          Select the start and end dates for your watchlist entry.
                        </Dialog.Description>
                      </Dialog.Header>
                      <Form malId={anime.mal_id} {data} />
                    </Dialog.Content>
                  </Dialog.Root>
                  <a
                    class={cn(Button.buttonVariants({ variant: 'secondary' }), 'gap-2')}
                    href={`/animes/${anime.mal_id}`}
                  >
                    <Play size={16} />
                    <span>Details</span>
                  </a>
                </div>
              </Card.Content>
            </Card.Root>
          </Carousel.Item>
        {/each}
      </Carousel.Content>
      <div class="mt-6 flex items-center justify-end gap-2">
        <Carousel.Previous
          class="border-input bg-background hover:bg-accent hover:text-accent-foreground static translate-y-0 border"
        />
        <Carousel.Next
          class="border-input bg-background hover:bg-accent hover:text-accent-foreground static translate-y-0 border"
        />
      </div>
    </Carousel.Root>
  </div>
</section>

<section class="py-12">
  <div class="container mx-auto px-4">
    <div class="mb-8 flex items-center justify-between">
      <h2 class="text-3xl font-bold">Browse Anime</h2>
      <a class={cn(Button.buttonVariants({ variant: 'outline' }), 'group')} href="/explore">
        View All
        <ChevronRight size={16} class="ml-1 transition-transform group-hover:translate-x-1" />
      </a>
    </div>

    <Tabs.Root value="popular" class="w-full">
      <Tabs.List class="mb-6 w-full justify-start border-b bg-transparent pb-1">
        <Tabs.Trigger value="popular">Popular</Tabs.Trigger>
        <Tabs.Trigger value="recent">Recent</Tabs.Trigger>
        <Tabs.Trigger value="all">All</Tabs.Trigger>
      </Tabs.List>

      {#each Object.entries(categories) as [category, animeList]}
        <Tabs.Content value={category} class="pt-2">
          <div class="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {#each animeList as anime}
              <Card.Root
                class="group bg-card overflow-hidden border pt-0 transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div class="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                    alt={anime.title}
                    class="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {#if anime.airing}
                    <div class="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        class="bg-primary/80 text-primary-foreground text-xs">Airing</Badge
                      >
                    </div>
                  {/if}
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <div class="absolute bottom-3 left-3">
                      <a
                        class={Button.buttonVariants({ variant: 'secondary', size: 'sm' })}
                        href={`/animes/${anime.mal_id}`}>Details</a
                      >
                    </div>
                  </div>
                </div>
                <Card.Content class="p-3">
                  <h3 class="truncate leading-tight font-medium">{anime.title}</h3>
                  <p class="text-muted-foreground mt-1 text-xs">
                    {anime.year || 'Unknown'} • {anime.episodes || '?'} eps
                  </p>
                </Card.Content>
              </Card.Root>
            {/each}
          </div>
        </Tabs.Content>
      {/each}
    </Tabs.Root>
  </div>
</section>
