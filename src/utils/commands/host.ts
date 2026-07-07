import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelSelectMenuInteraction, EmbedBuilder, MessageFlags, StringSelectMenuInteraction } from "discord.js";

import config from "#utils/config";

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

    // create game and cancel buttons
    const createGame = new ButtonBuilder().setCustomId("createGame").setLabel("Create Game").setStyle(ButtonStyle.Success);
    const cancel = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger);

    // creating rows for the buttons
    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(createGame, cancel);

    const finalEmbed = new EmbedBuilder()
        .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
        .setColor(config.THEME_COLOR)
        .setTitle("Host a new game!")
        .setDescription(`
----------------------------------------------------------
**Channel: ** <#${channel_id}>
**Tribute size: ** ${tribute_size}

**Note: **Upon game creation, a message will be sent to the game channel for registerations.

**Warning: **
> *Due to the nature of this Hunger Games simulator, we require all users to be 13 years or older.*
> 
> *If you are under 13, you agree to have parental guidance due to the violent nature.*
> 
> *This is purely an act of random fiction. Any murderous acts are not to be taken seriously.*

[Disclaimer & Terms of Use](${config.DISCLAIMER})
[Privacy Policy](${config.PRIVACY_POLICY})
----------------------------------------------------------

By clicking "Create Game", you agree to above mentioned **warning**, **Disclaimer & Terms of Use**, and **Privacy Policy**.
`)
        .setThumbnail(config.ICON_URL)
        .setFooter({ text: "Developer: f3tch" })
        .setTimestamp();

    return await interaction.update({ embeds: [finalEmbed], components: [buttonsRow] });
}
