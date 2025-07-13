import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  type CollectedMessageInteraction,
} from "discord.js";

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function paginate(
  embeds: EmbedBuilder[],
  interaction: any,
  timeout = 60000
) {
  if (embeds.length === 0) return;

  // If there's only one embed, just send it without pagination
  if (embeds.length === 1) {
    await interaction.reply({ embeds: [embeds[0]] });
    return;
  }

  let currentPage = 0;

  const createButtons = (currentPage: number) => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("◀️ Previous")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Next ▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === embeds.length - 1)
    );
    return row;
  };

  embeds.forEach((embed, index) => {
    embed.setFooter({ text: `Page ${index + 1} of ${embeds.length}` });
  });

  // Send initial message with the first embed and buttons
  const response = await interaction.reply({
    embeds: [embeds[currentPage]],
    components: [createButtons(currentPage)],
    fetchReply: true,
  });

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeout,
  });

  collector.on("collect", async (i: CollectedMessageInteraction) => {
    if (i.user.id !== interaction.user.id) {
      await i.reply({
        content: "You cannot use these buttons.",
        ephemeral: true,
      });
      return;
    }

    if (i.customId === "previous") {
      currentPage = Math.max(0, currentPage - 1);
    } else if (i.customId === "next") {
      currentPage = Math.min(embeds.length - 1, currentPage + 1);
    }

    await i.update({
      embeds: [embeds[currentPage]],
      components: [createButtons(currentPage)],
    });
  });

  collector.on("end", async () => {
    try {
      await response.edit({
        components: [],
      });
    } catch (error) {
      // Ignore errors if the message was deleted
    }
  });

  return response;
}
