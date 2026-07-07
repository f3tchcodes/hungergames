
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    EmbedBuilder,
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";
import { eq } from "drizzle-orm";

import config from "#utils/config";
import { games } from "#utils/db/schema";
import type { MyInteractions } from "#utils/interfaces";

// building the command
const host = new SlashCommandBuilder()
    .setName("host")
    .setDescription("Host a game!")
    .setContexts(
        InteractionContextType.Guild
    );

// when the command is executed
export default {
    data: host,
    async execute(client, interaction) {
        if (!interaction.inCachedGuild()) return;
        if (!interaction.isChatInputCommand()) return;
        if (!config.TRIBUTE_SIZE[0]) return console.error("Tribute size configuration not configured.");
        let session_id;
        let district_size;

        // get guild and id and check whether it's available
        const guild_id = interaction.guildId;

        if (!guild_id) return await interaction.reply({
            content: "Failed to f3tch the guild ID.",
            flags: MessageFlags.Ephemeral
        });

        // check if a game is already hosted
        const qRes = await client.db.select().from(games).where(eq(games.guild_id, guild_id));
        if (qRes.length > 0) return await interaction.reply({
            content: `Game already hosted in the channel <#${qRes[0]?.channel_id}> !\nUse \`/stop\` to stop the current game and host a new one.`,
            flags: MessageFlags.Ephemeral
        });

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

        // CUSTOMASIDOASHFDOAHSDFOIUHSDFIUHSIDFUHOISUHDFIHSDIFUHSDIFUHSIDFUHSDIFHISDUHFISDUDFH
        const tribute_size = 24;

        // get channel id, check whether it's correct or not
        // then check whether or not the it's a text channel
        const channel_id = interaction.options.getString("channel-id", true);
        const channel_exists = interaction.guild?.channels.cache.get(channel_id);

        if (!channel_exists) return await interaction.reply({
            content: "Incorrect channel ID, please try again!",
            flags: MessageFlags.Ephemeral
        });

        if (!channel_exists.isTextBased() || channel_exists.isVoiceBased()) return await interaction.reply({
            content: "Incorrect channel type, make sure to provide a text channel!",
            flags: MessageFlags.Ephemeral
        });

        // f3tching the session cookie that we'll save
        // and use to send request to every endpoint
        const res = await fetch(`${config.BASE_URL}/hungergames/agree.php`);
        res.headers.forEach(async header => {
            if (!header.startsWith("PHPSESSID")) return;

            const cRegex = /PHPSESSID=.*;/g;
            const cookieArr = header.match(cRegex);

            if (!cookieArr) return await interaction.reply({
                content: "Error occured while f3tching the session cookie. Contact dev to fix.\nUsername: f3tch",
                flags: MessageFlags.Ephemeral
            });

            session_id = cookieArr[0].replace("PHPSESSID=", "").slice(0, -1);
        });

        // not using await here because discord invalidates an interaction
        // after 3 seconds of no response, so to save time we don't await
        // not sure if it's the right move though
        const headers = { Cookie: `PHPSESSID=${session_id};` };
        await fetch(`${config.BASE_URL}/hungergames/ChangeTributes-${tribute_size}.php`, { headers });

        // setting district size
        switch (tribute_size) {
            case config.TRIBUTE_SIZE[1]?.value:
                district_size = config.DISTRICT_SIZE.medium;
                break;
            case config.TRIBUTE_SIZE[2]?.value:
                district_size = config.DISTRICT_SIZE.large;
                break;
            default:
                district_size = config.DISTRICT_SIZE.default;
        }

        // updating database
        client.db.insert(games).values({
            guild_id,
            channel_id,
            session_id,
            tribute_size,
            district_size
        });
    }
} satisfies MyInteractions;
