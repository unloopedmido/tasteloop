import { redis, storeContext, updateContext } from "@/stores/redis";
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
  commandType?: string
) {
  // Use command-specific context key to avoid conflicts between different commands
  const contextSuffix = commandType || "default";
  const userCtxKey = `userctx:${context.userId}:${contextSuffix}`;
  let ctxKey = existingCtxKey;

  // If no existing context key, try to get it from user mapping
  if (!ctxKey) {
    ctxKey = (await redis.get(userCtxKey)) || undefined;
  }

  const data: StoredAnimeData = {
    page,
    total,
    context,
    lastUpdated: Date.now(),
  };

  if (ctxKey) {
    // Try to update existing context
    const updated = await updateContext(ctxKey, data, 300); // 5 minutes TTL

    if (!updated) {
      // Context expired, create new one
      ctxKey = randomUUID();
      await storeContext(data, 300, ctxKey);
      await redis.set(userCtxKey, ctxKey, "EX", 300);
    }
  } else {
    // Create new context
    ctxKey = randomUUID();
    await storeContext(data, 300, ctxKey);
    await redis.set(userCtxKey, ctxKey, "EX", 300);
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
        .setDisabled(page === total - 1)
    ),
    ctxKey, // Return the context key for reuse
  };
}

// Optimized version for button navigation (when you already have the context key)
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

  // Just update the existing context with new page
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
      .setDisabled(page === total - 1)
  );
}
