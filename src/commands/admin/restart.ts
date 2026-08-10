import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";

import { _EphToast, getGamesTable, startGame } from "#utils/common";
import { games } from "#utils/db/schema";
import type { MyInteractions } from "#utils/interfaces";
import { userPermissions } from "#utils/permissions";

const restart = new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restart a game after starting once!");

export default {
    data: restart,
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
        if (qGames[0] && !qGames[0].game_started) return await _EphToast(interaction, "Start a game before restarting!");

        // set settings back to 0
        await interaction.client.db.update(games).set({ game_page: 0, section_page: 0 }).where(eq(games.guild_id, guild_id));

        await startGame(interaction, guild_id, qGames);
        // the rest of the game would be played by /next command or auto mode
    }
} satisfies MyInteractions;
