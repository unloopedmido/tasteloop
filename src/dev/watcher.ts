import type ExtendedClient from "@/structures/client";
import { loadCommands } from "@/handlers/commands";
import { loadButtons } from "@/handlers/buttons";
import { loadModals } from "@/handlers/modals";
import { watch } from "fs/promises";
import { log } from "@/utils/logger";

const DEBOUNCE_DELAY = 300;
let reloadTimeout: NodeJS.Timeout | null = null;

const watchers = [
  { path: "../commands", handler: "loadCommands", loader: loadCommands },
  { path: "../buttons", handler: "loadButtons", loader: loadButtons },
  { path: "../modals", handler: "loadModals", loader: loadModals },
];

function debounce(fn: () => Promise<void>) {
  if (reloadTimeout) clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(fn, DEBOUNCE_DELAY);
}

async function reloadHandler(
  client: ExtendedClient,
  handlerName: string,
  loader: (client: ExtendedClient) => Promise<void>
) {
  try {
    log.info(`Reloading ${handlerName}...`);
    await loader(client);
    log.info(`${handlerName} reloaded successfully`);
  } catch (error) {
    log.error(`Failed to reload ${handlerName}:`, error);
  }
}

export async function startDevWatcher(client: ExtendedClient) {
  for (const { path: watchPath, handler, loader } of watchers) {
    const fullPath = new URL(watchPath, import.meta.url).pathname;

    try {
      const watcher = watch(fullPath, { recursive: true });

      (async () => {
        for await (const event of watcher) {
          if (event.eventType === "change" && event.filename?.endsWith(".ts")) {
            debounce(() => reloadHandler(client, handler, loader));
          }
        }
      })().catch((error) => log.error(`Error watching ${watchPath}:`, error));

      log.info(`Watching ${watchPath.replace("../", "")} for changes`);
    } catch (error) {
      log.error(`Failed to start watching ${watchPath}:`, error);
    }
  }
}
