import type { ExtendedClient, ClientEvent } from "@/types";
import type { ClientEvents } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

export async function loadEvents(client: ExtendedClient): Promise<void> {
  const eventsPath = join(__dirname, "..", "events");
  const eventFiles = readdirSync(eventsPath).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  );

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = (await import(filePath)) as { default: ClientEvent };

    if (event.default.data.once) {
      client.once(
        event.default.data.name,
        (...args: ClientEvents[keyof ClientEvents]) =>
          event.default.execute(client, ...args)
      );
    } else {
      client.on(
        event.default.data.name,
        (...args: ClientEvents[keyof ClientEvents]) =>
          event.default.execute(client, ...args)
      );
    }
  }
}
