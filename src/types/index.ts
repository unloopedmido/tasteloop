import type ExtendedClient from "@/structures/client";
import type { Prisma } from "@/utils/prisma";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  type ClientEvents,
  ButtonInteraction,
  ModalSubmitInteraction,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  admin?: boolean;
  execute: (
    interaction: ChatInputCommandInteraction,
    client: ExtendedClient,
    dbUser: Prisma.UserGetPayload<{ include: { animes: true } }>
  ) => Promise<void>;
}

export interface Button {
  customId: string;
  execute: (
    interaction: ButtonInteraction,
    client: ExtendedClient,
    dbUser: Prisma.UserGetPayload<{ include: { animes: true } }>
  ) => Promise<void>;
}

export interface Modal {
  customId: string;
  execute: (
    interaction: ModalSubmitInteraction,
    client: ExtendedClient,
    dbUser: Prisma.UserGetPayload<{ include: { animes: true } }>
  ) => Promise<void>;
}

export interface ClientEvent<
  T extends keyof ClientEvents = keyof ClientEvents
> {
  data: {
    name: T;
    once?: boolean;
  };
  execute: (client: ExtendedClient, ...args: ClientEvents[T]) => Promise<void>;
}
