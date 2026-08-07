import { eq } from "drizzle-orm";

import { _EphToast, getGamesTable, readPlayer } from "./common.js";
import { games } from "./db/schema.js";
import { type PlayersDistricts, type RegisterPlayer } from "./interfaces.js";

export async function registerPlayer(RegisterPlayer: RegisterPlayer) {
    const { interaction, guild_id, user_id, username, profile_pic_url, district_id, district_position } = RegisterPlayer;

    if (!interaction.isRepliable()) return console.error("Incorrect interaction: Not repliable");
    if (!guild_id || !user_id || !username || !profile_pic_url) return await _EphToast(interaction, "Failed to f3tch user information. Try again later or contact dev to fix.\nUsername: f3tch");

    // send query to games table and get values
    const qGames = await getGamesTable(interaction, guild_id);
    if (!qGames || !qGames[0]) return _EphToast(interaction, "Failed to send select query. Try again.");

    const tribute_size = qGames[0].tribute_size;
    const registered_players = qGames[0].registered_players + 1;
    const users = qGames[0].districts_data;
    if (!users) return await _EphToast(interaction, "Players data does not exist!");

    // check whether the registeration is a duplicate or not
    let dup = false;
    users.forEach(player => { if (player.user_id === user_id) dup = true; });
    if (dup) return await _EphToast(interaction, `**${username}** has already been registered lad.`);

    // if all spots have been filled
    if (registered_players > tribute_size) {
        if (interaction.isButton()) interaction.update({ components: [] });
        return await _EphToast(interaction, "All spots have been filled, you can no longer register!");
    }

    if (district_id && district_position) {
        // check wether district id and position are occupied or not
        let occupied = false;
        users.forEach(player => { if (district_id === player.district_id && district_position === player.district_position && player.real) occupied = true; });
        if (occupied) return await _EphToast(interaction, "Selected position is already occupied!\nYou may remove that player from their position and register a new one.");

        // if both district id and position are available
        // then use those coordinates to place the player

        const old_user = await readPlayer(interaction, guild_id, user_id);
        if (!old_user) return await _EphToast(interaction, "Could not find player.");
        const oldUserIndex = users.indexOf(old_user);
        if (oldUserIndex !== -1) users.splice(oldUserIndex, 1);

        const user: PlayersDistricts = {
            ...old_user,
            user_id,
            username,
            profile_pic_url,
            district_id,
            district_position,
            gender: "?",
            alive: true
        };

        users.push(user);
        await interaction.client.db.update(games).set({ districts_data: users }).where(eq(games.guild_id, guild_id));
    } else {
        // check whether position is available (with real) or not
        // if not available move onto the next player id
        // if available then register the player to the current id
        for (let i = 0; i < tribute_size; i++) {
            // get old user
            const old_user = users[i];
            if (!old_user) return console.error(`old_user does not exist: ${i}`);

            // if user exists in that position, continue
            const real = old_user?.real;
            if (real) continue;

            const oldUserIndex = users.indexOf(old_user);
            if (oldUserIndex !== -1) users.splice(oldUserIndex, 1);

            const user: PlayersDistricts = {
                ...old_user,
                user_id,
                username,
                profile_pic_url,
                gender: "?",
                real: true
            };

            users.push(user);
            await interaction.client.db.update(games).set({ districts_data: users }).where(eq(games.guild_id, guild_id));
            break;
        }
    }

    // increment registered_players by 1
    await interaction.client.db.update(games).set({ registered_players }).where(eq(games.guild_id, guild_id));
    return {
        guild_id,
        user_id,
        username,
        profile_pic_url,
        registered_players
    };
}
