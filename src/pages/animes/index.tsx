import type { GetStaticProps } from 'next';
import type { Anime } from '@/types/anime';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Play } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { fetchTopAnime } from '@/server/api';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import SaveDialog from '@/components/saveForm';
import Link from 'next/link';
import { unstable_ViewTransition as ViewTransition } from 'react';
import Head from 'next/head';

export const getStaticProps: GetStaticProps = async () => {
  const animes = await fetchTopAnime();

  return {
    props: { animes },
    revalidate: 600 // cache for 10min, then update on next hit
  };
};

export default function DiscoverPage({ animes }: { animes: Anime[] }) {
  const featured = animes.slice(0, 3);
  const rest = animes.slice(3);

  const categories: Record<string, typeof rest> = {
    popular: rest.slice(0, 8),
    recent: rest.filter((a) => a.year && a.year >= 2021).slice(0, 8)
  };

  return (
    <>
      <Head>
        <title>Top Animes | TasteLoop</title>
      </Head>
      <section className="py-15">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col space-y-2">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Featured Anime</h1>
            <p className="text-muted-foreground text-lg">
              Discover the latest and greatest series curated just for you
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {featured.map((anime) => (
              <Card
                key={anime.mal_id}
                className="overflow-hidden border-0 pt-0 shadow-lg transition-all hover:scale-99"
              >
                <div className="relative">
                  <img
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title}
                    className="h-[250px] w-full object-cover"
                  />
                  {anime.airing && (
                    <Badge className="bg-primary/90 text-primary-foreground absolute top-3 right-3 px-2 py-1">
                      Now Airing
                    </Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <ViewTransition name={`anime-title-${anime.mal_id}`}>
                    <h3 className="mb-2 truncate text-xl leading-tight font-bold">{anime.title}</h3>
                  </ViewTransition>
                  <div className="text-muted-foreground mb-4 flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="text-primary">{anime.score ?? 'N/A'}</span>
                      <span className="text-xs">/ 10</span>
                    </span>
                    <span>•</span>
                    <span>{anime.year ?? 'Unknown'}</span>
                    <span>•</span>
                    <span>{anime.episodes ?? '?'} episodes</span>
                  </div>

                  {anime.genres?.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {anime.genres.slice(0, 3).map((genre) => (
                        <Badge key={genre.name} variant="outline" className="bg-secondary/30">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SaveDialog anime={anime} />
                    <Link
                      href={`/animes/${anime.mal_id}`}
                      className={cn(buttonVariants({ variant: 'secondary' }), 'gap-2')}
                    >
                      <Play size={16} />
                      <span>Details</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Browse Anime</h2>
            <Link href="/explore" className={cn(buttonVariants({ variant: 'outline' }), 'group')}>
              View All
              <ChevronRight
                size={16}
                className="ml-1 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <Tabs className="w-full" defaultValue="popular">
            <TabsList className="mb-6 w-full justify-start border-b bg-transparent pb-1">
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            {Object.entries(categories).map(([category, animeList]) => (
              <TabsContent key={category} value={category} className="pt-2">
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {animeList.map((anime) => (
                    <Card
                      key={anime.mal_id}
                      className="group bg-card overflow-hidden border pt-0 transition-all hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <img
                          src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                          alt={anime.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {anime.airing && (
                          <div className="absolute top-2 right-2">
                            <Badge
                              variant="secondary"
                              className="bg-primary/80 text-primary-foreground text-xs"
                            >
                              Airing
                            </Badge>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="absolute bottom-3 left-3">
                            <Link
                              href={`/animes/${anime.mal_id}`}
                              className={buttonVariants({
                                variant: 'secondary',
                                size: 'sm'
                              })}
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="truncate leading-tight font-medium">{anime.title}</h3>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {anime.year ?? 'Unknown'} • {anime.episodes ?? '?'} eps
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </>
  );
}
