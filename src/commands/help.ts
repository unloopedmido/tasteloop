import BaseCommand from "@/structures/command";
import type { CommandParams } from "@/types";
import {
  AttachmentBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

export default class HelpCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Returns a list of all commands");

  public async execute({ interaction, client }: CommandParams) {
    const commands = client.commands.filter((cmd) => !cmd.admin);

    const helpEmbed = new EmbedBuilder()
      .setTitle("🍜 TasteLoop - Your Anime Companion")
      .setDescription(
        "*TasteLoop helps you manage your anime watchlist, track progress, and get personalized AI-powered recommendations based on your preferences.*\n\n**Here are the commands you can use:**"
      )
      .setThumbnail("attachment://TasteLoopIcon.png")
      .setColor(client.theme)
      .addFields(
        commands.map((cmd) => ({
          name: `/${cmd.data.name}`,
          value: `*${cmd.data.description}*`,
          inline: true,
        }))
      )
      .setImage("attachment://TasteLoop.png")
      .setFooter({
        text: "Made with ❤️ by Cored, Inc",
        iconURL: "https://avatars.githubusercontent.com/u/111197202",
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [helpEmbed],
      files: [new AttachmentBuilder("./src/media/TasteLoopIcon.png")],
    });
  }
}
