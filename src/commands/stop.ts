import { InteractionContextType, PermissionsBitField, SlashCommandBuilder } from "discord.js";

import { _EphToast, getGamesTable, stopGame } from "#utils/common";
import type { MyInteractions } from "#utils/interfaces";
import { userPermissions } from "#utils/permissions";

// building the command
const stop = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop a hosted game.")
    .setContexts(
        InteractionContextType.Guild
    );

export default {
    data: stop,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

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

        // check whether a game is hosted or not
        const qGames = await getGamesTable(interaction, guild_id);
        if (!qGames) return await _EphToast(interaction, "No available game to stop.\nYou may host a new game with `/host` anytime.");

        // delete game data to stop the game
        await stopGame(client, guild_id);

        return await interaction.reply({
            content: "The game has been successfully stopped.\nYou may host a new game with `/host` anytime."
        });
    }
} satisfies MyInteractions;
