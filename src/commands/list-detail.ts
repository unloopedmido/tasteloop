import type { CommandParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "@/structures/command";
import { fetcher } from "@/lib/anime/fetch";
import { detailsEmbed } from "@/lib/anime/embed";

export default class ListDetailCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("list-detail")
    .setDescription("Displays your saved anime list in a detailed format")
    .addStringOption((opt) =>
      opt
        .setName("search")
        .setRequired(false)
        .setDescription("Search for a specific anime in your list"),
    );

  public async execute({ interaction, userData }: CommandParams) {
    await interaction.deferReply();

    const searchQuery = interaction.options.getString("search") ?? "";
    const animes = (await fetcher("list", userData!.anilistId)).sort(
      (a, b) => b.score - a.score,
    );
    const context = {
      userId: interaction.user.id,
      animes,
    };

    const searchedAnimes = animes.filter((a) =>
      a.media.title
        .userPreferred!.toLowerCase()
        .includes(searchQuery?.toLowerCase() ?? ""),
    );

    if (searchQuery && searchedAnimes.length > 0) {
      const { row } = await createAnimeButtons(0, searchedAnimes.length, {
        ...context,
        animes: searchedAnimes,
      });

      await interaction.editReply({
        embeds: [detailsEmbed(searchedAnimes[0])],
        components: [row],
      });
      return;
    }

    if (!animes.length) {
      await interaction.editReply({
        content:
          "Your anime list is empty. Use `/top` to discover and save some anime!",
      });
      return;
    }

    const currentAnime = animes[0];
    const { row } = await createAnimeButtons(0, animes.length, context);

    await interaction.editReply({
      embeds: [detailsEmbed(currentAnime)],
      components: [row],
    });
  }
}
