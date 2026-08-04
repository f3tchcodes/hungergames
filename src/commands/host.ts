
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    PermissionsBitField,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";

import { _EphToast, getGamesTable } from "#utils/common";
import config from "#utils/config";
import type { MyInteractions } from "#utils/interfaces";
import { userPermissions } from "#utils/permissions";

// building the command
const host = new SlashCommandBuilder()
    .setName("host")
    .setDescription("Host a game!");

// when the command is executed
export default {
    data: host,
    async execute(client, interaction) {
        if (!interaction.inCachedGuild()) return;
        if (!interaction.isChatInputCommand()) return;
        if (!config.TRIBUTE_SIZE[0]) return console.error("Tribute size configuration not configured.");

        // check required permissions
        const check_permissions = await userPermissions(interaction, [
            PermissionsBitField.Flags.ManageGuild
        ], [
            "ManageGuild"
        ]);
        if (!check_permissions) return;

        // get guild and id and check whether it's available
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToast(interaction, "Failed to f3tch the guild ID.");

        // check if a game is already hosted
        const qGames = await getGamesTable(interaction, guild_id);
        if (qGames && qGames[0]) return await _EphToast(interaction, `Game already hosted in the channel <#${qGames[0]?.channel_id}> !\nUse \`/stop\` to stop the current game and host a new one.`);

        // setting options for tribute size menu
        const tributes_options: StringSelectMenuOptionBuilder[] = [];
        config.TRIBUTE_SIZE.forEach(v => {
            tributes_options.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(v.name)
                    .setValue(v.value.toString())
            );
        });

        // building select menu interactions
        const channel = new ChannelSelectMenuBuilder().setCustomId("channel").setPlaceholder("Select game channel!").setChannelTypes(ChannelType.GuildText);
        const tribute = new StringSelectMenuBuilder().setCustomId("tribute_size").setPlaceholder("Select your tribute size!").addOptions(tributes_options);

        // building button interactions
        const next = new ButtonBuilder().setCustomId("next").setLabel("Next").setStyle(ButtonStyle.Primary);
        const cancel = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger);

        // creating rows for the select and menu interactions
        const channelRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channel);
        const tributeRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(tribute);
        const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(next, cancel);

        // building text display
        const textDisplayEmbed = new EmbedBuilder()
            .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
            .setColor(config.THEME_COLOR)
            .setTitle("Host a new game!")
            .setDescription(`
Welcome to The Hunger Games!
This is based on the Hunger Games franchise, originating from Suzanne Collins' book series. We wish you great luck in this adventurous journey.

Select your game channel and tribute number to continue.
`)
            .setThumbnail(config.ICON_URL)
            .setFooter({ text: "Developer: f3tch" })
            .setTimestamp();

        // embed options reply
        await interaction.reply({
            embeds: [textDisplayEmbed],
            components: [channelRow, tributeRow, buttonsRow],
            withResponse: true
        });
    }
} satisfies MyInteractions;
