import type { ExtendedClient } from "@/structures/client";
import type { Prisma } from "@/stores/prisma";
import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
} from "discord.js";

export interface BaseParams {
  client: ExtendedClient;
  dbUser: Prisma.UserGetPayload<{ include: { animes: true } }>;
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
