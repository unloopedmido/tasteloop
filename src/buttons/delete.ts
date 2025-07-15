import type { ButtonParams } from "@/types";
import { BaseButton } from "@/structures/button";
import type { AnimeContext } from "@/types/anime";
import { detailsEmbed } from "@/lib/anime/embed";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { fetchContext } from "@/stores/redis";
import { fetcher } from "@/lib/anime/fetch";

export default class SaveButton extends BaseButton {
  public customId = "delete";
  public async execute({ interaction, client, dbUser }: ButtonParams) {
    const [, ctxKey] = interaction.customId.split(":");
    const data = await fetchContext<{
      page: number;
      total: number;
      malId: number;
      userId: string;
      context: AnimeContext;
    }>(ctxKey);

    if (!data) {
      await interaction.reply({ content: "Expired.", flags: ["Ephemeral"] });
      return;
    }

    if (interaction.user.id !== data.userId) {
      await interaction.reply({ content: "Not yours.", flags: ["Ephemeral"] });
      return;
    }

    await client.db.anime.delete({
      where: {
        malId_userId: {
          malId: data.malId,
          userId: data.userId,
        },
      },
    });

    (dbUser.animes as { malId: number }[]).splice(
      (dbUser.animes as { malId: number }[]).findIndex(
        (a) => a.malId === data.malId
      ),
      1
    );

    // Check if the user's anime list is empty after deletion
    if (dbUser.animes.length === 0) {
      await interaction.update({
        content:
          "Your anime list is empty. Use `/top` to discover and save some anime!",
        embeds: [],
        components: [],
      });
      return;
    }

    const animes = await fetcher(data.context);
    const target = animes[data.page];

    await interaction.update({
      embeds: [detailsEmbed(target)],
      components: [
        await createAnimeButtons(
          data.page,
          data.total,
          target.id,
          dbUser,
          data.context
        ),
      ],
    });
  }
}
