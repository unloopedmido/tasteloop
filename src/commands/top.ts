import type { CommandParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { fetcher } from "@/lib/anime/fetch";
import { SlashCommandBuilder } from "discord.js";
import { detailsEmbed } from "@/lib/anime/embed";
import { BaseCommand } from "@/structures/command";

export default class TopCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("top")
    .setDescription("Displays the top 10 currently trending animes");

  public async execute({ interaction }: CommandParams) {
    await interaction.deferReply();

    const animes = await fetcher("top");
    const context = {
      userId: interaction.user.id,
      animes,
    };
    const currentAnime = animes[0];
    const { row } = await createAnimeButtons(
      0,
      animes.length,
      context,
      undefined,
      "top"
    );

    await interaction.editReply({
      embeds: [detailsEmbed(currentAnime)],
      components: [row],
    });
  }
}
