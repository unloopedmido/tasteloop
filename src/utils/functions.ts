import {
  type InteractionReplyOptions,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  MessagePayload,
} from "discord.js";

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function followUpOrReply(
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | ModalSubmitInteraction,
  options: string | MessagePayload | InteractionReplyOptions
) {
  if (interaction.deferred || interaction.replied) {
    return interaction.followUp(options);
  } else {
    return interaction.reply(options);
  }
}
