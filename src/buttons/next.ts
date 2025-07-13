import type { Button } from "@/types";
import { detailsEmbed, fetchTopAnime } from "@/utils/anime";
import { ButtonBuilder } from "discord.js";
import { redis } from "@/utils/redis";
import { createTopButtons } from "@/commands/top";

export default {
  customId: "next",
  async execute(interaction) {
    const key = `pagination:${interaction.message.id}`;
    const raw = await redis.get(key);
    if (!raw) {
      return interaction.editReply({
        content: "Session expired.",
      });
    }

    const { userId, page: curr, total } = JSON.parse(raw);
    if (interaction.user.id !== userId) {
      // Ignore users who didn't initiate the command
      return interaction.reply({
        content: "Only the user who ran the command can save this anime.",
        flags: ["Ephemeral"],
      });
    }

    const page = Math.max(0, curr + 1);
    const animes = await fetchTopAnime();
    const malId = animes.data[page].mal_id;

    await redis.set(
      key,
      JSON.stringify({ userId, page, total, malId }),
      "EX",
      300
    );

    await interaction.update({
      embeds: [detailsEmbed(animes.data[page])],
      components: [createTopButtons(page, total)],
    });
  },
} as Button;
