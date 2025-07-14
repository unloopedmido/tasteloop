import type { AnimeContext } from "@/types/anime";
import type { ButtonParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { getDataFetcher } from "@/lib/anime/fetchers";
import { detailsEmbed } from "@/lib/anime/embed";
import { BaseButton } from "@/structures/button";
import { fetchContext } from "@/stores/redis";

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

    // fetch the new anime, embed, buttons…
    const animes = await getDataFetcher(data.context.type).fetchData(
      data.context,
      client
    );
    const target = animes.data[newPage];

    await interaction.update({
      embeds: [detailsEmbed(target)],
      components: [
        await createAnimeButtons(
          newPage,
          data.total,
          target.mal_id ?? target.malId,
          dbUser,
          data.context
        ),
      ],
    });
  }
}
