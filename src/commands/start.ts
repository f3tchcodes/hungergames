import { SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";

import { agreeToDisclaimer, createSessionId, setTributes, setTributeSize } from "#utils/api";
import { showTributeList } from "#utils/canvas";
import { _EphToast, getGamesTable, sendChannelMessage } from "#utils/common";
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
        await interaction.reply("Initializing Hunger Games!");

        // f3tch the guild id
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToast(interaction, "Failed to f3tch guild ID");

        // f3tch the games table
        const qGames = await getGamesTable(interaction, guild_id);
        if (!qGames[0]) return await _EphToast(interaction, "No available game to start.\nYou may host a new game with `/host` anytime.");
        if (interaction.channelId !== qGames[0].channel_id) return await _EphToast(interaction, `Wrong channel! Start the game in the correct channel: <#${qGames[0].channel_id}>`);
        const game_channel_id = qGames[0].channel_id;

        // f3tch the districts table
        const qDistricts = await interaction.client.db.select().from(districts).where(eq(districts.guild_id, guild_id));

        // start the game
        await sendChannelMessage(interaction, game_channel_id, "Creating game session...");
        const session_id = await createSessionId();
        if (!session_id) return await _EphToast(interaction, "Session ID for starting the game could not be f3tched. Contact dev to fix.\nUsername: f3tch");
        await interaction.client.db.update(games).set({ session_id }).where(eq(games.guild_id, guild_id));

        const agree_to_disclaimer = await agreeToDisclaimer(session_id);
        if (!agree_to_disclaimer) return await _EphToast(interaction, "Failed to agree to the disclaimer.");

        await sendChannelMessage(interaction, game_channel_id, "Writing game settings...");
        const tribute_size_res = await setTributeSize(session_id, qGames[0].tribute_size);
        if (!tribute_size_res) return await _EphToast(interaction, "Failed to set tribute size. Try again or contact dev to fix.");

        await sendChannelMessage(interaction, game_channel_id, "Registering players...");
        const tributes_reg: TributesReg[] = [];
        qDistricts.forEach(player => tributes_reg.push({ player_id: player.player_id, username: player.username, profile_pic_url: player.profile_pic_url, gender: player.gender }));
        const tribute_reg_res = await setTributes(session_id, qGames[0].tribute_size, tributes_reg);
        if (!tribute_reg_res) return await _EphToast(interaction, "Failed to set tribute members. Try again or contact dev to fix.");
        await sendChannelMessage(interaction, game_channel_id, "**Starting the game...** Please wait.");

        // Part 1: The Reaping.
        // basically status page
        const tribute_status = await getPlayerslist(interaction, true);
        if (!tribute_status) return console.error("Nothing in playerslist!");
        const tribute_status_canvas = await showTributeList(tribute_status, 6, true);

        await sendChannelMessage(interaction, game_channel_id, { content: "The Reaping.", files: [tribute_status_canvas] });
    }
} satisfies MyInteractions;
