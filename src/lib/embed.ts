import { EmbedBuilder, type EmbedData } from "discord.js";

export function baseEmbed(options: EmbedData) {
  return new EmbedBuilder({
    color: 0x7d65c7,
    footer: {
      text: "Made with ❤️ by Cored, Inc",
      iconURL: "https://avatars.githubusercontent.com/u/111197202",
    },
    ...options,
    title: "🍜 " + options.title,
  }).setTimestamp();
}
