import { type ButtonInteraction } from "discord.js";
import _ from "lodash";

import { buildListCanvas } from "#utils/canvas";
import { _EphToast, getGamesTable } from "#utils/common";
import type { ListCanvasGenerateInfo } from "#utils/interfaces";
import { getPlayerslist } from "#utils/playerslist";

export async function playerslistControls(interaction: ButtonInteraction, option: "increment" | "decrement", includedefaultplayers: boolean | undefined) {
    // get guild id
    const guild_id = interaction.guildId;
    if (!guild_id) return;

    let current_page = interaction.client.current_page.get(interaction.message.id);
    if (!current_page && current_page !== 0) return await _EphToast(interaction, "Current page does not exist. Try the command again!");

    if (option === "increment") {
        current_page++;
    } else if (option === "decrement") {
        current_page--;
    } else {
        return await _EphToast(interaction, "Unknown option.");
    }

    // get players list
    const playerslist = await getPlayerslist(interaction, includedefaultplayers);
    if (!playerslist) return await _EphToast(interaction, "Players list not available!");

    // get current game info
    const qGames = await getGamesTable(interaction, guild_id);
    if (!qGames || !qGames[0]) return;

    const district_size = qGames[0].district_size;
    const tribute_size = qGames[0].tribute_size;

    // split the players list in chunks
    let chunk_size = 12;
    if (district_size === 3) chunk_size = 9;
    const playerslistChunks = _.chunk(playerslist, chunk_size);
    if (!playerslistChunks) return await _EphToast(interaction, "Players list chunks not available!");

    // check how many pages we have
    if (option === "increment") {
        const pages = playerslistChunks.length;
        if (current_page > pages - 1) return await _EphToast(interaction, "No more pages left chimp!");
    } else if (option === "decrement") {
        if (current_page < 0) return await _EphToast(interaction, "There ain't no page 0.");
    } else {
        return await _EphToast(interaction, "Unknown option.");
    }

    // updating current page
    interaction.client.current_page.set(interaction.message.id, current_page);

    // create canvas info
    const listCanvasGenerateInfo: ListCanvasGenerateInfo = {
        playerslistInfoChunks: playerslistChunks,
        page: current_page,
        district_size,
        tribute_size,
        includedefaultplayers
    };

    const image = await buildListCanvas(listCanvasGenerateInfo);
    if (!image) return await _EphToast(interaction, "Image could not be generated!");

    // update embed
    try {
        return await interaction.update({ files: [image] });
    } catch (err) {
        if (option === "increment") {
            current_page--;
        } else if (option === "decrement") {
            current_page++;
        } else {
            return await _EphToast(interaction, "Unknown option.");
        }

        console.log(current_page);
    }
}
