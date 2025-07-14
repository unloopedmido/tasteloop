import type { CommandParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { getDataFetcher } from "@/lib/anime/fetchers";
import { SlashCommandBuilder } from "discord.js";
import { detailsEmbed } from "@/lib/anime/embed";
import { BaseCommand } from "@/structures/command";

export default class ListCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("list-detail")
    .setDescription("Displays your saved anime list in a detailed format")
    .addStringOption((opt) =>
      opt
        .setName("search")
        .setRequired(false)
        .setDescription("Search for a specific anime in your list")
    );

  public async execute({ interaction, dbUser, client }: CommandParams) {
    await interaction.deferReply();

    const searchQuery = interaction.options.getString("search");

    const context = {
      type: "list" as const,
      userId: dbUser.id,
    };

    const searchedAnime = dbUser.animes.find((a) =>
      a.title.toLowerCase().includes(searchQuery?.toLowerCase() ?? "")
    );

    if (searchQuery && searchedAnime) {
      await interaction.editReply({
        embeds: [detailsEmbed(searchedAnime)],
        components: [
          await createAnimeButtons(0, 1, searchedAnime.malId, dbUser, context),
        ],
      });
      return;
    }

    const dataFetcher = getDataFetcher(context.type);
    const animes = await dataFetcher.fetchData(context, client);

    if (!animes.data.length) {
      await interaction.editReply({
        content:
          "Your anime list is empty. Use `/top` to discover and save some anime!",
      });
      return;
    }

    const currentAnime = animes.data[0];

    await interaction.editReply({
      embeds: [detailsEmbed(currentAnime)],
      components: [
        await createAnimeButtons(
          0,
          animes.data.length,
          currentAnime.mal_id ?? currentAnime.malId,
          dbUser,
          context
        ),
      ],
    });
  }
}
