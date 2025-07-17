import type { AnimeContext } from "@/types/anime.new";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { storeContext, updateContext } from "@/stores/redis";
import { randomUUID } from "crypto";

interface StoredAnimeData {
  page: number;
  total: number;
  context: AnimeContext;
  lastUpdated: number;
}

function createButtons(
  ctxKey: string,
  page: number,
  total: number,
  saved: boolean = false
) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`go:${ctxKey}:prev`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`edit:${ctxKey}`)
      .setLabel(saved ? "Edit" : "Save")
      .setEmoji(saved ? "✏️" : "💾")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`go:${ctxKey}:next`)
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === total - 1)
  );
}

export async function createAnimeButtons(
  page: number,
  total: number,
  context: AnimeContext,
  existingCtxKey?: string
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

  const currentAnime = context.animes[page];
  const saved = currentAnime && "media" in currentAnime;

  return {
    row: createButtons(ctxKey, page, total, saved),
    ctxKey,
  };
}

export async function updateAnimeButtons(
  page: number,
  total: number,
  context: AnimeContext,
  ctxKey: string
) {
  const data: StoredAnimeData = {
    page,
    total,
    context,
    lastUpdated: Date.now(),
  };

  await updateContext(ctxKey, data, 300);

  const currentAnime = context.animes[page];
  const saved = currentAnime && "media" in currentAnime;

  return createButtons(ctxKey, page, total, saved);
}
