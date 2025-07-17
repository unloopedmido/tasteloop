import type { Anime, ListAnime } from "@/types/anime.new";
import { capitalize, intToMonth, makeProgressBar } from "@/utils/misc";
import { baseEmbed } from "../embed";
import { processAnimes, processListAnimes } from "./process";

function listDetailsEmbed(rawAnime: ListAnime) {
  const anime = processListAnimes([rawAnime])[0];
  const genres = anime.media.genres?.join(", ");
  const studios = anime.media.studios!.nodes!.map((s) => s.name).join(", ");
  const synopsis = anime.media.description!.split("\n")[0].slice(0, 150) + "...";
  const progressBar = makeProgressBar(
    anime.progress,
    anime.media.episodes ?? 1,
    8
  );

  return baseEmbed({
    color: parseInt(
      anime.media.coverImage.color?.replace("#", "0x") ?? "0x000000"
    ),
    title: anime.media.title.userPreferred,
    url: anime.media.siteUrl,
    thumbnail: {
      url: anime.media.coverImage.extraLarge ?? anime.media.coverImage.large!,
    },
    description: `*${synopsis}*`,
    author: {
      name: studios || "Unknown Studio",
    },
    fields: [
      { name: "⭐ Your Score", value: `**${anime.score}/10**`, inline: true },
      {
        name: "📺 Progress",
        value: `${progressBar} ${anime.progress}/${anime.media.episodes} ep(s)`,
        inline: true,
      },
      {
        name: "📋 Status",
        value: capitalize(anime.status),
        inline: true,
      },
      {
        name: "📆 Aired",
        value: `${intToMonth(anime.media.startDate.month)} ${
          anime.media.startDate.year
        }${
          anime.media.endDate
            ? ` - ${intToMonth(anime.media.endDate.month)} ${
                anime.media.endDate.year
              }`
            : ""
        }`,
      },
      {
        name: "🏷️ Genres",
        value: genres || "Not specified",
        inline: true,
      },
    ],
  });
}

function mediaDetailsEmbed(rawAnime: Anime) {
  const anime = processAnimes([rawAnime])[0];
  const genres = anime.genres!.join(", ");
  const studios = anime.studios!.nodes!.map((s) => s.name).join(", ");
  const synopsis = anime.description!.split("\n")[0].slice(0, 200) + "...";

  return baseEmbed({
    color: parseInt(anime.coverImage.color?.replace("#", "0x") ?? "0x000000"),
    title: anime.title.userPreferred,
    url: anime.siteUrl,
    thumbnail: {
      url: (anime.coverImage.extraLarge ?? anime.coverImage.large)!,
    },
    description: `*${synopsis}*`,
    author: { name: studios || "Unknown Studio" },
    fields: [
      {
        name: "⭐ Rating",
        value: `**${anime.averageScore}/10**`,
        inline: true,
      },
      {
        name: "📺 Episodes",
        value: `**${anime.episodes ?? "?"}** ep(s)`,
        inline: true,
      },
      {
        name: "👥 Popularity",
        value: `**${anime.popularity?.toLocaleString("en-US")} members**`,
        inline: true,
      },
      {
        name: "📆 Aired",
        value: `${intToMonth(anime.startDate.month)} ${anime.startDate.year}${
          anime.endDate
            ? ` - ${intToMonth(anime.endDate.month)} ${anime.endDate.year}`
            : ""
        }`,
      },
      { name: "🏷️ Genres", value: genres ?? "Not specified" },
    ],
  });
}

export function detailsEmbed(anime: Anime | ListAnime) {
  if ("media" in anime) {
    return listDetailsEmbed(anime);
  } else {
    return mediaDetailsEmbed(anime);
  }
}
