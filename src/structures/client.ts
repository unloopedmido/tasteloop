import type { Button, Command, ExtendedClient, Modal } from "@/types";
import { Client, Collection, Colors, GatewayIntentBits } from "discord.js";
import { loadCommands, registerCommands } from "@/handlers/commands";
import { loadEvents } from "@/handlers/events";
import { startDevWatcher } from "@/utils/watcher";
import { PrismaClient } from "@/utils/prisma";
import { loadButtons } from "@/handlers/buttons";
import { loadModals } from "@/handlers/modals";

export class BotClient extends Client implements ExtendedClient {
  public commands: Collection<string, Command>;
  public buttons: Collection<string, Button>;
  public modals: Collection<string, Modal>;
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
