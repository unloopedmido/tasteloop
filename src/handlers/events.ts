import type { ExtendedClient } from "@/structures/client";
import { BaseClientEvent } from "@/structures/event";
import type { ClientEvents } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

export async function loadEvents(client: ExtendedClient): Promise<void> {
  const eventsPath = join(__dirname, "..", "events");
  const eventFiles = readdirSync(eventsPath).filter(
    (file) => file.endsWith(".ts") ?? file.endsWith(".js")
  );

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const { default: event } = await import(`${filePath}?update=${Date.now()}`);

    if (event && event.prototype instanceof BaseClientEvent) {
      const eventInstance = new event() as BaseClientEvent<keyof ClientEvents>;

      if (eventInstance.data.once) {
        client.once(
          eventInstance.data.name,
          (...args: ClientEvents[keyof ClientEvents]) =>
            eventInstance.execute(client, ...args)
        );
      } else {
        client.on(
          eventInstance.data.name,
          (...args: ClientEvents[keyof ClientEvents]) =>
            eventInstance.execute(client, ...args)
        );
      }
    }
  }
}
