export interface Anime {
  id: number;
  siteUrl: string;
  title: Title;
  synonyms: string[];
  coverImage: CoverImage;
  bannerImage?: string;
  format: MediaFormat;
  source: MediaSource;
  status: MediaStatus;
  episodes?: number;
  duration?: number;
  averageScore?: number;
  popularity?: number;
  favourites?: number;
  description?: string;
  season?: MediaSeason;
  seasonYear?: number;
  startDate: DateInfo;
  endDate?: DateInfo;
  studios?: StudioConnection;
  genres?: string[];
  tags?: Tag[];
  trailer?: Trailer;
  nextAiringEpisode?: NextAiringEpisode;
}

export interface Title {
  userPreferred?: string;
  english?: string;
  native?: string;
  romaji?: string;
}

export interface CoverImage {
  extraLarge?: string;
  large?: string;
  medium?: string;
  color?: string;
}

export interface DateInfo {
  year?: number;
  month?: number;
  day?: number;
}

export interface StudioConnection {
  nodes: StudioNode[];
}

export interface StudioNode {
  id: number;
  name: string;
}

export interface Tag {
  name: string;
  isMediaSpoiler?: boolean;
  rank?: number;
}

export interface Trailer {
  id?: string;
  site?: string;
  thumbnail?: string;
}

export interface NextAiringEpisode {
  airingAt?: number; // Unix timestamp
  timeUntilAiring?: number;
  episode?: number;
}

export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC"
  | "MANGA"
  | "NOVEL"
  | "ONE_SHOT";

export type MediaSource =
  | "ORIGINAL"
  | "MANGA"
  | "LIGHT_NOVEL"
  | "VISUAL_NOVEL"
  | "VIDEO_GAME"
  | "OTHER"
  | "NOVEL"
  | "DOUJINSHI"
  | "ANIME"
  | "WEB_MANGA"
  | "WEB_NOVEL"
  | "GAME"
  | "COMIC";

export type MediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";
