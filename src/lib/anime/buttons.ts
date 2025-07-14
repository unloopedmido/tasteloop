import { storeContext } from "@/stores/redis";
import type { AnimeContext } from "@/types/anime";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export async function createAnimeButtons(
  page: number,
  total: number,
  malId: number,
  dbUser: { animes?: { malId: number }[]; id: string },
  context: AnimeContext
) {
  const uuid = await storeContext(
    { page, total, malId, userId: dbUser.id, context },
    120
  );

  const isSaved = dbUser.animes?.some((a) => a.malId === malId);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`go:${uuid}:prev`)
      .setLabel("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    ...(isSaved
      ? [
          new ButtonBuilder()
            .setCustomId(`manage:${uuid}:delete`)
            .setLabel("Delete")
            .setEmoji("🗑️")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(!isSaved),
          new ButtonBuilder()
            .setCustomId(`manage:${uuid}:update`)
            .setLabel("Update")
            .setEmoji("✏️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!isSaved),
        ]
      : [
          new ButtonBuilder()
            .setCustomId(`manage:${uuid}:save`)
            .setLabel("Save")
            .setEmoji("💾")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(isSaved),
        ]),
    new ButtonBuilder()
      .setCustomId(`go:${uuid}:next`)
      .setLabel("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === total - 1)
  );
}
