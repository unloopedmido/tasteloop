import type { Prisma, PrismaClient } from "@/utils/prisma";
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  Collection,
  type ClientEvents,
  ButtonBuilder,
  ButtonInteraction,
  ModalBuilder,
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
    client: ExtendedClient
  ) => Promise<void>;
}

export interface Modal {
  customId: string;
  execute: (
    interaction: ModalSubmitInteraction,
    client: ExtendedClient
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

export interface ExtendedClient extends Client {
  db: PrismaClient;
  commands: Collection<string, Command>;
  buttons: Collection<string, Button>;
  modals: Collection<string, Modal>;
  theme: number;
  init(): Promise<void>;
}
