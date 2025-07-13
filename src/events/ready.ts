import type { ClientEvent } from "@/types";
import { log } from "@/utils/logger";
import { ActivityType } from "discord.js";

export default {
  data: {
    name: "ready",
    once: true,
  },
  execute: async (client) => {
    log.success(`Logged in as ${client.user?.tag}!`);
    client.user?.setActivity("your favorite anime", {
      type: ActivityType.Watching,
    });
  },
} as ClientEvent<"ready">;
