import type { Button, ExtendedClient } from "@/types";
import { log } from "@/utils/logger";
import { readdirSync } from "fs";
import { join } from "path";

export async function loadButtons(client: ExtendedClient): Promise<void> {
  const buttonsPath = join(__dirname, "..", "buttons");
  const buttonFiles = readdirSync(buttonsPath).filter(
    (f) => f.endsWith(".ts") || f.endsWith(".js")
  );

  for (const file of buttonFiles) {
    const { default: handler } = await import(
      `${join(buttonsPath, file)}?update=${Date.now()}`
    );

    if ("customId" in handler && "execute" in handler) {
      client.buttons.set(handler.customId, handler);
      log.info(`Loaded button: ${handler.customId}`);
    }
  }
}
