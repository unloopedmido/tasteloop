import type { Anime, AnimeRootResponse } from "@/types/anime";
import { log } from "./logger";
import { EmbedBuilder } from "discord.js";
import { formatDate } from "date-fns";

let cachedData: { data: AnimeRootResponse; timestamp: number } | null = null;

export async function fetchTopAnime() {
  if (cachedData && Date.now() - cachedData.timestamp < 1000 * 60 * 60) {
    return cachedData.data;
  }

  log.info("Fetching top anime from Jikan API");

  const animeData = await fetch(
    "https://api.jikan.moe/v4/top/anime?limit=10"
  ).then((res) => {
    if (!res.ok) log.error("Failed to fetch anime details");
    return res.json() as Promise<AnimeRootResponse>;
  });

  cachedData = {
    data: animeData,
    timestamp: Date.now(),
  };

  return animeData;
}

export async function fetchAnime(malId: number) {
  return await fetch(`https://api.jikan.moe/v4/anime/${malId}/full`).then(
    (res) => {
      if (!res.ok) log.error("Failed to fetch anime details");
      return res.json() as Promise<{ data: Anime }>;
    }
  );
}

export function detailsEmbed(anime: Anime) {
  const scoreColor =
    anime.score >= 9
      ? 0x00ff00
      : anime.score >= 8
      ? 0x00bfff
      : anime.score >= 7
      ? 0xffa500
      : anime.score >= 6
      ? 0xffff00
      : 0xff0000;

  const genres = anime.genres.map((g) => g.name).join(", ");
  const studios = anime.studios.map((s) => s.name).join(", ");
  const synopsis = anime.synopsis.split("\n")[0].slice(0, 200) + "...";

  return new EmbedBuilder()
    .setColor(scoreColor)
    .setTitle(anime.title)
    .setURL(anime.url)
    .setThumbnail(anime.images.jpg.large_image_url)
    .setDescription(`*${synopsis}*`)
    .setAuthor({ name: studios })
    .addFields(
      {
        name: "⭐ Rating",
        value: `**${
          anime.score
        }/10** *(${anime.scored_by.toLocaleString()} votes)*`,
        inline: true,
      },
      {
        name: "📺 Episodes",
        value: `**${anime.episodes || "?"}** eps`,
        inline: true,
      },
      {
        name: "👥 Popularity",
        value: `Rank **#${anime.popularity}**`,
        inline: true,
      },
      {
        name: "📆 Aired",
        value: `${formatDate(anime.aired.from, "MMM yyyy")} - ${
          anime.aired.to ? formatDate(anime.aired.to, "MMM yyyy") : "Ongoing"
        }`,
        inline: false,
      },
      { name: "🏷️ Genres", value: genres || "Not specified", inline: false }
    )
    .setTimestamp();
}
