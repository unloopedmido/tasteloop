import { createTopButtons } from "@/commands/top";
import type { Button } from "@/types";
import { detailsEmbed, fetchTopAnime } from "@/utils/anime";

export default {
  customId: "go",
  execute: async (interaction, _, dbUser) => {
    const page = parseInt(interaction.customId.split("_")[1], 10);
    const total = parseInt(interaction.customId.split("_")[2], 10);
    const userId = interaction.customId.split("_")[3];

    if (interaction.user.id !== userId) {
      // Ignore users who didn't initiate the command
      return interaction.reply({
        content: "Only the user who ran the command can save this anime.",
        flags: ["Ephemeral"],
      });
    }

    const animes = await fetchTopAnime();
    const newAnime = animes.data[page];

    await interaction.update({
      embeds: [detailsEmbed(newAnime)],
      components: [createTopButtons(page, total, newAnime.mal_id, dbUser)],
    });
  },
} as Button;
