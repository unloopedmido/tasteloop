import type { ExtendedClient } from "@/structures/client";
import { BaseClientEvent } from "@/structures/event";
import { ActivityType } from "discord.js";
import { log } from "@/utils/logger";

export default class ReadyEvent extends BaseClientEvent<"ready"> {
  public data = {
    name: "ready" as const,
    once: true,
  };

  public async execute(client: ExtendedClient) {
    log.success(`Logged in as ${client.user?.tag}!`);
    client.user?.setActivity("your favorite anime", {
      type: ActivityType.Watching,
    });
  }
}
