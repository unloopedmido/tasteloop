import type { CommandParams } from "@/types";
import { SlashCommandBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Pagination } from "@acegoal07/discordjs-pagination";
import { BaseCommand } from "@/structures/command";
import { fetcher } from "@/lib/anime/fetch";
import { baseEmbed } from "@/lib/embed";
import { processListAnimes } from "@/lib/anime/process";
import { makeProgressBar } from "@/utils/misc";

export default class ListNewCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("list")
    .setDescription("Displays your saved anime list in a compact format")
    .addIntegerOption((opt) =>
      opt
        .setName("min_score")
        .setDescription("Minimum score to filter animes")
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(10)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("max_score")
        .setDescription("Maximum score to filter animes")
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(10)
    );

  public async execute({ interaction }: CommandParams) {
    await interaction.deferReply();

    const rawAnimes = await fetcher("list");
    const animes = processListAnimes(rawAnimes);

    function getStatusEmoji(watched: number, total: number) {
      if (watched === total) return "✅";
      if (watched === 0) return "📋";
      return "📺";
    }

    const fields = animes
      .sort((a, b) => b.score - a.score)
      .filter((anime) => {
        const minScore = interaction.options.getInteger("min_score");
        return minScore === null || anime.score! >= minScore;
      })
      .map((anime) => {
        const statusEmoji = getStatusEmoji(
          anime.progress ?? 0,
          anime.media.episodes ?? 0
        );
        const progressBar = makeProgressBar(
          anime.progress ?? 0,
          anime.media.episodes ?? 0,
          8
        );

        return {
          name: `${statusEmoji} ${anime.media.title.userPreferred}`,
          value: `${progressBar} ${anime.progress}/${anime.media.episodes} • ${anime.score}/10`,
          inline: false,
        };
      });

    const pageSize = 8;
    const pages = [];

    for (let i = 0; i < fields.length; i += pageSize) {
      const pageFields = fields.slice(i, i + pageSize);
      const pageNumber = Math.floor(i / pageSize) + 1;
      const totalPages = Math.ceil(fields.length / pageSize);

      const totalAnimes = animes.length;

      const embed = baseEmbed({
        title: `Your Anime List (${totalAnimes} entries)`,
        description: `Page ${pageNumber}/${totalPages}`,
        fields: pageFields,
      });

      pages.push(embed);
    }

    new Pagination()
      .setButtonList([
        new ButtonBuilder()
          .setEmoji("⬅")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("previous"),
        new ButtonBuilder()
          .setEmoji("➡")
          .setStyle(ButtonStyle.Secondary)
          .setCustomId("next"),
      ])
      .setPageList(pages)
      .setTimeout(120000)
      .setPortal(interaction)
      .paginate();
  }
}
