import { ButtonInteraction, ChannelSelectMenuInteraction, MessageFlags, StringSelectMenuInteraction } from "discord.js";

export async function channelIdSelected(interaction: ChannelSelectMenuInteraction) {
    // get guild and id and check whether it's available
    const guild_id = interaction.guildId;

    if (!guild_id) {
        await interaction.reply({
            content: "Failed to f3tch the guild ID.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    // get channel id, check whether it exists or not
    const channel_id = interaction.values[0];

    if (!channel_id) {
        await interaction.reply({
            content: "Interaction failed. Try again.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    await interaction.reply({ content: `Channel selected: <#${channel_id}>`, flags: MessageFlags.Ephemeral });

    return channel_id;
}

export async function tributeSizeSelected(interaction: StringSelectMenuInteraction) {
    await interaction.reply({ content: `Tribute size selected: ${interaction.values[0]}`, flags: MessageFlags.Ephemeral });
    return Number(interaction.values[0]);
}

export async function nextButtonSelected(interaction: ButtonInteraction, channel_id: string | undefined, tribute_size: number | undefined) {
    if (!channel_id || !tribute_size) return await interaction.reply({
        content: "Make sure to select all values.",
        flags: MessageFlags.Ephemeral
    });

    return await interaction.update({ content: "done!" });
}
