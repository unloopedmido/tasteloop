import type { Anime as DBAnime } from "@/stores/prisma";
import type { Anime } from "@/types/anime";
import { capitalize } from "@/utils/misc";
import { formatDate } from "date-fns";
import { baseEmbed } from "../embed";

function isApiAnime(a: any): a is Anime {
  return typeof a.mal_id === "number" && typeof a.url === "string";
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

export function detailsEmbed(anime: Anime | DBAnime) {
  if (isApiAnime(anime)) {
    // —— API branch (exactly your old logic) ——
    const scoreColor = getScoreColor(anime.score);
    const genres = anime.genres.map((g) => g.name).join(", ");
    const studios = anime.studios.map((s) => s.name).join(", ");
    const synopsis = anime.synopsis.split("\n")[0].slice(0, 200) + "...";

    return baseEmbed({
      color: scoreColor,
      title: anime.title_english ?? anime.title,
      url: anime.url,
      thumbnail: { url: anime.images.jpg.large_image_url },
      description: `*${synopsis}*`,
      author: { name: studios || "Unknown Studio" },
      fields: [
        {
          name: "⭐ Rating",
          value: `**${anime.score}/10**${
            anime.scored_by
              ? ` *(${anime.scored_by.toLocaleString()} votes)*`
              : ""
          }`,
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
          value: !anime.aired.to
            ? formatDate(anime.aired.from, "MMM yyyy")
            : `${formatDate(anime.aired.from, "MMM yyyy")} - ${formatDate(
                anime.aired.to,
                "MMM yyyy"
              )}`,
        },
        { name: "🏷️ Genres", value: genres ?? "Not specified" },
      ],
    });
  } else {
    // —— User data branch ——
    const scoreColor = getScoreColor(anime.score ?? 0);
    const progressBar = makeProgressBar(
      anime.eps_watched ?? 0,
      anime.eps_total ?? 0,
      8
    );
    const genresText = anime.genres
      ? anime.genres
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(", ")
      : "Not specified";

    return (
      baseEmbed({
        color: scoreColor,
        title: anime.title,
        thumbnail: { url: anime.imageUrl },
        description:
          `**Status:** ${capitalize(anime.status)}\n` +
          `**Year:** ${anime.year ?? "Unknown"}`,
        fields: [
          {
            name: "⭐ Your Score",
            value:
              anime.score != null ? `**${anime.score}/10**` : "No rating yet",
            inline: true,
          },
          {
            name: "📺 Progress",
            value: `${progressBar} ${anime.eps_watched}/${anime.eps_total} ep(s)`,
            inline: true,
          },
          { name: "🏷️ Genres", value: genresText, inline: false },
        ],
      })
        .setColor(scoreColor)
        .setTitle(anime.title)
        // no URL for user data
        .setThumbnail(anime.imageUrl)
        .setDescription(
          `**Status:** ${capitalize(anime.status)}\n` +
            `**Year:** ${anime.year ?? "Unknown"}`
        )
        .addFields()
        .setFooter({
          text: `Added on ${formatDate(
            anime.createdAt ?? new Date(),
            "MMM dd, yyyy"
          )}`,
        })
        .setTimestamp()
    );
  }
}
