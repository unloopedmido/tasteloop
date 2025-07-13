import { watch } from "fs/promises";
import type { ExtendedClient } from "@/types";
import { loadCommands } from "@/handlers/commands";
import { loadButtons } from "@/handlers/buttons";
import { loadModals } from "@/handlers/modals";
import { log } from "./logger";

let reloadTimeout: NodeJS.Timeout | null = null;

export async function startDevWatcher(client: ExtendedClient) {
  const commandsPath = new URL("../commands", import.meta.url).pathname;
  const buttonsPath = new URL("../buttons", import.meta.url).pathname;
  const modalsPath = new URL("../modals", import.meta.url).pathname;

  try {
    const watchers = [
      watch(commandsPath, { recursive: true }),
      watch(buttonsPath, { recursive: true }),
      watch(modalsPath, { recursive: true }),
    ];

    for await (const watcher of watchers) {
      for await (const event of watcher) {
        if (event.eventType === "change" && event.filename?.endsWith(".ts")) {
          // Simple debouncing
          if (reloadTimeout) clearTimeout(reloadTimeout);

          reloadTimeout = setTimeout(async () => {
            try {
              log.info(
                `Reloading components due to change in ${event.filename}`
              );
              await Promise.all([
                loadCommands(client),
                loadButtons(client),
                loadModals(client),
              ]);
            } catch (error) {
              log.error("Failed to reload components:", error);
            }
          }, 100);
        }
      }
    }
  } catch (error) {
    log.error("[WATCHER] Dev watcher error:", error);
  }
}
