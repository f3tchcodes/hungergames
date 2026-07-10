import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelSelectMenuInteraction, EmbedBuilder, StringSelectMenuInteraction } from "discord.js";

import { _EphToast } from "#utils/common";
import config from "#utils/config";
import { games } from "#utils/db/schema";
import { generateDefaultPlayers } from "#utils/generateDefaultPlayers";

export async function channelIdSelected(interaction: ChannelSelectMenuInteraction) {
    // get guild and id and check whether it's available
    const guild_id = interaction.guildId;
    if (!guild_id) return await _EphToast(interaction, "Failed to f3tch the guild ID.");

    // get channel id, check whether it exists or not
    const channel_id = interaction.values[0];
    if (!channel_id) return await _EphToast(interaction, "Interaction failed. Try again.");

    await _EphToast(interaction, `Channel selected: <#${channel_id}>`);

    return channel_id;
}

export async function tributeSizeSelected(interaction: StringSelectMenuInteraction) {
    await _EphToast(interaction, `Tribute size selected: ${interaction.values[0]}`);
    const tribute_size = Number(interaction.values[0]);

    return tribute_size;
}

export async function nextButtonSelected(interaction: ButtonInteraction, channel_id: string | undefined, tribute_size: number | undefined) {
    if (!channel_id || !tribute_size) return await _EphToast(interaction, "Make sure to select all values.");

    // create game and cancel buttons
    const createGame = new ButtonBuilder().setCustomId("create_game").setLabel("Create Game").setStyle(ButtonStyle.Success);
    const cancel = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger);

    // creating rows for the buttons
    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(createGame, cancel);

    const finalEmbed = new EmbedBuilder()
        .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
        .setColor(config.THEME_COLOR)
        .setTitle("Host a new game!")
        .setDescription(`
--------------------------------------------------------------
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
--------------------------------------------------------------

By clicking "Create Game", you agree to above mentioned **warning**, **Disclaimer & Terms of Use**, and **Privacy Policy**.
`)
        .setThumbnail(config.ICON_URL)
        .setFooter({ text: "Developer: f3tch" })
        .setTimestamp();

    return await interaction.update({ embeds: [finalEmbed], components: [buttonsRow] });
}

export async function createGame(interaction: ButtonInteraction, channel_id: string | undefined, tribute_size: number | undefined) {
    if (!channel_id || !tribute_size) return await _EphToast(interaction, "Interaction failed! Channel ID and tribute size not found. Try again later.");

    let district_size;

    // getting guild id and checking whether it exists or not
    const guild_id = interaction.guildId;
    if (!guild_id) return await _EphToast(interaction, "Failed to f3tch the guild ID.");

    // create game and cancel buttons
    const register = new ButtonBuilder().setCustomId("register").setLabel("Register").setStyle(ButtonStyle.Success);
    const opt_out = new ButtonBuilder().setCustomId("opt_out").setLabel("Opt-out").setStyle(ButtonStyle.Secondary);

    // creating rows for the buttons
    const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(register, opt_out);

    // embed message
    const registerEmbed = new EmbedBuilder()
        .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
        .setColor(config.THEME_COLOR)
        .setTitle("Register in The Hunger Games.")
        .setDescription(`
Welcome to The Hunger Games!
This is based on the Hunger Games franchise, originating from Suzanne Collins' book series. We wish you great luck in this adventurous journey.

--------------------------------------------------------------
**Warning: **
> *Due to the nature of this Hunger Games simulator, we require all users to be 13 years or older.*
> 
> *If you are under 13, you agree to have parental guidance due to the violent nature.*
> 
> *This is purely an act of random fiction. Any murderous acts are not to be taken seriously.*

[Disclaimer & Terms of Use](${config.DISCLAIMER})
[Privacy Policy](${config.PRIVACY_POLICY})
--------------------------------------------------------------

**Tribute size: ** ${tribute_size}

Click the button below to register for The Hunger Games.
`)
        .setThumbnail(config.ICON_URL)
        .setTimestamp();

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

    // updating database, we will add session id later
    // when we need the frickin thing when we're yk
    // starting the game this is to make sure the session id
    // does not expire when the game is started.
    await interaction.client.db.insert(games).values({
        guild_id,
        channel_id,
        tribute_size,
        district_size
    });

    await generateDefaultPlayers(interaction, district_size, tribute_size);

    // send game hosted message
    await interaction.reply({ content: `Game hosted successfully!\nRegisteration message has been sent to <#${channel_id}>!` });

    // send message to the channel for registeration
    const channel = await interaction.client.channels.fetch(channel_id);
    if (!channel?.isSendable()) return console.error(`${channel_id}: channel not sendable`);
    return await channel.send({ embeds: [registerEmbed], components: [buttonsRow] });
}
