import type ExtendedClient from "@/structures/client";
import { loadCommands } from "@/handlers/commands";
import { watch } from "fs/promises";
import { log } from "./logger";

let reloadTimeout: NodeJS.Timeout | null = null;

export async function startDevWatcher(client: ExtendedClient) {
  const commandsPath = new URL("../commands", import.meta.url).pathname;

  try {
    const watcher = watch(commandsPath, { recursive: true });

    for await (const event of watcher) {
      if (event.eventType === "change" && event.filename?.endsWith(".ts")) {
        // Simple debouncing
        if (reloadTimeout) clearTimeout(reloadTimeout);

        reloadTimeout = setTimeout(async () => {
          try {
            log.info(`Reloading commands due to change in ${event.filename}`);
            await loadCommands(client);
          } catch (error) {
            log.error("Failed to reload commands:", error);
          }
        }, 100);
      }
    }
  } catch (error) {
    log.error("[WATCHER] Dev watcher error:", error);
  }
}
