import type { ClientEvent } from "@/types";
import {
  ButtonBuilder,
  ComponentType,
  EmbedBuilder,
  type Interaction,
} from "discord.js";
import { log } from "@/utils/logger";
import { cancelButtonRemoval, scheduleButtonRemoval } from "@/handlers/buttons";
import { followUpOrReply } from "@/utils/functions";

export default {
  data: {
    name: "interactionCreate",
  },
  execute: async (client, interaction: Interaction) => {
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
        // DMs disabled or error, ignore.
      }
    }

    if (interaction.isChatInputCommand()) {
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
          await followUpOrReply(interaction, {
            content: "You do not have permission to use this command!",
            flags: ["Ephemeral"],
          });
          return;
        }

        await command.execute(interaction, client, dbUser!);

        if (interaction.replied || interaction.deferred) {
          const response = await interaction.fetchReply();
          if (response.components && response.components.length > 0) {
            response.components.forEach((row) => {
              if (row.type === ComponentType.ActionRow && "components" in row) {
                row.components.forEach((component) => {
                  if (component.type === 2 && component.customId) {
                    scheduleButtonRemoval(
                      client,
                      response.id,
                      interaction.channelId!,
                      component.customId
                    );
                  }
                });
              }
            });
          }
        }
      } catch (error) {
        log.error(`Error executing command ${interaction.commandName}:`, error);

        await followUpOrReply(interaction, {
          content: "There was an error while executing this command!",
          flags: ["Ephemeral"] as const,
        });
      }

      return;
    }

    if (interaction.isButton()) {
      const [baseId] = interaction.customId.split("_");
      const handler = client.buttons.get(baseId);
      if (!handler) return;

      try {
        // Cancel the existing timeout since the button was clicked
        cancelButtonRemoval(client, interaction.customId);

        await handler.execute(interaction, client, dbUser!);

        // If the button handler replies with new buttons, schedule removal for those too
        if (interaction.replied || interaction.deferred) {
          const response = await interaction.fetchReply();
          if (response.components && response.components.length > 0) {
            response.components.forEach((row) => {
              if (row.type === ComponentType.ActionRow && "components" in row) {
                row.components.forEach((component) => {
                  if (component.type === 2 && component.customId) {
                    scheduleButtonRemoval(
                      client,
                      response.id,
                      interaction.channelId!,
                      component.customId
                    );
                  }
                });
              }
            });
          }
        }
      } catch (error) {
        log.error(
          `Error executing button handler ${interaction.customId}:`,
          error
        );

        await followUpOrReply(interaction, {
          content: "There was an error while processing this button!",
          flags: ["Ephemeral"],
        });
      }

      return;
    }

    if (interaction.isModalSubmit()) {
      const [baseId] = interaction.customId.split("_");
      const handler = client.modals.get(baseId);
      if (!handler) return;

      try {
        await handler.execute(interaction, client, dbUser!);
      } catch (error) {
        log.error(
          `Error executing modal handler ${interaction.customId}:`,
          error
        );
        await followUpOrReply(interaction, {
          content: "There was an error while processing this modal!",
          flags: ["Ephemeral"],
        });
      }

      return;
    }
  },
} as ClientEvent<"interactionCreate">;
