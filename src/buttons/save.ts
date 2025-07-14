import type { Button } from "@/types";
import { fetchAnime } from "@/utils/anime";
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ModalActionRowComponentBuilder,
} from "discord.js";

export default {
  customId: "save",
  execute: async (interaction) => {
    const malId = parseInt(interaction.customId.split("_")[1], 10);
    const userId = interaction.customId.split("_")[2];

    if (interaction.user.id !== userId) {
      // Ignore users who didn't initiate the command
      return interaction.reply({
        content: "Only the user who ran the command can save this anime.",
        flags: ["Ephemeral"],
      });
    }

    const response = await fetchAnime(Number(malId));
    const anime = response.data;

    if (!anime) {
      return interaction.update({
        content: "Failed to find anime.",
      });
    }

    const epsWatchedInput = new TextInputBuilder()
      .setCustomId("eps_watched")
      .setLabel("Episodes Watched")
      .setPlaceholder("The amount you've watched, empty if not started.")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(4)
      .setRequired(false)
      .setValue("0");

    const scoreInput = new TextInputBuilder()
      .setCustomId("score")
      .setLabel("Score")
      .setPlaceholder("Your score for this anime, 1-10 or empty if not rated.")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(2)
      .setRequired(false)
      .setValue("0");

    const modal = new ModalBuilder()
      .setCustomId(`save_${anime.mal_id}`)
      .setTitle(`Save ${anime.title}`)
      .addComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          epsWatchedInput
        ),
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          scoreInput
        )
      );

    await interaction.showModal(modal);
  },
} as Button;
