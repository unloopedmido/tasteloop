import type { ClientEvent } from "@/types";
import { EmbedBuilder, type Interaction } from "discord.js";
import { log } from "@/utils/logger";

export default {
  data: {
    name: "interactionCreate",
  },
  execute: async (client, interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const dbUser = await client.db.user.findUnique({
        where: { id: interaction.user.id },
        include: { animes: true },
      });

      if (!dbUser) {
        try {
          await client.db.user.create({ data: { id: interaction.user.id } });
          await interaction.user.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("🍜 Welcome to Tasteloop!")
                .setDescription(
                  "*We are glad to have you here! Please use /help to learn more.*"
                )
                .setFooter({
                  text: "Made with ❤️ by Cored, Inc",
                  iconURL: "https://avatars.githubusercontent.com/u/111197202",
                })
                .setColor("Blurple"),
            ],
          });
        } catch {
          // DMs disabled or error: silently ignore
        }
      }

      const command = client.commands.get(interaction.commandName);
      if (!command) {
        log.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        if (
          command.admin &&
          !Bun.env.OWNER_IDS?.includes(interaction.user.id)
        ) {
          await interaction.reply({
            content: "You do not have permission to use this command!",
            flags: ["Ephemeral"],
          });
          return;
        }

        await command.execute(interaction, client, dbUser!);
      } catch (error) {
        log.error(`Error executing command ${interaction.commandName}:`, error);
        const replyPayload = {
          content: "There was an error while executing this command!",
          flags: ["Ephemeral"] as const,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyPayload);
        } else {
          await interaction.reply(replyPayload);
        }
      }

      return;
    }

    if (interaction.isButton()) {
      const [baseId] = interaction.customId.split("_");
      const handler = client.buttons.get(baseId);
      if (!handler) return;

      try {
        await handler.execute(interaction, client);
      } catch (error) {
        log.error(
          `Error executing button handler ${interaction.customId}:`,
          error
        );
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: "Button handler error.",
            flags: ["Ephemeral"],
          });
        } else {
          await interaction.reply({
            content: "Button handler error.",
            flags: ["Ephemeral"],
          });
        }
      }

      return;
    }

    if (interaction.isModalSubmit()) {
      const [baseId] = interaction.customId.split("_");
      const handler = client.modals.get(baseId);
      if (!handler) return;

      try {
        await handler.execute(interaction, client);
      } catch (error) {
        log.error(
          `Error executing modal handler ${interaction.customId}:`,
          error
        );
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({
            content: "Modal handler error.",
            flags: ["Ephemeral"],
          });
        } else {
          await interaction.reply({
            content: "Modal handler error.",
            flags: ["Ephemeral"],
          });
        }
      }

      return;
    }
  },
} as ClientEvent<"interactionCreate">;
