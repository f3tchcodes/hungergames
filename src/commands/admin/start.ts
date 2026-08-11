import { PermissionsBitField, SlashCommandBuilder } from "discord.js";

import { _EphToast, getGamesTable, getServerDataTable, startGame } from "#utils/common";
import type { MyInteractions } from "#utils/interfaces";
import { userPermissions } from "#utils/permissions";

const start = new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start a game!");

export default {
    data: start,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        // check required permissions
        const check_permissions = await userPermissions(interaction, [
            PermissionsBitField.Flags.ManageGuild
        ], [
            "ManageGuild"
        ]);
        if (!check_permissions) return;

        // f3tch the guild id
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToast(interaction, "Failed to f3tch guild ID");

        const qGames = await getGamesTable(interaction, guild_id);
        if (qGames[0] && Boolean(qGames[0].game_started)) return await _EphToast(interaction, "A game is already active! If you want to restart use `/restart`.");

        const qServerData = await getServerDataTable(interaction, guild_id);
        if (!qServerData[0]) return await _EphToast(interaction, "Server data not found. Try to kick and add the bot to fix. If it does not work contact support server to fix.");


        await startGame(interaction, guild_id, qGames, qServerData);
        // the rest of the game would be played by /next command or auto mode
    }
} satisfies MyInteractions;
