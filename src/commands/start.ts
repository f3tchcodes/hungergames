import { SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";

import { agreeToDisclaimer, createSessionId, setTributes, setTributeSize } from "#utils/api";
import { showTributeList } from "#utils/canvas";
import { _EphToastDefer, getGamesTable } from "#utils/common";
import { districts, games } from "#utils/db/schema";
import type { MyInteractions, TributesReg } from "#utils/interfaces";
import { getPlayerslist } from "#utils/playerslist";

const start = new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start a game!");

export default {
    data: start,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;
        await interaction.deferReply();

        // f3tch the guild id
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToastDefer(interaction, "Failed to f3tch guild ID");

        // f3tch the games table
        const qGames = await getGamesTable(interaction, guild_id);
        if (!qGames || !qGames[0]) return await _EphToastDefer(interaction, "No available game to start.\nYou may host a new game with `/host` anytime.");
        if (interaction.channelId !== qGames[0].channel_id) return await _EphToastDefer(interaction, `Wrong channel! Start the game in the correct channel: <#${qGames[0].channel_id}>`);

        // f3tch the districts table
        const qDistricts = await interaction.client.db.select().from(districts).where(eq(districts.guild_id, guild_id));

        // start the game
        const session_id = await createSessionId();
        if (!session_id) return await _EphToastDefer(interaction, "Session ID for starting the game could not be f3tched. Contact dev to fix.\nUsername: f3tch");
        await interaction.client.db.update(games).set({ session_id }).where(eq(games.guild_id, guild_id));

        const agree_to_disclaimer = await agreeToDisclaimer(session_id);
        if (!agree_to_disclaimer) return await _EphToastDefer(interaction, "Failed to agree to the disclaimer.");

        const tribute_size_res = await setTributeSize(session_id, qGames[0].tribute_size);
        if (!tribute_size_res) return await _EphToastDefer(interaction, "Failed to set tribute size. Try again or contact dev to fix.");

        const tributes_reg: TributesReg[] = [];
        qDistricts.forEach(player => tributes_reg.push({ player_id: player.player_id, username: player.username, profile_pic_url: player.profile_pic_url, gender: player.gender }));
        const tribute_reg_res = await setTributes(session_id, qGames[0].tribute_size, tributes_reg);
        if (!tribute_reg_res) return await _EphToastDefer(interaction, "Failed to set tribute members. Try again or contact dev to fix.");

        // Part 1: The Reaping.
        // basically status page
        const tribute_status = await getPlayerslist(interaction, true);
        if (!tribute_status) return console.error("Nothing in playerslist!");
        const tribute_status_canvas = await showTributeList(tribute_status, 6, true);

        await interaction.followUp({ files: [tribute_status_canvas] });
    }
} satisfies MyInteractions;
