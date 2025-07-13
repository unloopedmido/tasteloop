import type { Modal } from "@/types";
import { fetchAnime } from "@/utils/anime";
import { Status } from "@/utils/prisma";

export default {
  customId: "save",
  execute: async (interaction, client) => {
    await interaction.deferUpdate();
    const malId = interaction.customId.split("_")[1];
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
      await interaction.editReply({
        content: `You can't watch more than ${anime.episodes} episodes!`,
      });
      return;
    }

    if (score === 0 || score > 10) {
      await interaction.editReply({
        content: "Score must be between 1 and 10!",
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
    await interaction.followUp({
      content: "Anime saved!",
      flags: ["Ephemeral"],
    });
  },
} as Modal;
