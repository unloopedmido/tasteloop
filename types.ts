export interface Anime {
  mal_id: number;
  url: string;
  images: {
    [key: string]: {
      [key: `${string}_image_url`]: string;
    };
  };
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
    images: {
      [key: `${string}_image_url`]: string;
    };
  };
  approved: boolean;
  titles: { type: string; title: string }[];
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  title_synonyms: string[];
  type: "TV" | "Movie" | "OVA" | "ONA" | "Music";
  source: string;
  episodes: number | null;
  status: "Finished Airing" | "Currently Airing" | "Not yet aired";
  airing: boolean;
  aired: {
    from: string | null;
    to: string | null;
    prop: {
      from: { day: number | null; month: number | null; year: number | null };
      to: { day: number | null; month: number | null; year: number | null };
      string: string | null;
    };
  };
  duration: string | null;
  rating: string;
  score: number;
  score_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  broadcast: {
    day: string | null;
    time: string | null;
    timezone: string | null;
    string: string | null;
  };
  producers: {
    mal_id: number;
    type: "anime" | "manga" | "people" | "characters";
    name: string;
    url: string;
  }[];
  licensors: {
    mal_id: number;
    type: "anime" | "manga" | "people" | "characters";
    name: string;
    url: string;
  }[];
  studios: {
    mal_id: number;
    type: "anime" | "manga" | "people" | "characters";
    name: string;
    url: string;
  }[];
  genres: {
    mal_id: number;
    type: "anime" | "manga" | "people" | "characters";
    name: string;
    url: string;
  }[];
  explicit_genres: {
    mal_id: number;
    type: "anime" | "manga" | "people" | "characters";
    name: string;
    url: string;
  }[];
  themes: {
    openings: string[];
    endings: string[];
  };
  demographics: string[];
  themes_fetched: boolean;
}
