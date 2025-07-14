import { baseEmbed } from "@/lib/embed";
import { BaseCommand } from "@/structures/command";
import type { CommandParams } from "@/types";
import { SlashCommandBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Pagination } from "@acegoal07/discordjs-pagination";

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

  public async execute({ interaction, dbUser }: CommandParams) {
    await interaction.deferReply();

    if (!dbUser.animes.length) {
      await interaction.editReply({
        content:
          "Your anime list is empty. Use `/top` to discover and save some anime!",
      });
      return;
    }

    function makeProgressBar(current: number, total: number, length = 8) {
      const filled = Math.round((current / total) * length);
      return "▰".repeat(filled) + "▱".repeat(length - filled);
    }

    function getStatusEmoji(watched: number, total: number) {
      if (watched === total) return "✅";
      if (watched === 0) return "📋";
      return "📺";
    }

    const fields = dbUser.animes
      .sort(
        (a, b) => b.eps_watched! / b.eps_total! - a.eps_watched! / a.eps_total!
      )
      .filter((anime) => {
        const minScore = interaction.options.getInteger("min_score");
        return minScore === null || anime.score! >= minScore;
      })
      .map((anime) => {
        const statusEmoji = getStatusEmoji(
          anime.eps_watched ?? 0,
          anime.eps_total ?? 0
        );
        const progressBar = makeProgressBar(
          anime.eps_watched ?? 0,
          anime.eps_total ?? 0,
          8
        );

        return {
          name: `${statusEmoji} ${anime.title}`,
          value: `${progressBar} ${anime.eps_watched}/${anime.eps_total} • ${anime.score}/10`,
          inline: false,
        };
      });

    const pageSize = 8;
    const pages = [];

    for (let i = 0; i < fields.length; i += pageSize) {
      const pageFields = fields.slice(i, i + pageSize);
      const pageNumber = Math.floor(i / pageSize) + 1;
      const totalPages = Math.ceil(fields.length / pageSize);

      // Basic page info
      const totalAnimes = dbUser.animes.length;

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
