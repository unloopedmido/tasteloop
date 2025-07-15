import type { CommandParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { SlashCommandBuilder } from "discord.js";
import { detailsEmbed } from "@/lib/anime/embed";
import { BaseCommand } from "@/structures/command";
import { log } from "@/utils/logger";
import { fetcher } from "@/lib/anime/fetch";

export default class SearchCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for an anime")
    .addStringOption((opt) =>
      opt.setName("query").setDescription("Search query").setRequired(true)
    );

  public async execute({ interaction, dbUser, client }: CommandParams) {
    console.log(
      `↪️  [search] before defer: replied=${interaction.replied} deferred=${interaction.deferred}`
    );

    await interaction.deferReply();
    const query = interaction.options.getString("query", true);

    try {
      const context = { type: "search" as const, userId: dbUser.id, query };

      const animes = await fetcher(context);
      if (!animes.length) {
        await interaction.editReply({ content: "No anime found." });
        return;
      }

      const first = animes[0];

      const row = await createAnimeButtons(
        0,
        animes.length,
        first.id,
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
