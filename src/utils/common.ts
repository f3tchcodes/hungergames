import { MessageFlags, type RepliableInteraction } from "discord.js";

export async function _EphToast(interaction: RepliableInteraction, content: string) {
    await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    return undefined;
}
