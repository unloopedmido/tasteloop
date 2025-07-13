import type { Command } from "@/types";
import { detailsEmbed, fetchTopAnime } from "@/utils/anime";
import { redis } from "@/utils/redis";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";

const TTL_SECONDS = 70; // just over a minute to account for latency/delay

export function createTopButtons(page: number, total: number, saved?: boolean) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("save")
      .setLabel("Save")
      .setEmoji("🔖")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(saved === true),
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("Previous")
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId("page_counter")
      .setLabel(`Page ${page + 1} of ${total}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next")
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === total - 1)
  );
}

export default {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Displays the top 10 currently trending animes"),

  execute: async (interaction) => {
    await interaction.deferReply();
    const animes = await fetchTopAnime();
    const total = animes.data.length;
    const userId = interaction.user.id;

    const message = await interaction.editReply({
      embeds: [detailsEmbed(animes.data[0])],
      components: [createTopButtons(0, animes.data.length)],
    });

    const paginationState = {
      userId,
      page: 0,
      total,
      malId: animes.data[0].mal_id,
    };

    await redis.set(
      `pagination:${message.id}`,
      JSON.stringify(paginationState),
      "EX",
      TTL_SECONDS
    );
  },
} as Command;
