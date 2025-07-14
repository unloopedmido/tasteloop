import type { BaseCommand } from "./command";
import type { BaseButton } from "./button";
import type { BaseModal } from "./modal";
import { Client, Collection, Colors, GatewayIntentBits } from "discord.js";
import { loadCommands, registerCommands } from "@/handlers/commands";
import { loadButtons } from "@/handlers/buttons";
import { startDevWatcher } from "@/dev/watcher";
import { loadEvents } from "@/handlers/events";
import { loadModals } from "@/handlers/modals";
import { PrismaClient } from "@/stores/prisma";

export default class ExtendedClient extends Client {
  public commands: Collection<string, BaseCommand> = new Collection();
  public buttons: Collection<string, BaseButton> = new Collection();
  public modals: Collection<string, BaseModal> = new Collection();
  public activeButtons: Map<
    string,
    { messageId: string; timeout: NodeJS.Timeout }
  > = new Map();
  public theme: number = Colors.Purple;
  public db: PrismaClient = new PrismaClient();

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
    await loadCommands(this);
    await loadButtons(this);
    await loadModals(this);
    startDevWatcher(this);
    Bun.env.NODE_ENV === "production" && (await registerCommands(this));
    await loadEvents(this);
    await this.login(Bun.env.DISCORD_BOT_TOKEN);
  }
}
