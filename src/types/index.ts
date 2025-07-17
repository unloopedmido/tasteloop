import type { User } from "@/stores/prisma";
import type { ExtendedClient } from "@/structures/client";
import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  type Interaction,
} from "discord.js";

export interface BaseParams {
  client: ExtendedClient;
  userData: User | null;
}
export interface InteractionParams<T extends Interaction = Interaction>
  extends BaseParams {
  interaction: T;
}

export type ButtonParams = InteractionParams<ButtonInteraction>;
export type CommandParams = InteractionParams<ChatInputCommandInteraction>;
export type ModalParams = InteractionParams<ModalSubmitInteraction>;
