import type { Anime, ListAnime } from "@/types/anime.new";

export function processAnimes(animes: Anime[]) {
  return animes.map((anime) => {
    if (anime.episodes === null) {
      anime.episodes = anime.nextAiringEpisode?.episode ?? 1;
    }

    if (!anime.title.userPreferred) {
      anime.title.userPreferred =
        anime.title.english ??
        anime.title.native ??
        anime.title.romaji ??
        "Unknown Title";
    }

    if (anime.description) {
      anime.description = anime.description.replace(/<[^>]*>/g, "");
    }

    if (anime.averageScore && anime.averageScore > 10) {
      anime.averageScore = anime.averageScore / 10;
    }

    return anime;
  });
}

export function processListAnimes(animes: ListAnime[]) {
  const processedMedias = processAnimes(animes.map((a) => a.media));

  return animes.map((a, i) => ({
    ...a,
    media: processedMedias[i],
  }));
}
