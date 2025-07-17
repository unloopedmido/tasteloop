import type { CommandParams } from "@/types";
import { BaseCommand } from "@/structures/command";
import { generateAuthURL } from "@/lib/auth";
import { baseEmbed } from "@/lib/embed";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";

export default class AuthCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("auth")
    .setDescription("Authenticate with the API");

  public async execute({ interaction, userData }: CommandParams) {
    if (userData) {
      await interaction.reply({
        embeds: [
          baseEmbed({
            title: "Already Authenticated",
            description:
              "Your Anilist account is already linked to this Discord account.\nIf you want to change the linked account, please use the `/unlink` command.",
          }),
        ],
        flags: ["Ephemeral"],
      });
      return;
    }

    const url = generateAuthURL(interaction.user.id);

    await interaction.reply({
      embeds: [
        baseEmbed({
          title: "Connect your Anilist account",
          description:
            "Please click the button below to link your Discord account with your Anilist account.",
        }),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Authenticate")
            .setStyle(ButtonStyle.Link)
            .setURL(url),
        ),
      ],
      flags: ["Ephemeral"],
    });
  }
}
