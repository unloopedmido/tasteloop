import {
  type InteractionReplyOptions,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  MessagePayload,
} from "discord.js";

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}

export function followUpOrReply(
  interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | ModalSubmitInteraction,
  options: string | MessagePayload | InteractionReplyOptions,
) {
  if (interaction.deferred || interaction.replied) {
    return interaction.followUp(options);
  } else {
    return interaction.reply(options);
  }
}

export function intToMonth(int?: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[(int ?? 1) - 1] || "";
}

export function makeProgressBar(current: number, total: number, length = 8) {
  if (!total || total <= 0 || !current || current < 0) {
    return "▱".repeat(length);
  }

  const ratio = Math.min(current / total, 1);
  const filled = Math.max(0, Math.round(ratio * length));
  const empty = Math.max(0, length - filled);

  return "▰".repeat(filled) + "▱".repeat(empty);
}
