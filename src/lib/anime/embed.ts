import type { Anime as DBAnime } from "@/stores/prisma";
import type { Anime } from "@/types/anime.new";
import { capitalize, intToMonth } from "@/utils/misc";
import { formatDate } from "date-fns";
import { baseEmbed } from "../embed";

function isApiAnime(a: any): a is Anime {
  return typeof a.url === "string";
}

function getScoreColor(score = 0) {
  if (score >= 9) return 0x00ff00;
  if (score >= 8) return 0x00bfff;
  if (score >= 7) return 0xffa500;
  if (score >= 6) return 0xffff00;
  return 0xff0000;
}

function makeProgressBar(current: number, total: number, length = 8) {
  const filled = Math.round((current / total) * length);
  return "▰".repeat(filled) + "▱".repeat(length - filled);
}

export function detailsEmbed(anime: Anime) {
  // —— API branch (exactly your old logic) ——
  const scoreColor = getScoreColor(anime.averageScore);
  const genres = anime.genres!.join(", ");
  const studios = anime.studios!.nodes!.map((s) => s.name).join(", ");
  const synopsis = anime.description!.split("\n")[0].slice(0, 200) + "...";

  return baseEmbed({
    color: scoreColor,
    title:
      anime.title.userPreferred ??
      anime.title.english ??
      anime.title.romaji ??
      anime.title.native,
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
        value: `Rank **#${anime.popularity}**`,
        inline: true,
      },
      {
        name: "📆 Aired",
        value: `${intToMonth(anime.startDate.month)} ${anime.startDate.year} ${
          anime.endDate &&
          `- ${intToMonth(anime.endDate.month)} ${anime.endDate.year}`
        }`,
      },
      { name: "🏷️ Genres", value: genres ?? "Not specified" },
    ],
  });
}
