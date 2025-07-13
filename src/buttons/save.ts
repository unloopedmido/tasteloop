import type { Button } from "@/types";
import { fetchAnime } from "@/utils/anime";
import { redis } from "@/utils/redis";
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
    const key = `pagination:${interaction.message.id}`;
    const raw = await redis.get(key);
    if (!raw) {
      return interaction.editReply({
        content: "Session expired.",
      });
    }

    const { userId, malId } = JSON.parse(raw);

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
      .setPlaceholder("The amount you've watched, 0 if none.")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(4)
      .setRequired(true)
      .setValue("0");

    const scoreInput = new TextInputBuilder()
      .setCustomId("score")
      .setLabel("Score")
      .setPlaceholder("Your score for this anime, 1-10")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(2)
      .setRequired(true)
      .setValue("5");

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
