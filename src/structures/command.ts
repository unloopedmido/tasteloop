import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { log } from "@/utils/logger";
import { followUpOrReply } from "@/utils/functions";
import type { CommandParams } from "@/types";

export default abstract class BaseCommand {
  public abstract data: SlashCommandBuilder;
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
