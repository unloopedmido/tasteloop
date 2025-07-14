import type { CommandParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { getDataFetcher } from "@/lib/anime/fetchers";
import { SlashCommandBuilder } from "discord.js";
import { detailsEmbed } from "@/lib/anime/embed";
import { BaseCommand } from "@/structures/command";
import { log } from "@/utils/logger";

export default class SearchCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for an anime")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Search query").setRequired(true)
    );

  public async execute({ interaction, dbUser, client }: CommandParams) {
    await interaction.deferReply();
    const query = interaction.options.getString("query", true);

    try {
      const context = { type: "search" as const, userId: dbUser.id, query };

      const animes = await getDataFetcher("search").fetchData(context, client);
      if (!animes?.data?.length) {
        await interaction.editReply({ content: "No anime found." });
        return;
      }

      const first = animes.data[0];

      const row = await createAnimeButtons(
        0,
        animes.data.length,
        first.mal_id,
        dbUser,
        context
      );

      await interaction.editReply({
        embeds: [detailsEmbed(first)],
        components: [row],
      });
    } catch (err) {
      log.error("Search command failed:", err);
      await interaction.editReply({
        content:
          "Something went sideways while searching — try narrowing your query.",
      });
    }
  }
}
