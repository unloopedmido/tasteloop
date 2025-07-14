import type { Modal } from "@/types";
import { fetchAnime } from "@/utils/anime";
import { Status } from "@/utils/prisma";
import { inlineCode } from "discord.js";

export default {
  customId: "save",
  execute: async (interaction, client, dbUser) => {
    await interaction.deferUpdate();
    const malId = interaction.customId.split("_")[1];

    if (dbUser.animes.some((a) => a.malId === Number(malId))) {
      await interaction.followUp({
        content: "You already have this anime saved!",
        flags: ["Ephemeral"],
      });
      return;
    }

    const anime = await fetchAnime(Number(malId)).then((d) => d.data);
    const epsWatched = parseInt(
      interaction.fields.getTextInputValue("eps_watched") ?? "0"
    );
    const score = parseInt(
      interaction.fields.getTextInputValue("score") ?? "0"
    );
    const status =
      epsWatched === 0
        ? Status.PLANNING
        : epsWatched === anime.episodes
        ? Status.COMPLETED
        : Status.WATCHING;

    if (epsWatched > (anime.episodes ?? 1)) {
      await interaction.followUp({
        content: `${inlineCode(anime.title)} only has ${inlineCode(
          String(anime.episodes) ?? "1"
        )} episodes, you can't watch ${inlineCode(
          String(epsWatched) ?? "1"
        )} episodes!`,
        flags: ["Ephemeral"],
      });
      return;
    }

    if (epsWatched === 0 && score != 0) {
      await interaction.followUp({
        content: "You can't give a score if you haven't watched any episodes!",
        flags: ["Ephemeral"],
      });
      return;
    }

    if (score < 0 || score > 10) {
      await interaction.followUp({
        content: "Score must be between 1 and 10!",
        flags: ["Ephemeral"],
      });
      return;
    }

    await client.db.anime.create({
      data: {
        imageUrl: anime.images.jpg.large_image_url,
        malId: Number(malId),
        eps_watched: epsWatched,
        score,
        title: anime.title,
        status,
        eps_total: anime.episodes,
        genres: anime.genres.map((g) => g.name).join(", "),
        year: anime.year,
        userId: interaction.user.id,
      },
    });

    (dbUser.animes as { malId: number }[]).push({
      malId: Number(malId),
    });

    await interaction.followUp({
      content: "Anime saved!",
      flags: ["Ephemeral"],
    });
  },
} as Modal;
