import { SlashCommandBuilder } from "discord.js";

import { readGameplay } from "#utils/api";
import { _EphToastDefer, getGamesTable } from "#utils/common";
import type { MyInteractions } from "#utils/interfaces";

const next = new SlashCommandBuilder()
    .setName("next")
    .setDescription("Proceed to the next page!");

export default {
    data: next,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;
        interaction.deferReply();

        // f3tch the guild id
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToastDefer(interaction, "Failed to f3tch guild ID");

        // f3tch the games table
        const qGames = await getGamesTable(interaction, guild_id);
        if (!qGames[0]) return await _EphToastDefer(interaction, "No available game to start.\nYou may host a new game with `/host` anytime.");
        if (interaction.channelId !== qGames[0].channel_id) return await _EphToastDefer(interaction, `Wrong channel! Start the game in the correct channel: <#${qGames[0].channel_id}>`);

        const session_id = qGames[0].session_id;
        if (!session_id) return await _EphToastDefer(interaction, "You must start a game before running this command!");

        await readGameplay(session_id);
        await interaction.followUp("check it");
    }
} satisfies MyInteractions;
