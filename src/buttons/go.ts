import type { AnimeContext } from "@/types/anime.new";
import type { ButtonParams } from "@/types";
import { updateAnimeButtons } from "@/lib/anime/buttons";
import { detailsEmbed } from "@/lib/anime/embed";
import { BaseButton } from "@/structures/button";
import { fetchContext } from "@/stores/redis";
import { fetcher } from "@/lib/anime/fetch";

export default class GoButton extends BaseButton {
  public customId = "go";

  public async execute({ interaction }: ButtonParams) {
    try {
      const [, ctxKey, dir] = interaction.customId.split(":");

      const data = await fetchContext<{
        page: number;
        total: number;
        context: AnimeContext;
      }>(ctxKey);

      if (!data) {
        await interaction.reply({
          content: "Session expired. Try again.",
          flags: ["Ephemeral"],
        });
        return;
      }

      if (interaction.user.id !== data.context.userId) {
        await interaction.reply({
          content: "Not your session.",
          flags: ["Ephemeral"],
        });
        return;
      }

      const newPage = dir === "next" ? data.page + 1 : data.page - 1;

      const target = data.context.animes[newPage];

      await interaction.update({
        embeds: [detailsEmbed(target)],
        components: [
          await updateAnimeButtons(newPage, data.total, data.context, ctxKey),
        ],
      });
    } catch (error) {
      console.error("Error in go button:", error);
      await interaction
        .reply({
          content: "An error occurred while navigating. Please try again.",
          flags: ["Ephemeral"],
        })
        .catch(() => {
          // If reply fails, try to edit reply
          interaction
            .editReply({
              content: "An error occurred while navigating. Please try again.",
            })
            .catch(console.error);
        });
    }
  }
}
