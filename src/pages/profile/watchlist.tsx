import type { GetServerSideProps } from 'next';
import type { Anime } from '@prisma/client';
import { Star, Heart, Bookmark, Calendar, Play, ChevronRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import Layout from '@/components/layout';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await auth(ctx);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/login',
        statusCode: 302
      }
    };
  }

  const userAnimes = await db.anime.findMany({
    where: { userId: session.user.id }
  });

  const serializedUserAnimes = userAnimes.map((anime) => ({
    ...anime,
    createdAt: anime.createdAt ? anime.createdAt.toISOString() : undefined
  }));

  return {
    props: { userAnimes: serializedUserAnimes }
  };
};

export default function WatchlistPage({ userAnimes }: { userAnimes: Anime[] }) {
  const totalAnimes = userAnimes.length;
  const watchingCount = userAnimes.filter((anime) => anime.status === 'WATCHING').length;
  const completedCount = userAnimes.filter((anime) => anime.status === 'COMPLETED').length;
  const planToWatchCount = userAnimes.filter((anime) => anime.status === 'PLANNING').length;

  // Featured anime (highest rated or most recently added)
  const featured = userAnimes.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 3);

  // Categorize anime by status
  const categories: Record<string, typeof userAnimes> = {
    watching: userAnimes.filter((anime) => anime.status === 'WATCHING'),
    completed: userAnimes.filter((anime) => anime.status === 'COMPLETED'),
    planning: userAnimes.filter((anime) => anime.status === 'PLANNING'),
    dropped: userAnimes.filter((anime) => anime.status === 'DROPPED'),
    paused: userAnimes.filter((anime) => anime.status === 'ON_HOLD')
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (userAnimes.length === 0) {
    return (
      <Layout>
        <section className="py-15">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col space-y-2">
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">My Watchlist</h1>
              <p className="text-muted-foreground text-lg">
                Keep track of your anime journey. Organize and manage your favorite series.
              </p>
            </div>
            <div className="py-16 text-center">
              <Heart className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h2 className="mb-2 text-2xl font-semibold">Your watchlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Start building your collection by adding some anime to your watchlist.
              </p>
              <Link href="/animes" className={buttonVariants({ variant: 'default' })}>
                <Play className="mr-2 h-4 w-4" />
                Discover Anime
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header with Stats */}
      <section className="py-15">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col space-y-2">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">My Watchlist</h1>
            <p className="text-muted-foreground text-lg">
              Keep track of your anime journey. Organize and manage your favorite series.
            </p>
          </div>

          {/* Stats Cards - Similar to discover page featured section */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-primary text-3xl font-bold">{totalAnimes}</div>
                <div className="text-muted-foreground text-sm">Total Anime</div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-500">{watchingCount}</div>
                <div className="text-muted-foreground text-sm">Watching</div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-500">{completedCount}</div>
                <div className="text-muted-foreground text-sm">Completed</div>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-500">{planToWatchCount}</div>
                <div className="text-muted-foreground text-sm">Plan to Watch</div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Anime Section */}
          {featured.length > 0 && (
            <>
              <div className="mb-8 flex flex-col space-y-2">
                <h2 className="text-3xl font-bold">Top Rated in Your List</h2>
                <p className="text-muted-foreground text-lg">Your highest rated anime series</p>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                {featured.map((anime) => (
                  <Card
                    key={anime.malId}
                    className="overflow-hidden border-0 pt-0 shadow-lg transition-all hover:scale-99"
                  >
                    <div className="relative">
                      <img
                        src={anime.imageUrl}
                        alt={anime.title}
                        className="h-[250px] w-full object-cover"
                      />
                      <Badge className="bg-primary/90 text-primary-foreground absolute top-3 right-3 px-2 py-1">
                        {formatStatus(anime.status)}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="mb-2 truncate text-xl leading-tight font-bold">
                        {anime.title}
                      </h3>
                      <div className="text-muted-foreground mb-4 flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-primary">{anime.score?.toFixed(1) ?? 'N/A'}</span>
                        </span>
                        <span>•</span>
                        <span>{anime.year ?? 'Unknown'}</span>
                        {anime.eps_total && (
                          <>
                            <span>•</span>
                            <span>{anime.eps_total} episodes</span>
                          </>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {anime.eps_total && anime.eps_watched !== undefined && (
                        <div className="mb-4">
                          <div className="text-muted-foreground mb-2 flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>
                              {anime.eps_watched}/{anime.eps_total}
                            </span>
                          </div>
                          <div className="bg-muted h-2 w-full rounded-full">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  anime.eps_total && anime.eps_watched
                                    ? (anime.eps_watched / anime.eps_total) * 100
                                    : 0
                                }%`
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button variant="default" className="gap-2">
                          <Play size={16} />
                          <span>Edit</span>
                        </Button>
                        <Link
                          href={`/animes/${anime.malId}`}
                          className={cn(buttonVariants({ variant: 'secondary' }), 'gap-2')}
                        >
                          <span>Details</span>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Browse by Status Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Browse by Status</h2>
            <Link href="/animes" className={cn(buttonVariants({ variant: 'outline' }), 'group')}>
              Add More Anime
              <ChevronRight
                size={16}
                className="ml-1 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <Tabs className="w-full" defaultValue="watching">
            <TabsList className="mb-6 w-full justify-start border-b bg-transparent pb-1">
              <TabsTrigger value="watching">Watching ({watchingCount})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
              <TabsTrigger value="planning">Plan to Watch ({planToWatchCount})</TabsTrigger>
              {categories.dropped!.length > 0 && (
                <TabsTrigger value="dropped">Dropped ({categories.dropped!.length})</TabsTrigger>
              )}
              {categories.paused!.length > 0 && (
                <TabsTrigger value="paused">Paused ({categories.paused!.length})</TabsTrigger>
              )}
            </TabsList>

            {Object.entries(categories).map(([category, animeList]) => {
              if (animeList.length === 0) return null;

              return (
                <TabsContent key={category} value={category} className="pt-2">
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {animeList.map((anime) => (
                      <Card
                        key={anime.malId}
                        className="group bg-card overflow-hidden border pt-0 transition-all hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img
                            src={anime.imageUrl}
                            alt={anime.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          {anime.score && (
                            <div className="bg-background/80 border-border absolute top-2 left-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium backdrop-blur-sm">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-foreground">{anime.score.toFixed(1)}</span>
                            </div>
                          )}

                          {/* Progress indicator for watching anime */}
                          {anime.eps_total && anime.eps_watched !== undefined && (
                            <div className="bg-background/80 absolute right-2 bottom-2 left-2 rounded px-2 py-1 backdrop-blur-sm">
                              <div className="bg-muted h-1 w-full rounded-full">
                                <div
                                  className="bg-primary h-1 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${
                                      anime.eps_total && anime.eps_watched
                                        ? (anime.eps_watched / anime.eps_total) * 100
                                        : 0
                                    }%`
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="absolute right-3 bottom-3 left-3 flex gap-2">
                              <Button variant="secondary" size="sm" className="flex-1">
                                Edit
                              </Button>
                              <Link
                                href={`/animes/${anime.malId}`}
                                className={cn(
                                  buttonVariants({
                                    variant: 'secondary',
                                    size: 'sm'
                                  }),
                                  'flex-1'
                                )}
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="truncate leading-tight font-medium">{anime.title}</h3>
                          <div className="text-muted-foreground mt-1 flex items-center justify-between text-xs">
                            <span>{anime.year ?? 'Unknown'}</span>
                            {anime.eps_total && <span>{anime.eps_total} eps</span>}
                          </div>
                          {anime.eps_total && anime.eps_watched !== undefined && (
                            <div className="text-muted-foreground mt-1 text-xs">
                              {anime.eps_watched}/{anime.eps_total} watched
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
