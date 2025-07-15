import type { Anime as DBAnime } from "@/stores/prisma";
import type { ButtonParams } from "@/types";
import type { Anime, AnimeContext } from "@/types/anime";
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ModalActionRowComponentBuilder,
} from "discord.js";
import { BaseButton } from "@/structures/button";
import { fetchAnime } from "@/lib/anime/fetch";
import { fetchContext } from "@/stores/redis";
import { detailsEmbed } from "@/lib/anime/embed";
import { createAnimeButtons } from "@/lib/anime/buttons";

export default class ManageButton extends BaseButton {
  public customId = "manage";

  private truncateTitle(title: string, maxLength: number = 40): string {
    return title.length <= maxLength
      ? title
      : title.substring(0, maxLength - 3) + "...";
  }

  public async execute({ interaction }: ButtonParams) {
    // Do nothing
  }

  //   public async execute({ interaction, client, dbUser }: ButtonParams) {
  //     const [, ctxKey, type] = interaction.customId.split(":");

  //     if (type === "delete") {
  //       return this.handleDelete(interaction, client, dbUser, ctxKey);
  //     }

  //     const data = await fetchContext<{ malId: number; userId: string }>(ctxKey);

  //     if (!data) {
  //       await interaction.reply({ content: "Expired.", flags: ["Ephemeral"] });
  //       return;
  //     }

  //     if (interaction.user.id !== data.userId) {
  //       await interaction.reply({ content: "Not yours.", flags: ["Ephemeral"] });
  //       return;
  //     }

  //     let anime: Anime | DBAnime | null = null;

  //     if (type === "update") {
  //       anime = dbUser.animes?.find((a) => a.malId === data.malId) || null;
  //       if (!anime) {
  //         await interaction.reply({
  //           content: "Anime not found in your saved list.",
  //           flags: ["Ephemeral"],
  //         });
  //         return;
  //       }
  //     } else {
  //       const response = await fetchAnime(Number(data.malId));
  //       anime = response.data;
  //     }

  //     if (!anime) {
  //       await interaction.update({ content: "Failed to find anime." });
  //       return;
  //     }

  //     const isUpdate = type === "update";
  //     const dbAnime = anime as DBAnime;

  //     const epsWatchedInput = new TextInputBuilder()
  //       .setCustomId("eps_watched")
  //       .setLabel("Episodes Watched")
  //       .setPlaceholder(
  //         "Episodes watched, empty if not started, 'all' if completed."
  //       )
  //       .setStyle(TextInputStyle.Short)
  //       .setMaxLength(10)
  //       .setRequired(false)
  //       .setValue(isUpdate ? String(dbAnime.eps_watched ?? 0) : "");

  //     const scoreInput = new TextInputBuilder()
  //       .setCustomId("score")
  //       .setLabel("Score")
  //       .setPlaceholder("Your score for this anime, 1-10 or empty if not rated.")
  //       .setStyle(TextInputStyle.Short)
  //       .setMaxLength(2)
  //       .setRequired(false)
  //       .setValue(isUpdate ? String(dbAnime.score ?? "") : "");

  //     const modal = new ModalBuilder()
  //       .setCustomId(`save:${ctxKey}`)
  //       .setTitle(
  //         `${isUpdate ? "Update" : "Save"} ${this.truncateTitle(anime.title)}`
  //       )
  //       .addComponents(
  //         new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
  //           epsWatchedInput
  //         ),
  //         new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
  //           scoreInput
  //         )
  //       );

  //     await interaction.showModal(modal);
  //   }

  //   private async handleDelete(
  //     interaction: any,
  //     client: any,
  //     dbUser: any,
  //     ctxKey: string
  //   ) {
  //     const data = await fetchContext<{
  //       page: number;
  //       total: number;
  //       malId: number;
  //       userId: string;
  //       context: AnimeContext;
  //     }>(ctxKey);

  //     if (!data) {
  //       await interaction.reply({ content: "Expired.", flags: ["Ephemeral"] });
  //       return;
  //     }

  //     if (interaction.user.id !== data.userId) {
  //       await interaction.reply({ content: "Not yours.", flags: ["Ephemeral"] });
  //       return;
  //     }

  //     await client.db.anime.delete({
  //       where: {
  //         malId_userId: {
  //           malId: data.malId,
  //           userId: data.userId,
  //         },
  //       },
  //     });

  //     const animeIndex = (dbUser.animes as { malId: number }[]).findIndex(
  //       (a) => a.malId === data.malId
  //     );
  //     if (animeIndex > -1) {
  //       (dbUser.animes as { malId: number }[]).splice(animeIndex, 1);
  //     }

  //     if (dbUser.animes.length === 0) {
  //       await interaction.update({
  //         content:
  //           "Your anime list is empty. Use `/top` to discover and save some anime!",
  //         embeds: [],
  //         components: [],
  //       });
  //       return;
  //     }

  //     const animes = await getDataFetcher(data.context.type).fetchData(
  //       data.context,
  //       client
  //     );
  //     const target = animes.data[data.page];

  //     await interaction.update({
  //       embeds: [detailsEmbed(target)],
  //       components: [
  //         await createAnimeButtons(
  //           data.page,
  //           data.total,
  //           target.mal_id ?? target.malId,
  //           dbUser,
  //           data.context
  //         ),
  //       ],
  //     });
}
