import type ExtendedClient from "@/structures/client";
import { BaseModal } from "@/structures/modal";
import { log } from "@/utils/logger";
import { readdirSync } from "fs";
import { join } from "path";

export async function loadModals(client: ExtendedClient): Promise<void> {
  const modalsPath = join(__dirname, "..", "modals");
  const modalFiles = readdirSync(modalsPath).filter(
    (f) => f.endsWith(".ts") || f.endsWith(".js")
  );

  for (const file of modalFiles) {
    const { default: modal } = await import(
      `${join(modalsPath, file)}?update=${Date.now()}`
    );

    if (modal && modal.prototype instanceof BaseModal) {
      const modalInstance = new modal() as BaseModal;

      client.modals.set(modalInstance.customId, modalInstance);
      log.info(`Loaded modal: ${modalInstance.customId}`);
    }
  }
}
