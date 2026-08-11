import { PermissionsBitField, SlashCommandBuilder } from "discord.js";

import { _EphToast, getGamesTable } from "#utils/common";
import type { MyInteractions } from "#utils/interfaces";
import { userPermissions } from "#utils/permissions";

const gamesession = new SlashCommandBuilder()
    .setName("gamesession")
    .setDescription("Get current game's session ID!");

export default {
    data: gamesession,
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
        const session_id = qGames[0]?.session_id;
        if (!qGames[0] || !session_id) return await _EphToast(interaction, "Game session is only generated once a game has been started! Start a game to receive the game session.\n-# Note: Session ID is expired after a couple hours of starting, so you might not receive access to the game on the website; however gameplay is saved in the bot's database so you can continue playing even after days of inactivity!");

        return await _EphToast(interaction, `Here is your current game session: \`PHPSESSID=${session_id}\`\n-# Note: Enter this cookie on https://brantsteele.com to access the game!`);
    }
} satisfies MyInteractions;
