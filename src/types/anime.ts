export interface AnimeContext {
  type: "top" | "search" | "list";
  userId: string;
  query?: string;
}

export interface AnimeEpisode {
  mal_id: number;
  url: string;
  title: string;
  title_japanese: string;
  title_romanji: string;
  aired: Date;
  score: number;
  filler: boolean;
  recap: boolean;
  forum_url: string;
}

export interface AnimeRootResponse {
  pagination: Pagination;
  data: Anime[];
}

export interface Pagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: Items;
}

export interface Items {
  count: number;
  total: number;
  per_page: number;
}

export interface Anime {
  mal_id: number;
  url: string;
  images: Images;
  trailer: Trailer;
  approved: boolean;
  titles: Title[];
  title: string;
  title_english?: string;
  title_japanese: string;
  title_synonyms: string[];
  type: string;
  source: string;
  episodes?: number;
  status: string;
  airing: boolean;
  aired: Aired;
  duration: string;
  rating: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background: string;
  season?: string;
  year?: number;
  broadcast: Broadcast;
  producers: Person[];
  licensors: Person[];
  studios: Person[];
  genres: Person[];
  explicit_genres: [];
  themes: Person[];
  demographics: Person[];
}

export interface Images {
  jpg: Type;
  webp: Type;
}

export interface Type {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface Trailer {
  youtube_id?: string;
  url?: string;
  embed_url?: string;
  images: Images2;
}

export interface Images2 {
  image_url?: string;
  small_image_url?: string;
  medium_image_url?: string;
  large_image_url?: string;
  maximum_image_url?: string;
}

export interface Title {
  type: string;
  title: string;
}

export interface Aired {
  from: Date;
  to?: Date;
  prop: Prop;
  string: string;
}

export interface Prop {
  from: AiringDate;
  to: AiringDate;
}

export interface AiringDate {
  day: number;
  month: number;
  year: number;
}

export interface Broadcast {
  day?: string;
  time?: string;
  timezone?: string;
  string?: string;
}

export interface Person {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}
