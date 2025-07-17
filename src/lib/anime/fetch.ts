import type { Anime, ListAnime } from "@/types/anime.new";
import { GraphQLClient } from "graphql-request";
import { fetchQuery, listQuery, searchQuery, topQuery } from "./queries";

const client = new GraphQLClient("https://graphql.anilist.co");

export async function searchAnime(query: string) {
  const variables = { query };
  const res = (await client.request(searchQuery, variables)) as {
    Media: Anime;
  };
  return [res.Media];
}

export async function fetchAnimeList(userId: number, type: "ANIME" | "MANGA") {
  const res = (await client.request(listQuery, { userId, type })) as {
    MediaListCollection: {
      lists: {
        entries: ListAnime[];
      }[];
    };
  };

  return res.MediaListCollection.lists.flatMap((list) => list.entries);
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
  param: string,
): Promise<Anime[]>;
export async function fetcher(
  method: "list",
  param: number,
): Promise<ListAnime[]>;
export async function fetcher(method: "top"): Promise<Anime[]>;
export async function fetcher(
  method: string,
  param?: string | number,
): Promise<Anime[] | ListAnime[]> {
  switch (method) {
    case "search":
      return searchAnime(param as string);
    case "top":
      return fetchTopAnime();
    case "list":
      return fetchAnimeList(param as number, "ANIME");
    default:
      throw new Error("Invalid fetch type");
  }
}
