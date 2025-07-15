import type { AnimeContext } from "@/types/anime";
import type { ButtonParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { detailsEmbed } from "@/lib/anime/embed";
import { BaseButton } from "@/structures/button";
import { fetchContext } from "@/stores/redis";
import { fetcher } from "@/lib/anime/fetch";

export default class GoButton extends BaseButton {
  public customId = "go";

  public async execute({ interaction, client, dbUser }: ButtonParams) {
    const [action, ctxKey, dir] = interaction.customId.split(":");
    console.log("[GoButton] got customId:", interaction.customId);
    console.log("[GoButton] looking up key:", ctxKey);
    const data = await fetchContext<{
      page: number;
      total: number;
      malId: number;
      userId: string;
      context: AnimeContext;
    }>(ctxKey);
    console.log("[GoButton] fetchContext returned:", data);

    if (!data) {
      await interaction.reply({
        content: "Session expired. Try again.",
        flags: ["Ephemeral"],
      });
      return;
    }
    if (interaction.user.id !== data.userId) {
      await interaction.reply({
        content: "Not your session.",
        flags: ["Ephemeral"],
      });
      return;
    }

    const newPage = dir === "next" ? data.page + 1 : data.page - 1;

    const animes = await fetcher(data.context);
    const target = animes[newPage];

    await interaction.update({
      embeds: [detailsEmbed(target)],
      components: [
        await createAnimeButtons(
          newPage,
          data.total,
          target.id,
          dbUser,
          data.context
        ),
      ],
    });
  }
}
