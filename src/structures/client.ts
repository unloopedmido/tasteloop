import { Client, Collection, Colors, GatewayIntentBits } from "discord.js";
import { loadCommands, registerCommands } from "@/handlers/commands";
import { loadEvents } from "@/handlers/events";
import { startDevWatcher } from "@/utils/watcher";
import { PrismaClient } from "@/utils/prisma";
import { loadButtons } from "@/handlers/buttons";
import { loadModals } from "@/handlers/modals";
import type BaseCommand from "./command";
import type { BaseButton } from "./button";
import type { BaseModal } from "./modal";

export default class ExtendedClient extends Client {
  public commands: Collection<string, BaseCommand>;
  public buttons: Collection<string, BaseButton>;
  public modals: Collection<string, BaseModal>;
  public activeButtons: Map<
    string,
    { messageId: string; timeout: NodeJS.Timeout }
  >;
  public theme: number;
  public db: PrismaClient;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.commands = new Collection();
    this.buttons = new Collection();
    this.activeButtons = new Map();
    this.modals = new Collection();
    this.db = new PrismaClient();
    this.theme = Colors.Purple;
  }

  public async init(): Promise<void> {
    await loadCommands(this);
    await loadButtons(this);
    await loadModals(this);
    if (Bun.env.NODE_ENV === "production") {
      await registerCommands(this);
    } else {
      startDevWatcher(this);
    }

    await loadEvents(this);

    await this.login(Bun.env.DISCORD_BOT_TOKEN);
  }
}
