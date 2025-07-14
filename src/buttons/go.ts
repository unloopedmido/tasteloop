import { createTopButtons } from "@/commands/top";
import { BaseButton } from "@/structures/button";
import { type ButtonParams } from "@/types";
import { detailsEmbed, fetchTopAnime } from "@/utils/anime";

export default class GoButton extends BaseButton {
  public customId = "go";

  public async execute({ interaction, dbUser }: ButtonParams) {
    const page = parseInt(interaction.customId.split("_")[1], 10);
    const total = parseInt(interaction.customId.split("_")[2], 10);
    const userId = interaction.customId.split("_")[3];

    if (interaction.user.id !== userId) {
      // Ignore users who didn't initiate the command
      await interaction.reply({
        content: "Only the user who ran the command can save this anime.",
        flags: ["Ephemeral"],
      });
      return;
    }

    const animes = await fetchTopAnime();
    const newAnime = animes.data[page];

    await interaction.update({
      embeds: [detailsEmbed(newAnime)],
      components: [createTopButtons(page, total, newAnime.mal_id, dbUser)],
    });
  }
}
