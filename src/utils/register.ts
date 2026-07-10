import { and, eq, not } from "drizzle-orm";

import { _EphToast } from "./common.js";
import { districts, games } from "./db/schema.js";
import { type RegisterPlayer } from "./interfaces.js";

export async function registerPlayer(RegisterPlayer: RegisterPlayer) {
    const { interaction, guild_id, user_id, username, profile_pic_url, district_id, district_position } = RegisterPlayer;

    if (!interaction.isRepliable()) return console.error("Incorrect interaction: Not repliable");

    // check whether they exist
    if (!guild_id || !user_id || !username || !profile_pic_url) return await _EphToast(interaction, "Failed to f3tch user information. Try again later or contact dev to fix.\nUsername: f3tch");

    // send query to games table and get values
    const qGames = await interaction.client.db.select().from(games).where(eq(games.guild_id, guild_id));
    if (!qGames) return _EphToast(interaction, "Failed to send select query. Try again.");

    // get tribute size
    if (!qGames[0]?.tribute_size) return await _EphToast(interaction, "Failed to get tribute size. Try again.");
    const tribute_size = qGames[0]?.tribute_size;

    // get registered players
    if (!qGames[0]?.registered_players && qGames[0]?.registered_players !== 0) return await _EphToast(interaction, "Failed to get your player id. Try again.");
    const registered_players = qGames[0]?.registered_players + 1;

    // get districts data
    const district_data = await interaction.client.db.select().from(districts).where(eq(districts.guild_id, guild_id));

    // check whether the registeration is a duplicate or not
    let dup = false;
    district_data.forEach(player => { if (player.user_id === user_id) dup = true; });
    if (dup) return await _EphToast(interaction, `**${username}** has already been registered lad.`);

    // if all spots have been filled
    if (registered_players > tribute_size) {
        if (interaction.isButton()) interaction.update({ components: [] });
        return await _EphToast(interaction, "All spots have been filled, you can no longer register!");
    }

    console.log(district_id);
    console.log(district_position);

    if (district_id && district_position) {
        // check wether district id and position are occupied or not
        let occupied = false;
        district_data.forEach(player => {
            if (district_id === player.district_id && district_position === player.district_position && player.real) occupied = true;
        });
        if (occupied) return await _EphToast(interaction, "Selected position is already occupied!\nYou may remove that player from their position and register a new one.");

        // if both district id and position are available
        // then use those coordinates to place the player
        await interaction.client.db
            .update(districts)
            .set({
                user_id,
                username,
                profile_pic_url,
                real: not(districts.real),
                gender: "?"
            })
            .where(and(
                eq(districts.guild_id, guild_id),
                eq(districts.district_id, district_id),
                eq(districts.district_position, district_position))
            );
    } else {
        // check whether position is available (with real) or not
        // if not available move onto the next player id
        // if available then register the player to the current id
        for (let i = 0; i < tribute_size; i++) {
            const real = district_data[i]?.real;
            const player_id = district_data[i]?.player_id;
            const current_user_id = district_data[i]?.user_id;
            if ((!real && real !== 0) || !player_id || !current_user_id) return console.error(`district_data does not exist: ${i}`);

            // if user exists in that position, continue
            if (real) continue;

            // send query to register players automatically
            await interaction.client.db
                .update(districts)
                .set({
                    user_id,
                    username,
                    profile_pic_url,
                    real: not(districts.real),
                    gender: "?"
                })
                .where(and(eq(districts.guild_id, guild_id), eq(districts.player_id, player_id)));

            break;
        }
    }

    // increment registered_players by 1
    await interaction.client.db
        .update(games)
        .set({
            registered_players
        })
        .where(eq(games.guild_id, guild_id));

    return {
        guild_id,
        user_id,
        username,
        profile_pic_url,
        registered_players
    };
}
