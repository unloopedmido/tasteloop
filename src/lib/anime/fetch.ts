import type { Anime } from "@/types/anime.new";
import { GraphQLClient } from "graphql-request";
import { getGQLQuery, listQuery, topQuery } from "./queries";
import type { AnimeContext } from "@/types/anime";

const client = new GraphQLClient("https://graphql.anilist.co");

export async function fetchAnime(id: number) {
  const query = getGQLQuery("fetch");
  const variables = { id: id };

  const res = (await client.request(query, variables)) as {
    Media: Anime;
  };

  return [res.Media];
}

export async function searchAnime(query: string) {
  const searchQuery = getGQLQuery("search");
  const variables = { query: query };

  const res = (await client.request(searchQuery, variables)) as {
    Media: Anime;
  };

  return [res.Media];
}

export async function fetchAnimeList(
  userName: string,
  type: "ANIME" | "MANGA"
) {
  const res = (await client.request(listQuery, { userName, type })) as {
    MediaListCollection: {
      lists: {
        name: "Watching" | "Completed" | "Paused" | "Planning";
        entries: { media: Anime }[];
      }[];
    };
  };

  const allAnimes = [] as Anime[];

  for (const list of res.MediaListCollection.lists) {
    for (const entry of list.entries) {
      allAnimes.push(entry.media);
    }
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

export async function fetcher(context: AnimeContext) {
  switch (context.type) {
    case "search":
      return await searchAnime(context.query!);
    case "top":
      return await fetchTopAnime();
    case "list":
      // TODO: Implement after user auth is completed
      // return await fetchAnimeList(context.userId, "ANIME");
      return await fetchAnimeList("nonlooped", "ANIME");
    default:
      throw new Error("Invalid fetch type");
  }
}
