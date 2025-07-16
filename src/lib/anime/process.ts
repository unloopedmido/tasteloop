import type { Anime, ListAnime } from "@/types/anime.new";

export function processAnimes(animes: Anime[]) {
  animes.map((anime) => {
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

  return animes;
}

export function processListAnimes(animes: ListAnime[]) {
  const medias: Anime[] = animes.map((a) => a.media);
  const newMedias = processAnimes(medias);

  return animes.map((a, i) => ({
    ...a,
    media: {
      ...newMedias[i],
    },
  }));
}
