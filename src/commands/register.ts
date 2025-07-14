import type { CommandParams } from "@/types";
import { registerCommands } from "@/handlers/commands";
import { SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "@/structures/command";

export default class RegisterCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("register")
    .setDescription("Syncs the bot's commands with Discord");

  public admin = true;

  public async execute({ interaction, client }: CommandParams) {
    const commandNames = await registerCommands(client);

    await interaction.reply({
      content: `Commands have been registered successfully!\n${commandNames.join(
        "\n"
      )}`,
      flags: ["Ephemeral"],
    });
    return;
  }
}
