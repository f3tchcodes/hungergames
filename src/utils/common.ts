import {
    type Client,
    type Interaction,
    type MessageCreateOptions,
    MessageFlags,
    MessagePayload,
    type RepliableInteraction
} from "discord.js";
import { eq } from "drizzle-orm";

import { agreeToDisclaimer, createSessionId, readGameplay, setEvents, setTributes, setTributeSize } from "#utils/api";
import { showTributeList } from "#utils/canvas";
import { games, server_data } from "#utils/db/schema";
import type { PlayersDistricts, ReadPlayerResponse } from "#utils/interfaces";
import { getPlayerslist } from "#utils/playerslist";

export const _EphToast = async (interaction: RepliableInteraction, content: string): Promise<undefined> => { await interaction.reply({ content, flags: MessageFlags.Ephemeral }); };
export const _EphToastDefer = async (interaction: RepliableInteraction, content: string): Promise<undefined> => { await interaction.followUp({ content, flags: MessageFlags.Ephemeral }); };
export const getGamesTable = async (interaction: Interaction, guild_id: string) => await interaction.client.db.select().from(games).where(eq(games.guild_id, guild_id));
export const getServerDataTable = async (interaction: Interaction, guild_id: string) => await interaction.client.db.select().from(server_data).where(eq(server_data.guild_id, guild_id));
export const stopGame = async (client: Client, guild_id: string) => await client.db.delete(games).where(eq(games.guild_id, guild_id));

export async function sendChannelMessage(interaction: Interaction, channel_id: string, message: string | MessagePayload | MessageCreateOptions) {
    const channel = await interaction.client.channels.fetch(channel_id);
    if (!channel?.isSendable()) return console.error(`${channel_id}: channel not sendable`);
    await channel.send(message);
}

export function replaceLastOccurrence(str: string, search: string, replacement: string) {
    const lastIndex = str.lastIndexOf(search);
    if (lastIndex === -1) return str;
    return str.substring(0, lastIndex) + replacement + str.substring(lastIndex + search.length);
}

export async function startGame(interaction: Interaction, guild_id: string, qGames: typeof games.$inferSelect[], qServerData: typeof server_data.$inferSelect[]) {
    if (!interaction.isRepliable()) return;

    // f3tch the games table
    if (!qGames[0]) return await _EphToast(interaction, "No available game to start.\nYou may host a new game with `/host` anytime.");
    if (interaction.channelId !== qGames[0].channel_id) return await _EphToast(interaction, `Wrong channel! Start the game in the correct channel: <#${qGames[0].channel_id}>`);
    const game_channel_id = qGames[0].channel_id;

    if (!qServerData[0]?.events) return await _EphToast(interaction, "Default events not found. Try to kick and add the bot to fix. If it does not work contact support server to fix.");

    // initiailize hunger games
    await interaction.reply("Initializing Hunger Games!");

    /* START GAME */
    await sendChannelMessage(interaction, game_channel_id, "Creating game session...");

    // session id
    const session_id = await createSessionId();
    if (!session_id) return await _EphToast(interaction, "Session ID for starting the game could not be f3tched. Contact dev to fix.\nUsername: f3tch");
    await interaction.client.db.update(games).set({ session_id }).where(eq(games.guild_id, guild_id));

    // agree to disclaimer
    const agree_to_disclaimer = await agreeToDisclaimer(session_id);
    if (!agree_to_disclaimer) return await _EphToast(interaction, "Failed to agree to the disclaimer.");

    // write game settings such as tribute size
    await sendChannelMessage(interaction, game_channel_id, "Writing game settings...");
    const tribute_size_res = await setTributeSize(session_id, qGames[0].tribute_size);
    if (!tribute_size_res) return await _EphToast(interaction, "Failed to set tribute size. Try again or contact dev to fix.");

    // writing events
    await sendChannelMessage(interaction, game_channel_id, "Writing events...");
    const events_res = await setEvents(session_id, qServerData[0]?.events);
    if (!events_res) return await _EphToast(interaction, "Failed to set events. Try again or contact dev to fix.");

    // register players
    await sendChannelMessage(interaction, game_channel_id, "Registering players...");
    const qDistricts = await interaction.client.db.select().from(games).where(eq(games.guild_id, guild_id));
    const tributes_reg = qDistricts[0]?.districts_data;
    if (!tributes_reg) return console.error("tributes_reg doesn't exist");
    const tribute_reg_res = await setTributes(session_id, tributes_reg);
    if (!tribute_reg_res) return await _EphToast(interaction, "Failed to set tribute members. Try again or contact dev to fix.");

    // save gameplay in database
    await sendChannelMessage(interaction, game_channel_id, "Saving complete gameplay...");
    const complete_gameplay = await readGameplay(session_id);
    if (!complete_gameplay) return await _EphToast(interaction, "Error occured! Try again. If it does not work, contact dev to fix.");
    await interaction.client.db.update(games).set({ game_data: complete_gameplay, game_started: 1 }).where(eq(games.guild_id, guild_id));

    // Part 1: The Reaping.
    // basically status page
    await sendChannelMessage(interaction, game_channel_id, "**Starting the game...**");
    const tribute_status = await getPlayerslist(interaction, true);
    if (!tribute_status) return console.error("Nothing in playerslist!");
    const tribute_status_canvas = await showTributeList(tribute_status, 6, true);

    await sendChannelMessage(interaction, game_channel_id, { content: "The Reaping.", files: [tribute_status_canvas] });
}

export async function readPlayer(interaction: Interaction, guild_id: string, user_id: string): Promise<ReadPlayerResponse | void> {
    if (!interaction.isRepliable()) return;

    let user: PlayersDistricts | undefined;

    const qGames = await getGamesTable(interaction, guild_id);
    if (!qGames || !qGames[0]) return console.error(interaction, "Database error!");
    const districts = qGames[0].districts_data;
    if (!districts) return console.error(interaction, "Players data does not exist!");

    let district_id = 0;
    let district_position = 0;

    districts.forEach(district => district.forEach(player => {
        if (player.user_id === user_id) {
            user = player;
            district_id = districts.indexOf(district) + 1;
            district_position = district.indexOf(player) + 1;
        }
    }));

    if (!user) return console.error("user does not exist");

    return {
        user,
        district_id,
        district_position
    };
}

export async function updatePlayer(interaction: Interaction, guild_id: string, district_size: string[], user: PlayersDistricts) {
    if (!interaction.isRepliable()) return;

    const user_id = user.user_id;

    const old_user = await readPlayer(interaction, guild_id, user_id);
    if (!old_user) return await _EphToast(interaction, "Could not find player.");
    const qGames = await getGamesTable(interaction, guild_id);
    if (!qGames || !qGames[0]) return await _EphToast(interaction, "Database error!");
    const districts = qGames[0].districts_data;
    if (!districts) return await _EphToast(interaction, "Players data does not exist!");

    let complete_users: PlayersDistricts[] = [];
    districts.forEach(district => district.forEach(player => complete_users.push(player)));
    const userIndex = complete_users.indexOf(old_user.user);
    if (userIndex !== -1) districts.splice(userIndex, 1);

    complete_users = [
        ...complete_users.slice(0, userIndex),
        user,
        ...complete_users.slice(userIndex),
    ];

    const newDistricts: PlayersDistricts[][] = [];

    let tribute_index = 0;
    district_size.forEach(size => {
        const tributes: PlayersDistricts[] = [];
        for (let i = 0; i < Number(size); i++) {
            const tribute = complete_users[tribute_index];
            if (!tribute) return console.error(`tribute does not exist in complete_users at position ${tribute_index}`);
            tributes.push(tribute);
            tribute_index++;
        }
        newDistricts.push(tributes);
    });

    await interaction.client.db.update(games).set({ districts_data: newDistricts }).where(eq(games.guild_id, guild_id));
}
