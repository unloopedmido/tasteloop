import type { AnimeContext } from "@/types/anime.new";
import type { ModalParams } from "@/types";
import { editQuery } from "@/lib/anime/queries";
import { followUpOrReply } from "@/utils/misc";
import { BaseModal } from "@/structures/modal";
import { fetchContext } from "@/stores/redis";
import { log } from "@/utils/logger";

export default class EditModal extends BaseModal {
  public customId = "edit";

  public async execute({ interaction, userData }: ModalParams) {
    await interaction.deferUpdate();

    const [, ctxKey] = interaction.customId.split(":");

    const data = await fetchContext<{
      page: number;
      context: AnimeContext;
    }>(ctxKey);

    if (!data) {
      await followUpOrReply(interaction, {
        content: "Session expired. Try again.",
        flags: ["Ephemeral"],
      });
      return;
    }

    const currentAnime = data.context.animes[data.page];
    const anime = "media" in currentAnime ? currentAnime.media : currentAnime;
    const score: number = Number(interaction.fields.getTextInputValue("score"));

    let progress: string | number = interaction.fields
      .getTextInputValue("progress")
      .trim()
      .toLowerCase();

    if (isNaN(score) || score < 1 || score > 10) {
      await followUpOrReply(interaction, {
        content: "Score must be a number between 1 and 10.",
        flags: ["Ephemeral"],
      });
      return;
    }

    if (progress === "all") {
      progress = anime.episodes || 1;
    } else if (
      isNaN(Number(progress)) ||
      Number(progress) < 0 ||
      !Number.isInteger(Number(progress))
    ) {
      await followUpOrReply(interaction, {
        content: "Progress must be a valid integer number.",
        flags: ["Ephemeral"],
      });
      return;
    } else if (Number(progress) > (anime.episodes || 1)) {
      await followUpOrReply(interaction, {
        content: `Progress cannot exceed total episodes (${
          anime.episodes || 1
        }).`,
        flags: ["Ephemeral"],
      });
      return;
    }

    const status =
      progress === anime.episodes
        ? "COMPLETED"
        : progress === 0
        ? "PLANNING"
        : "CURRENT";

    let json: any;
    try {
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData?.accessToken}`,
        },
        body: JSON.stringify({
          query: editQuery,
          variables: {
            animeId: anime.id,
            status,
            progress,
            score,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      json = await res.json();
    } catch (error) {
      log.error("Fetch error:", error);
      await followUpOrReply(interaction, {
        content: "Network error or failed to reach AniList. Please try again.",
        flags: ["Ephemeral"],
      });
      return;
    }

    if (json.errors) {
      await followUpOrReply(interaction, {
        content: "Failed to update anime. Please try again.",
        flags: ["Ephemeral"],
      });
      return;
    }

    await followUpOrReply(interaction, {
      content: `Successfully updated **${anime.title.romaji}** to **${status}** with a score of **${score}**.`,
      flags: ["Ephemeral"],
    });
  }
}
