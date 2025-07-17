import type { Anime, ListAnime } from "@/types/anime.new";
import { GraphQLClient } from "graphql-request";
import { fetchQuery, listQuery, searchQuery, topQuery } from "./queries";

const client = new GraphQLClient("https://graphql.anilist.co");

export async function fetchAnime(id: number) {
  const variables = { id: id };

  const res = (await client.request(fetchQuery, variables)) as {
    Media: Anime;
  };

  return [res.Media];
}

export async function searchAnime(query: string) {
  const variables = { query: query };

  const res = (await client.request(searchQuery, variables)) as {
    Media: Anime;
  };

  return [res.Media];
}

export async function fetchAnimeList(userId: number, type: "ANIME" | "MANGA") {
  const res = (await client.request(listQuery, { userId, type })) as {
    MediaListCollection: {
      lists: {
        name: "Watching" | "Completed" | "Paused" | "Planning";
        entries: ListAnime[];
      }[];
    };
  };

  const allAnimes: ListAnime[] = [];

  for (const list of res.MediaListCollection.lists) {
    allAnimes.push(...list.entries);
  }

  return allAnimes;
}

export async function fetchTopAnime() {
  const res = (await client.request(topQuery)) as {
    Page: {
      media: Anime[];
    };
  };

  return res.Page.media;
}

export async function fetcher(
  method: "search",
  param: string // Query
): Promise<Anime[]>;
export async function fetcher(
  method: "list",
  param: number // Anilist ID
): Promise<ListAnime[]>;
export async function fetcher(method: "top"): Promise<Anime[]>;
export async function fetcher(
  method: string,
  param?: string | number
): Promise<Anime[] | ListAnime[]> {
  switch (method) {
    case "search":
      return await searchAnime(param as string);
    case "top":
      return await fetchTopAnime();
    case "list":
      return await fetchAnimeList(param as number, "ANIME");
    default:
      throw new Error("Invalid fetch type");
  }
}
