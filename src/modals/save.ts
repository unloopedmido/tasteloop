import type { AnimeContext } from "@/types/anime";
import type { ModalParams } from "@/types";
import { createAnimeButtons } from "@/lib/anime/buttons";
import { fetchAnime } from "@/lib/anime/fetch";
import { BaseModal } from "@/structures/modal";
import { Status } from "@/stores/prisma";
import { inlineCode } from "discord.js";
import { fetchContext } from "@/stores/redis";

export default class SaveModal extends BaseModal {
  public customId = "save";

  public async execute({ interaction, client, dbUser }: ModalParams) {
    await interaction.deferUpdate();
    const [, ctxKey] = interaction.customId.split(":");

    const data = await fetchContext<{
      malId: number;
      userId: string;
      page: number;
      total: number;
      context: AnimeContext;
    }>(ctxKey);
    if (!data) {
      await interaction.followUp({
        content: "Expired.",
        flags: ["Ephemeral"],
      });
      return;
    }

    const anime = await fetchAnime(Number(data.malId)).then((d) => d.data);
    let epsWatched: number | string =
      interaction.fields.getTextInputValue("eps_watched");

    if (
      epsWatched.toLowerCase().includes("all") ||
      epsWatched.toLowerCase().includes("complete")
    ) {
      epsWatched = anime.episodes ?? 0;
    }

    const score = parseInt(
      interaction.fields.getTextInputValue("score") ?? "0"
    );
    const status =
      epsWatched === 0
        ? Status.PLANNING
        : epsWatched === anime.episodes
        ? Status.COMPLETED
        : Status.WATCHING;

    if (Number(epsWatched) > (anime.episodes ?? 1)) {
      await interaction.followUp({
        content: `${inlineCode(
          anime.title_english ?? anime.title
        )} only has ${inlineCode(
          String(anime.episodes) ?? "1"
        )} episodes, you can't watch ${inlineCode(
          String(epsWatched) ?? "1"
        )} episodes!`,
        flags: ["Ephemeral"],
      });
      return;
    }

    if (epsWatched === 0 && score != 0) {
      await interaction.followUp({
        content: "You can't give a score if you haven't watched any episodes!",
        flags: ["Ephemeral"],
      });
      return;
    }

    if (score < 0 || score > 10) {
      await interaction.followUp({
        content: "Score must be between 1 and 10!",
        flags: ["Ephemeral"],
      });
      return;
    }

    await client.db.anime.upsert({
      where: {
        malId_userId: {
          userId: interaction.user.id,
          malId: Number(data.malId),
        },
      },
      update: {
        eps_watched: Number(epsWatched),
        score,
        status,
      },
      create: {
        imageUrl: anime.images.jpg.large_image_url,
        malId: Number(data.malId),
        eps_watched: Number(epsWatched),
        score,
        title: anime.title_english ?? anime.title,
        status,
        eps_total: anime.episodes,
        genres: anime.genres.map((g) => g.name).join(", "),
        year: anime.year,
        userId: interaction.user.id,
      },
    });

    (dbUser.animes as { malId: number }[]).push({
      malId: Number(data.malId),
    });

    await interaction.editReply({
      components: [
        await createAnimeButtons(
          data.page,
          data.total,
          anime.mal_id,
          dbUser,
          data.context
        ),
      ],
    });
  }
}
