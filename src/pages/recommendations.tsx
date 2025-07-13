import type { Anime } from '@/types/anime';
import type { NextPage } from 'next';
import { Sparkles, Play, Star, RefreshCw, AlertCircle } from 'lucide-react';
import { unstable_ViewTransition as ViewTransition } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTimer } from '@/hooks/use-timer';
import { api } from '@/utils/api';
import { cn } from '@/lib/utils';
import SaveDialog from '@/components/saveForm';
import Layout from '@/components/layout';
import Link from 'next/link';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-16">
    <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
    <p className="text-muted-foreground text-lg">Generating your personalized recommendations...</p>
  </div>
);

const EmptyState = ({ onGenerate }: { onGenerate: () => void }) => (
  <div className="py-16 text-center">
    <div className="mx-auto max-w-md space-y-6">
      <div className="bg-primary/10 mx-auto flex h-24 w-24 items-center justify-center rounded-full">
        <Sparkles className="text-primary h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Get Your Personal Recommendations</h2>
        <p className="text-muted-foreground">
          Let our AI analyze your preferences and discover anime you'll love
        </p>
      </div>
      <Button onClick={onGenerate} size="lg" className="gap-2">
        <Sparkles className="h-4 w-4" />
        Generate Recommendations
      </Button>
    </div>
  </div>
);

const NoRecommendationsFound = () => (
  <div className="py-12 text-center">
    <div className="mx-auto max-w-md space-y-4">
      <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
        <Sparkles className="text-muted-foreground h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">No Recommendations Found</h3>
        <p className="text-muted-foreground">
          Try adjusting your preferences or come back later for new suggestions.
        </p>
      </div>
    </div>
  </div>
);

const AnimeCard = ({ anime, index }: { anime: Anime; index: number }) => {
  const cardId = anime.mal_id || index;

  return (
    <Card className="group overflow-hidden border-0 pt-0 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl">
      <div className="relative">
        <ViewTransition name={`anime-poster-${cardId}`}>
          <img
            src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
            alt={anime.title}
            className="h-[300px] w-full object-cover"
            loading="lazy"
          />
        </ViewTransition>

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {anime.airing && (
            <Badge className="bg-primary/90 text-primary-foreground px-2 py-1">Now Airing</Badge>
          )}
        </div>

        {anime.score && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="gap-1 bg-black/80 text-white">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {anime.score}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <ViewTransition name={`anime-title-${cardId}`}>
          <h3 className="mb-2 line-clamp-2 text-xl leading-tight font-bold">{anime.title}</h3>
        </ViewTransition>

        <div className="text-muted-foreground mb-4 flex items-center gap-3 text-sm">
          {anime.year && (
            <>
              <span>{anime.year}</span>
              <span>•</span>
            </>
          )}
          {anime.episodes && (
            <>
              <span>{anime.episodes} episodes</span>
              <span>•</span>
            </>
          )}
          {anime.type && <span>{anime.type}</span>}
        </div>

        {anime.genres && anime.genres.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {anime.genres.slice(0, 3).map((genre) => (
              <Badge key={genre.name} variant="outline" className="bg-secondary/30">
                {genre.name}
              </Badge>
            ))}
            {anime.genres.length > 3 && (
              <Badge variant="outline" className="bg-secondary/30">
                +{anime.genres.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {anime.synopsis && (
          <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">{anime.synopsis}</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
  );
};

const RecommendationHeader = ({
  onRefresh,
  isDisabled,
  timeLeft
}: {
  onRefresh: () => void;
  isDisabled: boolean;
  timeLeft: string;
}) => (
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold">Your Recommendations</h2>
    <Button onClick={onRefresh} variant="outline" className="gap-2" disabled={isDisabled}>
      <RefreshCw className="h-4 w-4" />
      {isDisabled ? timeLeft : 'Get New Recommendations'}
    </Button>
  </div>
);

const RecommendationGrid = ({
  recommendations,
  onRefresh,
  timeLeft,
  timer,
  error
}: {
  recommendations: Anime[];
  onRefresh: () => void;
  timeLeft: number;
  timer: string;
  error?: string;
}) => {
  const isRefreshDisabled = timeLeft > 0;

  return (
    <div className="space-y-6">
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RecommendationHeader onRefresh={onRefresh} isDisabled={isRefreshDisabled} timeLeft={timer} />

      {recommendations.length === 0 ? (
        <NoRecommendationsFound />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((anime, index) => (
            <AnimeCard key={anime.mal_id || index} anime={anime} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

const PageHeader = () => (
  <div className="mb-8 flex flex-col space-y-2">
    <div className="flex items-center gap-3">
      <Sparkles className="text-primary h-8 w-8" />
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">AI Recommendations</h1>
    </div>
    <p className="text-muted-foreground text-lg">
      Discover anime tailored specifically to your taste using advanced AI
    </p>
  </div>
);

const Recommendations: NextPage = () => {
  const {
    isLoading,
    isRefetching,
    data: recommendationData,
    refetch: recommend,
    error
  } = api.anime.recommendations.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000
  });

  const timer = useTimer(recommendationData?.timeLeft || 0);
  const isLoadingState = isLoading || isRefetching;

  const handleGenerateRecommendations = () => {
    void recommend();
  };

  if (isLoadingState) {
    return (
      <Layout title="AI Recommendations">
        <div className="container mx-auto px-4">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="AI Recommendations">
      <section className="py-15">
        <div className="container mx-auto px-4">
          <PageHeader />

          {!recommendationData ? (
            <EmptyState onGenerate={handleGenerateRecommendations} />
          ) : (
            <RecommendationGrid
              recommendations={recommendationData.recommendations}
              onRefresh={handleGenerateRecommendations}
              timeLeft={recommendationData.timeLeft}
              timer={timer}
              error={recommendationData.error}
            />
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Recommendations;
