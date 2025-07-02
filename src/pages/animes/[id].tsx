import type { GetServerSideProps } from 'next';
import type { Anime } from '@/types/anime';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, Users, PlayCircle, Heart } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import fetchAnimeDetails, { getCachedAnime, setCachedAnime } from '@/server/api';
import { unstable_ViewTransition as ViewTransition } from 'react';
import WatchlistDialog from '@/components/saveForm';
import Metas from '@/components/animes/[id]/metas';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params!.id as string;

  let anime = getCachedAnime(id);

  if (!anime) {
    anime = await fetchAnimeDetails(id);
    setCachedAnime(id, anime);
  }

  return {
    props: { anime }
  };
};

export default function AnimePage({ anime }: { anime: Anime }) {
  return (
    <>
      <Metas anime={anime} />
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-start gap-8 lg:flex-row">
              {/* Anime Poster */}
              <Link href={anime.trailer.url ?? '#'}>
                <div className="flex-shrink-0">
                  <div className="group relative">
                    <ViewTransition name={`anime-poster-${anime.mal_id}`}>
                      <img
                        src={anime.images.jpg.large_image_url}
                        alt={anime.title}
                        className="h-auto w-80 rounded-lg shadow-2xl transition-transform group-hover:scale-105"
                      />
                    </ViewTransition>
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-colors group-hover:bg-black/20">
                      <PlayCircle className="h-16 w-16 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Main Info */}
              <div className="flex-1 space-y-6">
                <div>
                  <ViewTransition name={`anime-title-${anime.mal_id}`}>
                    <h1 className="text-4xl leading-tight font-bold lg:text-6xl">{anime.title}</h1>
                  </ViewTransition>
                  {anime.title_english && anime.title_english !== anime.title && (
                    <h2 className="text-muted-foreground mt-2 text-xl lg:text-2xl">
                      {anime.title_english}
                    </h2>
                  )}
                  {anime.title_japanese && (
                    <h3 className="text-muted-foreground mt-1 text-lg">{anime.title_japanese}</h3>
                  )}
                </div>

                {/* Rating and Status */}
                <div className="flex flex-wrap items-center gap-4">
                  {anime.score && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{anime.score}</span>
                      <span className="text-muted-foreground">/ 10</span>
                    </div>
                  )}
                  {anime.status && (
                    <Badge className={getStatusColor(anime.status)}>{anime.status}</Badge>
                  )}
                  {anime.rating && <Badge variant="outline">{anime.rating}</Badge>}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {anime.episodes && (
                    <div className="flex items-center gap-2">
                      <PlayCircle className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground text-sm">Episodes:</span>
                      <span className="font-semibold">{anime.episodes}</span>
                    </div>
                  )}
                  {anime.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground text-sm">Duration:</span>
                      <span className="font-semibold">{anime.duration}</span>
                    </div>
                  )}
                  {anime.members && (
                    <div className="flex items-center gap-2">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground text-sm">Members:</span>
                      <span className="font-semibold">{anime.members.toLocaleString()}</span>
                    </div>
                  )}
                  {anime.favorites && (
                    <div className="flex items-center gap-2">
                      <Heart className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground text-sm">Favorites:</span>
                      <span className="font-semibold">{anime.favorites.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <WatchlistDialog anime={anime} />
                  {anime?.trailer.url && (
                    <Link
                      href={anime.trailer.url ?? '#'}
                      className={buttonVariants({ variant: 'outline' })}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Watch Trailer
                    </Link>
                  )}
                </div>

                {/* Genres */}
                {anime.genres && anime.genres.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.map((genre) => (
                        <Badge key={genre.mal_id} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Synopsis */}
              <Card>
                <CardHeader>
                  <CardTitle>Synopsis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {anime.synopsis || 'No synopsis available.'}
                  </p>
                </CardContent>
              </Card>

              {/* Background */}
              {anime.background && (
                <Card>
                  <CardHeader>
                    <CardTitle>Background</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{anime.background}</p>
                  </CardContent>
                </Card>
              )}

              {/* Studios and Producers */}
              {((anime.studios && anime.studios.length > 0) ||
                (anime.producers && anime.producers.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Production</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {anime.studios && anime.studios.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-semibold">Studios</h4>
                        <div className="flex flex-wrap gap-2">
                          {anime.studios.map((studio) => (
                            <Badge key={studio.mal_id} variant="outline">
                              {studio.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {anime.producers && anime.producers.length > 0 && (
                      <div>
                        <h4 className="mb-2 font-semibold">Producers</h4>
                        <div className="flex flex-wrap gap-2">
                          {anime.producers.map((producer) => (
                            <Badge key={producer.mal_id} variant="outline">
                              {producer.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {anime.type && (
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">Type</dt>
                      <dd className="mt-1 font-semibold">{anime.type}</dd>
                    </div>
                  )}

                  {anime.episodes && (
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">Episodes</dt>
                      <dd className="mt-1 font-semibold">{anime.episodes}</dd>
                    </div>
                  )}

                  {anime.status && (
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">Status</dt>
                      <dd className="mt-1">
                        <Badge className={getStatusColor(anime.status)}>{anime.status}</Badge>
                      </dd>
                    </div>
                  )}

                  {anime.aired?.from && (
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">Aired</dt>
                      <dd className="mt-1 font-semibold">
                        {formatDate(anime.aired.from)}
                        {anime.aired.to && anime.aired.to !== anime.aired.from && (
                          <> to {formatDate(anime.aired.to)}</>
                        )}
                      </dd>
                    </div>
                  )}

                  {anime.season && anime.year && (
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">Season</dt>
                      <dd className="mt-1 font-semibold capitalize">
                        {anime.season} {anime.year}
                      </dd>
                    </div>
                  )}

                  {anime.broadcast?.day && (
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">Broadcast</dt>
                      <dd className="mt-1 font-semibold">
                        {anime.broadcast.day} at {anime.broadcast.time ?? 'Unknown time'}
                      </dd>
                    </div>
                  )}

                  {anime.source && (
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">Source</dt>
                      <dd className="mt-1 font-semibold">{anime.source}</dd>
                    </div>
                  )}

                  {anime.rating && (
                    <div>
                      <dt className="text-muted-foreground text-sm font-medium">Rating</dt>
                      <dd className="mt-1 font-semibold">{anime.rating}</dd>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {anime.score && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Score</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{anime.score}</span>
                      </div>
                    </div>
                  )}

                  {anime.scored_by && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Scored by</span>
                      <span className="font-semibold">{anime.scored_by.toLocaleString()}</span>
                    </div>
                  )}

                  {anime.rank && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Ranked</span>
                      <span className="font-semibold">#{anime.rank}</span>
                    </div>
                  )}

                  {anime.popularity && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Popularity</span>
                      <span className="font-semibold">#{anime.popularity}</span>
                    </div>
                  )}

                  {anime.members && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Members</span>
                      <span className="font-semibold">{anime.members.toLocaleString()}</span>
                    </div>
                  )}

                  {anime.favorites && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Favorites</span>
                      <span className="font-semibold">{anime.favorites.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alternative Titles */}
              {((anime.title_synonyms?.length > 0 || anime.title_english) ??
                anime.title_japanese) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Alternative Titles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {anime.title_english && anime.title_english !== anime.title && (
                      <div>
                        <dt className="text-muted-foreground text-sm font-medium">English</dt>
                        <dd className="mt-1 text-sm">{anime.title_english}</dd>
                      </div>
                    )}

                    {anime.title_japanese && (
                      <div>
                        <dt className="text-muted-foreground text-sm font-medium">Japanese</dt>
                        <dd className="mt-1 text-sm">{anime.title_japanese}</dd>
                      </div>
                    )}

                    {anime.title_synonyms?.length > 0 && (
                      <div>
                        <dt className="text-muted-foreground text-sm font-medium">Synonyms</dt>
                        <dd className="mt-1 text-sm">{anime.title_synonyms.join(', ')}</dd>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
