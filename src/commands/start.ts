import { SlashCommandBuilder } from "discord.js";

import { createSessionId, setTributeSize } from "#utils/api";
import { _EphToast, getGamesTable } from "#utils/common";
import type { MyInteractions } from "#utils/interfaces";

const start = new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start a game!");

export default {
    data: start,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        // f3tch the guild id
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToast(interaction, "Failed to f3tch guild ID");

        // f3tch the games table
        const qGames = await getGamesTable(interaction, guild_id);
        if (!qGames || !qGames[0]) return await _EphToast(interaction, "No available game to stop.\nYou may host a new game with `/host` anytime.");

        // start the game
        const session_id = await createSessionId(interaction);
        if (!session_id) return await _EphToast(interaction, "Session ID for starting the game could not be f3tched. Contact dev to fix.\nUsername: f3tch");

        await setTributeSize(session_id, qGames[0].tribute_size);
    }
} satisfies MyInteractions;
