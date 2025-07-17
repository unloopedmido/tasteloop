import type { ExtendedClient } from "@/structures/client";
import { cancelButtonRemoval, scheduleButtonRemoval } from "@/handlers/buttons";
import { ComponentType, type Interaction } from "discord.js";
import { BaseClientEvent } from "@/structures/event";
import { followUpOrReply } from "@/utils/misc";
import { log } from "@/utils/logger";

export default class InteractionCreateEvent extends BaseClientEvent<"interactionCreate"> {
  public data = {
    name: "interactionCreate" as const,
  };

  public async execute(client: ExtendedClient, interaction: Interaction) {
    const userData = await client.db.user.findUnique({
      where: { id: interaction.user.id },
    });

    if (
      !userData &&
      interaction.isChatInputCommand() &&
      interaction.commandName !== "auth"
    ) {
      await interaction.reply({
        content:
          "You need to authenticate with Anilist first! Use the `/auth` command.",
        flags: ["Ephemeral"],
      });
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      if (command.admin && !Bun.env.OWNER_IDS?.includes(interaction.user.id)) {
        await followUpOrReply(interaction, {
          content: "You do not have permission to use this command!",
          flags: ["Ephemeral"],
        });
        return;
      }

      try {
        await command.execute({ interaction, client, userData });
        this.scheduleButtonsForRemoval(client, interaction);
      } catch (error) {
        log.error(`Error executing command ${interaction.commandName}:`, error);
        if (!interaction.replied && !interaction.deferred) {
          await followUpOrReply(interaction, {
            content: "There was an error while executing this command!",
            flags: ["Ephemeral"],
          });
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const [baseId] = interaction.customId.split(":");
      const handler = client.buttons.get(baseId);
      if (!handler) return;

      cancelButtonRemoval(client, interaction.customId);

      try {
        await handler.execute({ interaction, client, userData });
        this.scheduleButtonsForRemoval(client, interaction);
      } catch (error) {
        log.error(
          `Error executing button handler ${interaction.customId}:`,
          error,
        );
        if (!interaction.replied && !interaction.deferred) {
          await followUpOrReply(interaction, {
            content: "There was an error while processing this button!",
            flags: ["Ephemeral"],
          });
        }
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      const [baseId] = interaction.customId.split(":");
      const handler = client.modals.get(baseId);
      if (!handler) return;

      try {
        await handler.execute({ interaction, client, userData });
      } catch (error) {
        log.error(
          `Error executing modal handler ${interaction.customId}:`,
          error,
        );
        if (!interaction.replied && !interaction.deferred) {
          await followUpOrReply(interaction, {
            content: "There was an error while processing this modal!",
            flags: ["Ephemeral"],
          });
        }
      }
    }
  }

  private async scheduleButtonsForRemoval(
    client: ExtendedClient,
    interaction: any,
  ) {
    if (!interaction.replied && !interaction.deferred) return;

    try {
      const response = await interaction.fetchReply();
      response.components?.forEach((row: any) => {
        if (row.type === ComponentType.ActionRow && "components" in row) {
          row.components.forEach((component: any) => {
            if (component.type === 2 && component.customId) {
              scheduleButtonRemoval(
                client,
                response.id,
                interaction.channelId!,
                component.customId,
              );
            }
          });
        }
      });
    } catch (error) {
      // Silent fail for button scheduling
    }
  }
}
