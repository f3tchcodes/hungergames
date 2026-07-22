import { SlashCommandBuilder } from "discord.js";

import { showTributeList } from "#utils/canvas";
import { _EphToastDefer, getGamesTable } from "#utils/common";
import type { MyInteractions } from "#utils/interfaces";
import { getPlayerslist } from "#utils/playerslist";

const players = new SlashCommandBuilder()
    .setName("viewcast")
    .setDescription("List of registered players in the current game.")
    .addBooleanOption(op =>
        op
            .setName("include-default-players")
            .setDescription("Include default players in registered list.")
    );

export default {
    data: players,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;
        const response = await interaction.deferReply({ withResponse: true });

        // get guild and id and check whether it's available
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToastDefer(interaction, "Failed to f3tch the guild ID.");

        // check whether a game is hosted or not
        const qGames = await getGamesTable(interaction, guild_id);
        if (!qGames || !qGames[0]) return await _EphToastDefer(interaction, "No available game.\nYou may host a new game with `/host` anytime.");

        // get options
        let includedefaultplayers = interaction.options.getBoolean("include-default-players");
        if (!includedefaultplayers) includedefaultplayers = false;

        // get players list
        const playerslist = await getPlayerslist(interaction, includedefaultplayers);
        if (!playerslist) return;

        // creating tribute list image
        const image = await showTributeList(playerslist, 6, false);
        if (!image) return await _EphToastDefer(interaction, "Image could not be generated!");

        // send image
        await interaction.followUp({ files: [image] });
    }
} satisfies MyInteractions;
