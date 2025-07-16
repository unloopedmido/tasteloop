import type { ExtendedClient } from "@/structures/client";
import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
} from "discord.js";

export interface BaseParams {
  client: ExtendedClient;
}
export interface ButtonParams extends BaseParams {
  interaction: ButtonInteraction;
}
export interface CommandParams extends BaseParams {
  interaction: ChatInputCommandInteraction;
}
export interface ModalParams extends BaseParams {
  interaction: ModalSubmitInteraction;
}
