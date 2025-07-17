import type {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import type { CommandParams } from "@/types";

export abstract class BaseCommand {
  public abstract data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  public admin?: boolean = false;
  public abstract execute(params: CommandParams): Promise<void>;
}
