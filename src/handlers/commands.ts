import type { ExtendedClient } from "@/types";
import { log } from "@/utils/logger";
import { REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

export async function loadCommands(client: ExtendedClient): Promise<void> {
  const commandsPath = join(__dirname, "..", "commands");
  const commandFiles = readdirSync(commandsPath).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(`${filePath}?update=${Date.now()}`);

    if ("data" in command.default && "execute" in command.default) {
      client.commands.set(command.default.data.name, command.default);
      log.info(`Reloaded command: ${command.default.data.name}`);
    }
  }
}

export async function registerCommands(
  client: ExtendedClient
): Promise<string[]> {
  const commands = [...client.commands.values()].map((c) => c.data.toJSON());

  const rest = new REST().setToken(Bun.env.DISCORD_BOT_TOKEN!);

  try {
    log.info(`Started refreshing ${commands.length} application (/) commands.`);

    await rest.put(Routes.applicationCommands(Bun.env.DISCORD_BOT_ID!), {
      body: commands,
    });

    log.info(
      `Successfully reloaded ${commands.length} application (/) commands.`
    );

    return commands.map((c) => c.name);
  } catch (error) {
    log.error("Error with the command handler", error);
  }

  return commands.map((c) => c.name);
}
