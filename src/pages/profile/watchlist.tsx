import { auth } from '@/server/auth';
import { db } from '@/server/db';
import type { Anime } from '@prisma/client';
import type { GetServerSideProps } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Star, Info, Heart, Bookmark, Calendar, Play } from 'lucide-react';
import { unstable_ViewTransition as ViewTransition } from 'react';
import { cn, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import Head from 'next/head';

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

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <>
      <Head>
        <title>My Watchlist | TasteLoop</title>
      </Head>

      <div className="bg-background min-h-screen">
        {/* Header Section */}
        <section className="border-b py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <Bookmark className="text-primary h-8 w-8" />
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">My Watchlist</h1>
              </div>
              <p className="text-muted-foreground max-w-2xl text-lg">
                Keep track of your anime journey. Organize and manage your favorite series.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card className="p-4 text-center">
                <CardContent className="p-0">
                  <div className="text-primary text-2xl font-bold">{totalAnimes}</div>
                  <div className="text-muted-foreground text-sm">Total Anime</div>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-green-500">{watchingCount}</div>
                  <div className="text-muted-foreground text-sm">Watching</div>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-blue-500">{completedCount}</div>
                  <div className="text-muted-foreground text-sm">Completed</div>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-yellow-500">{planToWatchCount}</div>
                  <div className="text-muted-foreground text-sm">Plan to Watch</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Anime Grid Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {userAnimes.length === 0 ? (
              <div className="py-16 text-center">
                <Heart className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                <h2 className="mb-2 text-2xl font-semibold">Your watchlist is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Start building your collection by adding some anime to your watchlist.
                </p>
                <Link href="/discover" className={buttonVariants({ variant: 'default' })}>
                  <Play className="mr-2 h-4 w-4" />
                  Discover Anime
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {userAnimes.map((anime) => (
                  <Card
                    key={anime.id}
                    className="group bg-card overflow-hidden border pt-0 transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <ViewTransition name={`anime-poster-${anime.malId}`}>
                        <img
                          src={anime.imageUrl}
                          alt={anime.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </ViewTransition>

                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge className={cn('text-xs', getStatusColor(anime.status))}>
                          {formatStatus(anime.status)}
                        </Badge>
                      </div>

                      {/* Score Badge */}
                      {anime.score && (
                        <div className="absolute top-2 left-2">
                          <Badge className="flex items-center gap-1 border-0 bg-yellow-500/90 text-xs text-black shadow-lg">
                            <Star size={10} fill="currentColor" />
                            {anime.score}
                          </Badge>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="absolute right-3 bottom-3 left-3 flex gap-2">
                          <Link
                            href={`/animes/${anime.malId}`}
                            className={cn(
                              buttonVariants({
                                variant: 'secondary',
                                size: 'sm'
                              }),
                              'flex-1 text-xs'
                            )}
                          >
                            <Info size={12} className="mr-1" />
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      <h3 className="mb-2 line-clamp-2 text-sm leading-tight font-medium">
                        {anime.title}
                      </h3>
                      <div className="text-muted-foreground flex items-center justify-between text-xs">
                        <span>{anime.year ?? 'Unknown'}</span>
                        {anime.eps_total && <span>{anime.eps_total} eps</span>}
                      </div>
                      {anime.createdAt && (
                        <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                          <Calendar size={10} />
                          <span>Added {new Date(anime.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
