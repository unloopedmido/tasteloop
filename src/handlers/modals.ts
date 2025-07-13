import type { ExtendedClient, Modal } from "@/types";
import { readdirSync } from "fs";
import { join } from "path";
import { log } from "@/utils/logger";

export async function loadModals(client: ExtendedClient): Promise<void> {
  const modalsPath = join(__dirname, "..", "modals");
  const modalFiles = readdirSync(modalsPath).filter(
    (f) => f.endsWith(".ts") || f.endsWith(".js")
  );

  for (const file of modalFiles) {
    const { default: handler } = await import(
      `${join(modalsPath, file)}?update=${Date.now()}`
    );
    if ("customId" in handler && "execute" in handler) {
      client.modals.set(handler.customId, handler as Modal);
      log.info(`Loaded modal: ${handler.customId}`);
    }
  }
}
