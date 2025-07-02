import type { Anime } from '@/types/anime';
import Head from 'next/head';

interface MetasProps {
  anime: Anime;
}

export default function Metas({ anime }: MetasProps) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/animes/${anime.mal_id}`;

  return (
    <Head>
      <title>{`${anime.title} | TasteLoop`}</title>
      <meta
        name="description"
        content={anime.synopsis ?? 'Add this anime to your watchlist on TasteLoop!'}
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="video.movie" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={`${anime.title} | TasteLoop`} />
      <meta property="og:description" content={anime.synopsis ?? ''} />
      <meta property="og:image" content={anime.images.jpg.large_image_url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={`${anime.title} | TasteLoop`} />
      <meta name="twitter:description" content={anime.synopsis ?? ''} />
      <meta name="twitter:image" content={anime.images.jpg.large_image_url} />

      {/* JSON‑LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TVSeries',
            name: anime.title,
            image: anime.images.jpg.large_image_url,
            description: anime.synopsis,
            url,
            genre: anime.genres?.map((g) => g.name) || [],
            numberOfEpisodes: anime.episodes,
            datePublished: anime.aired?.from
          })
        }}
      />
    </Head>
  );
}
