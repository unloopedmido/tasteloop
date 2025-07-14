import type { CommandParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { fetchTopAnime } from "@/lib/anime/fetch";
import { SlashCommandBuilder } from "discord.js";
import { detailsEmbed } from "@/lib/anime/embed";
import { BaseCommand } from "@/structures/command";

export default class TopCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("top")
    .setDescription("Displays the top 10 currently trending animes");

  public async execute({ interaction, dbUser }: CommandParams) {
    await interaction.deferReply();

    const context = {
      type: "top" as const,
      userId: dbUser.id,
    };

    const animes = await fetchTopAnime();
    const currentAnime = animes.data[0];

    await interaction.editReply({
      embeds: [detailsEmbed(currentAnime)],
      components: [
        await createAnimeButtons(
          0,
          animes.data.length,
          currentAnime.mal_id,
          dbUser,
          context
        ),
      ],
    });
  }
}
