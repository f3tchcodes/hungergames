import { type ButtonInteraction, EmbedBuilder } from "discord.js";
import _ from "lodash";

import { _EphToast } from "#utils/common";
import config from "#utils/config";
import { getPlayerslist } from "#utils/playerslist";

export async function playersListForward(interaction: ButtonInteraction, includedefaultplayers: boolean | undefined) {
    let current_page = interaction.client.current_page.get(interaction.message.id);
    if (!current_page && current_page !== 0) return await _EphToast(interaction, "Current page does not exist. Try the command again!");
    current_page++;

    // get players list
    const playerslist = await getPlayerslist(interaction, includedefaultplayers);
    if (!playerslist) return await _EphToast(interaction, "Players list not available!");

    // split the players list in chunks because discord
    // does not allow more fields than 25 in each embed
    const playerslistChunks = _.chunk(playerslist, config.REGISTERED_PLAYERS_LIST_PAGES_CHUNKS);
    if (!playerslistChunks) return await _EphToast(interaction, "Players list chunks not available!");

    // check how many pages we have
    const pages = playerslistChunks.length;
    if (current_page > pages - 1) return await _EphToast(interaction, "No more pages left chimp!");

    // create new player embed
    const playersListEmbed = new EmbedBuilder()
        .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
        .setColor(config.THEME_COLOR)
        .setTitle("List of registered players: ")
        .setFields(playerslistChunks[current_page]!)
        .setFooter({ text: `Page ${current_page + 1}` })
        .setTimestamp();

    // updating current page
    interaction.client.current_page.set(interaction.message.id, current_page);

    // update embed
    return await interaction.update({ embeds: [playersListEmbed] });
}

export async function playersListBackward(interaction: ButtonInteraction, includedefaultplayers: boolean | undefined) {
    let current_page = interaction.client.current_page.get(interaction.message.id);
    if (!current_page && current_page !== 0) return await _EphToast(interaction, "Current page does not exist. Try the command again!");
    current_page--;

    // get players list
    const playerslist = await getPlayerslist(interaction, includedefaultplayers);
    if (!playerslist) return await _EphToast(interaction, "Players list not available!");

    // split the players list in chunks because discord
    // does not allow more fields than 25 in each embed
    const playerslistChunks = _.chunk(playerslist, config.REGISTERED_PLAYERS_LIST_PAGES_CHUNKS);
    if (!playerslistChunks) return await _EphToast(interaction, "Players list chunks not available!");

    // check how many pages we have
    if (current_page < 0) return await _EphToast(interaction, "There ain't no page 0.");

    // create new player embed
    const playersListEmbed = new EmbedBuilder()
        .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
        .setColor(config.THEME_COLOR)
        .setTitle("List of registered players: ")
        .setFields(playerslistChunks[current_page]!)
        .setFooter({ text: `Page ${current_page + 1}` })
        .setTimestamp();

    // updating current page
    interaction.client.current_page.set(interaction.message.id, current_page);

    // update embed
    return await interaction.update({ embeds: [playersListEmbed] });
}
