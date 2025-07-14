import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { log } from "@/utils/logger";
import { followUpOrReply } from "@/utils/misc";
import type { CommandParams } from "@/types";

export abstract class BaseCommand {
  public abstract data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  public admin?: boolean = false;
  public abstract execute(params: CommandParams): Promise<void>;

  protected async handleError(
    interaction: ChatInputCommandInteraction,
    error: Error
  ): Promise<void> {
    log.error("Command error:", error);
    await followUpOrReply(interaction, {
      content: "An error occurred while executing this command.",
      ephemeral: true,
    });
  }
}
