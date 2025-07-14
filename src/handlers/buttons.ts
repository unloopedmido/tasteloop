import type ExtendedClient from "@/structures/client";
import { BaseButton } from "@/structures/button";
import { log } from "@/utils/logger";
import { readdirSync } from "fs";
import { join } from "path";

export async function loadButtons(client: ExtendedClient): Promise<void> {
  const buttonsPath = join(__dirname, "..", "buttons");
  const buttonFiles = readdirSync(buttonsPath).filter(
    (f) => f.endsWith(".ts") || f.endsWith(".js")
  );

  for (const file of buttonFiles) {
    const { default: button } = await import(
      `${join(buttonsPath, file)}?update=${Date.now()}`
    );

    if (button && button.prototype instanceof BaseButton) {
      const buttonInstance = new button() as BaseButton;

      client.buttons.set(buttonInstance.customId, buttonInstance);
      log.info(`Loaded button: ${buttonInstance.customId}`);
    }
  }
}

export function scheduleButtonRemoval(
  client: ExtendedClient,
  messageId: string,
  channelId: string,
  customId: string,
  timeoutMs: number = 30_000 // Default to 30 seconds
): void {
  const existing = client.activeButtons.get(customId);
  if (existing) {
    clearTimeout(existing.timeout);
  }

  const timeout = setTimeout(async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) return;

      const message = await channel.messages.fetch(messageId);
      if (!message) return;

      await message.edit({
        components: [],
      });

      client.activeButtons.delete(customId);
    } catch (error) {
      log.error(`Error removing expired buttons for ${customId}:`, error);
      client.activeButtons.delete(customId);
    }
  }, timeoutMs);

  client.activeButtons.set(customId, { messageId, timeout });
}

export function cancelButtonRemoval(
  client: ExtendedClient,
  customId: string
): void {
  const existing = client.activeButtons.get(customId);
  if (existing) {
    clearTimeout(existing.timeout);
    client.activeButtons.delete(customId);
  }
}
