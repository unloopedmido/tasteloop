import { storeContext, updateContext } from "@/stores/redis";
import type { AnimeContext } from "@/types/anime.new";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { randomUUID } from "crypto";

interface StoredAnimeData {
  page: number;
  total: number;
  context: AnimeContext;
  lastUpdated: number;
}

export async function createAnimeButtons(
  page: number,
  total: number,
  context: AnimeContext,
  existingCtxKey?: string,
) {
  const data: StoredAnimeData = {
    page,
    total,
    context,
    lastUpdated: Date.now(),
  };

  let ctxKey = existingCtxKey;

  if (ctxKey) {
    const updated = await updateContext(ctxKey, data, 300);
    if (!updated) {
      ctxKey = randomUUID();
      await storeContext(data, 300, ctxKey);
    }
  } else {
    ctxKey = randomUUID();
    await storeContext(data, 300, ctxKey);
  }

  return {
    row: new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`go:${ctxKey}:prev`)
        .setLabel("◀️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId(`go:${ctxKey}:next`)
        .setLabel("▶️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === total - 1),
    ),
    ctxKey,
  };
}

export async function updateAnimeButtons(
  page: number,
  total: number,
  context: AnimeContext,
  ctxKey: string,
) {
  const data: StoredAnimeData = {
    page,
    total,
    context,
    lastUpdated: Date.now(),
  };

  await updateContext(ctxKey, data, 300);

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`go:${ctxKey}:prev`)
      .setLabel("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`go:${ctxKey}:next`)
      .setLabel("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === total - 1),
  );
}
