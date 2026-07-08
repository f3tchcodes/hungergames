import { ButtonInteraction, EmbedBuilder } from "discord.js";

import config from "#utils/config";

export async function cancelCommand(interaction: ButtonInteraction) {
    const cancelEmbed = new EmbedBuilder()
        .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
        .setColor(config.THEME_COLOR)
        .setDescription("Command canceled!")
        .setTimestamp();

    interaction.update({ embeds: [cancelEmbed], components: [] });
}
