import BaseCommand from "@/structures/command";
import type { CommandParams } from "@/types";
import { detailsEmbed, fetchTopAnime } from "@/utils/anime";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";

const animes = await fetchTopAnime();

export function createTopButtons(
  page: number,
  total: number,
  malId: number,
  dbUser: { animes?: { malId: number }[]; id: string }
) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`save_${malId}_${dbUser.id}`)
      .setLabel("Save")
      .setEmoji("🔖")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(dbUser.animes?.some((anime) => anime.malId === malId)),
    new ButtonBuilder()
      .setCustomId(`go_${page - 1}_${total}_${dbUser.id}`)
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
      .setCustomId(`go_${page + 1}_${total}_${dbUser.id}`)
      .setLabel("Next")
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === total - 1)
  );
}

export default class TopCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("top")
    .setDescription("Displays the top 10 currently trending animes");

  public async execute({ interaction, dbUser }: CommandParams) {
    await interaction.deferReply();

    const currentAnime = animes.data[0];

    await interaction.editReply({
      embeds: [detailsEmbed(currentAnime)],
      components: [
        createTopButtons(0, animes.data.length, currentAnime.mal_id, dbUser),
      ],
    });
  }
}
