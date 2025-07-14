import BaseCommand from "@/structures/command";
import type { CommandParams } from "@/types";
import { SlashCommandBuilder } from "discord.js";

export default class PingCommand extends BaseCommand {
  public data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!");

  public async execute({ interaction, client, dbUser }: CommandParams) {
    const sent = await interaction.reply({
      content: "Pinging...",
      withResponse: true,
    });

    const latency =
      sent.interaction.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(
      `🏓 Pong!\n📡 Latency: ${latency}ms\n💓 API Latency: ${apiLatency}ms.`
    );
  }
}
