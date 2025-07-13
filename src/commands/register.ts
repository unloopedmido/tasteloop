import { registerCommands } from "@/handlers/commands";
import type { Command } from "@/types";
import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Syncs the bot's commands with Discord"),
  admin: true,
  execute: async (interaction, client) => {
    const commandNames = await registerCommands(client);

    await interaction.reply({
      content: `Commands have been registered successfully!\n${commandNames.join(
        "\n"
      )}`,
      flags: ["Ephemeral"],
    });
    return;
  },
} as Command;
