import { MessageFlags, type RepliableInteraction } from "discord.js";

export async function _EphToast<T extends RepliableInteraction>(interaction: T, content: string) {
    await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    return undefined;
}
