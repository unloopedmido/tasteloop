import type { BaseCommand } from "./command";
import type { BaseButton } from "./button";
import type { BaseModal } from "./modal";
import { Client, Collection, Colors, GatewayIntentBits } from "discord.js";
import { loadCommands, registerCommands } from "@/handlers/commands";
import { loadButtons } from "@/handlers/buttons";
import { startDevWatcher } from "@/dev/watcher";
import { loadEvents } from "@/handlers/events";
import { loadModals } from "@/handlers/modals";
import { prisma } from "@/lib/db";
import { startServer } from "@/server";

declare global {
  var botStarted: boolean | undefined;
}

export class ExtendedClient extends Client {
  public commands: Collection<string, BaseCommand> = new Collection();
  public buttons: Collection<string, BaseButton> = new Collection();
  public modals: Collection<string, BaseModal> = new Collection();
  public activeButtons: Map<
    string,
    { messageId: string; timeout: NodeJS.Timeout }
  > = new Map();
  public theme: number = Colors.Purple;
  public db = prisma;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  public async init(): Promise<void> {
    if (globalThis.botStarted) {
      throw new Error("Bot is already running!");
    }

    globalThis.botStarted = true;

    await loadCommands(this);
    await loadButtons(this);
    await loadModals(this);
    Bun.env.NODE_ENV === "development" && startDevWatcher(this);
    Bun.env.NODE_ENV === "production" && (await registerCommands(this));
    await loadEvents(this);
    await startServer();
    await this.login(Bun.env.DISCORD_BOT_TOKEN);
  }
}
