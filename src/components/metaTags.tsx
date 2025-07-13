import Head from 'next/head';
import { useRouter } from 'next/router';

export interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function MetaTags({
  title,
  description = 'Track & discover anime smarter with TasteLoop.',
  image = '/TasteLoop.png',
  url
}: MetaTagsProps) {
  const { asPath } = useRouter();
  const fullUrl = url ?? `${process.env.NEXT_PUBLIC_SITE_URL}${asPath}`;
  const finalTitle = title ? `${title} | TasteLoop` : 'TasteLoop';

  return (
    <Head>
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
