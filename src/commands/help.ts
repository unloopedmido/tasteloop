import { baseEmbed } from "@/lib/embed";
import { BaseCommand } from "@/structures/command";
import type { CommandParams } from "@/types";
import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";

export default class HelpCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Returns a list of all commands");

  public async execute({ interaction, client }: CommandParams) {
    const commands = client.commands.filter((cmd) => !cmd.admin);

    const commandList = commands
      .map((cmd) => `**/${cmd.data.name}** - ${cmd.data.description}`)
      .join("\n");

    const helpEmbed = baseEmbed({
      title: "TasteLoop - Your Anime Companion",
      description:
        "*TasteLoop helps you manage your anime watchlist, track progress, and get personalized AI-powered recommendations based on your preferences.*",
      thumbnail: { url: "attachment://TasteLoopIcon.png" },
      fields: [
        {
          name: "📋 Available Commands",
          value: commandList || "No commands available",
          inline: false,
        },
      ],
    });

    await interaction.reply({
      embeds: [helpEmbed],
      files: [new AttachmentBuilder("./src/media/TasteLoopIcon.png")],
    });
  }
}
