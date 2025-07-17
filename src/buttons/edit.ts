import type { AnimeContext } from "@/types/anime.new";
import type { ButtonParams } from "@/types";
import { BaseButton } from "@/structures/button";
import { fetchContext } from "@/stores/redis";
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { followUpOrReply } from "@/utils/misc";

export default class EditButton extends BaseButton {
  public customId = "edit";

  public async execute({ interaction }: ButtonParams) {
    const [, ctxKey] = interaction.customId.split(":");

    const data = await fetchContext<{
      page: number;
      context: AnimeContext;
    }>(ctxKey);

    if (!data) {
      await followUpOrReply(interaction, {
        content: "Session expired. Try again.",
        flags: ["Ephemeral"],
      });
      return;
    }

    if (interaction.user.id !== data.context.userId) {
      await followUpOrReply(interaction, {
        content: "Not your session.",
        flags: ["Ephemeral"],
      });
      return;
    }

    const currentAnime = data.context.animes[data.page];
    let animeTitle = "";

    if ("media" in currentAnime) {
      animeTitle =
        currentAnime.media.title.userPreferred ||
        currentAnime.media.title.english ||
        currentAnime.media.title.romaji ||
        "Unknown Title";
    } else {
      animeTitle =
        currentAnime.title.userPreferred ||
        currentAnime.title.english ||
        currentAnime.title.romaji ||
        "Unknown Title";
    }

    const savedAnime = "media" in currentAnime ? currentAnime : null;

    const editModal = new ModalBuilder()
      .setCustomId(`edit:${ctxKey}`)
      .setTitle(`Edit ${animeTitle.substring(0, 50)}`)
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setPlaceholder(
              "Enter the number of episodes watched (all if completed)"
            )
            .setValue(savedAnime?.progress.toString() || "0")
            .setStyle(TextInputStyle.Short)
            .setLabel("Episodes Watched")
            .setCustomId("progress")
            .setRequired(true)
            .setMaxLength(10)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setPlaceholder("How do you rate this anime from 1 to 10")
            .setValue(savedAnime?.score.toString() || "1")
            .setStyle(TextInputStyle.Short)
            .setLabel("Score")
            .setCustomId("score")
            .setRequired(true)
            .setMaxLength(3)
        )
      );

    await interaction.showModal(editModal);
  }
}
