import type { CommandParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { SlashCommandBuilder } from "discord.js";
import { detailsEmbed } from "@/lib/anime/embed";
import { BaseCommand } from "@/structures/command";
import { fetcher } from "@/lib/anime/fetch";

export default class SearchCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for an anime")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Search query").setRequired(true)
    );

  public async execute({ interaction }: CommandParams) {
    await interaction.deferReply();
    const query = interaction.options.getString("query", true);

    const animes = await fetcher("search", query);

    if (!animes.length) {
      await interaction.editReply({ content: "No anime found." });
      return;
    }

    const context = {
      userId: interaction.user.id,
      animes,
    };

    const first = animes[0];
    const { row } = await createAnimeButtons(
      0,
      animes.length,
      context,
      undefined,
      "search"
    );

    await interaction.editReply({
      embeds: [detailsEmbed(first)],
      components: [row],
    });
  }
}
