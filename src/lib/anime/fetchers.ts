import type { AnimeContext } from "@/types/anime";
import type ExtendedClient from "@/structures/client";
import { fetchTopAnime, searchAnime } from "./fetch";

export interface AnimeDataFetcher {
  fetchData(
    context: AnimeContext,
    client?: ExtendedClient
  ): Promise<{ data: any[] }>;
}

export class TopAnimeDataFetcher implements AnimeDataFetcher {
  async fetchData(context: AnimeContext) {
    return await fetchTopAnime();
  }
}

export class UserListDataFetcher implements AnimeDataFetcher {
  async fetchData(context: AnimeContext, client: ExtendedClient) {
    return {
      data: await client.db.anime.findMany({
        where: { userId: context.userId },
      }),
    };
  }
}

export class SearchDataFetcher implements AnimeDataFetcher {
  async fetchData(context: AnimeContext) {
    if (!context.query) throw new Error("Search query required");
    return await searchAnime(context.query);
  }
}

// Factory function
export function getDataFetcher(type: AnimeContext["type"]): AnimeDataFetcher {
  switch (type) {
    case "top":
      return new TopAnimeDataFetcher();
    case "list":
      return new UserListDataFetcher();
    case "search":
      return new SearchDataFetcher();
    default:
      throw new Error(`Unknown context type: ${type}`);
  }
}
