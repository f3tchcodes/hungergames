import { eq } from "drizzle-orm";

import { _EphToast, getGamesTable, readPlayer } from "./common.js";
import { games } from "./db/schema.js";
import { type PlayersDistricts, type RegisterPlayer } from "./interfaces.js";

export async function registerPlayer(RegisterPlayer: RegisterPlayer) {
    const { interaction, guild_id, user_id, username, profile_pic_url, player_id } = RegisterPlayer;

    if (!interaction.isRepliable()) return console.error("Incorrect interaction: Not repliable");
    if (!guild_id || !user_id || !username || !profile_pic_url) return await _EphToast(interaction, "Failed to f3tch user information. Try again later or contact dev to fix.\nUsername: f3tch");

    // send query to games table and get values
    const qGames = await getGamesTable(interaction, guild_id);
    if (!qGames || !qGames[0]) return await _EphToast(interaction, "Database error!");

    const tribute_size = qGames[0].tribute_size;
    const registered_players = qGames[0].registered_players + 1;
    const districts = qGames[0].districts_data;
    if (!districts) return await _EphToast(interaction, "Players data does not exist!");

    // check whether the registeration is a duplicate or not
    let dup = false;
    districts.forEach(district => district.forEach(player => { if (player.user_id === user_id) dup = true; }));
    if (dup) return await _EphToast(interaction, `**${username}** has already been registered lad.`);

    // if all spots have been filled
    if (registered_players > tribute_size) {
        if (interaction.isButton()) interaction.update({ components: [] });
        return await _EphToast(interaction, "All spots have been filled, you can no longer register!");
    }

    if (player_id) {
        // check wether district id and position are occupied or not
        let occupied = false;
        districts.forEach(district => district.forEach(player => { if (player_id === player.player_id && player.real) occupied = true; }));
        if (occupied) return await _EphToast(interaction, "Selected position is already occupied!\nYou may remove that player from their position and register a new one.");

        // if both district id and position are available
        // then use those coordinates to place the player

        const old_user = await readPlayer(interaction, guild_id, user_id);
        if (!old_user) return await _EphToast(interaction, "Could not find player.");

        let complete_users: PlayersDistricts[] = [];
        districts.forEach(district => district.forEach(player => complete_users.push(player)));
        const userIndex = complete_users.indexOf(old_user.user);
        if (userIndex !== -1) districts.splice(userIndex, 1);

        const user: PlayersDistricts = {
            player_id: old_user.user.player_id,
            user_id,
            username,
            profile_pic_url,
            gender: 2,
            alive: true,
            real: true
        };

        complete_users = [
            ...complete_users.slice(0, userIndex),
            user,
            ...complete_users.slice(userIndex),
        ];

        const newDistricts: PlayersDistricts[][] = [];

        let tribute_index = 0;
        qGames[0].district_size.forEach(size => {
            const tributes: PlayersDistricts[] = [];
            for (let i = 0; i < Number(size); i++) {
                const tribute = complete_users[tribute_index];
                if (!tribute) return console.error(`tribute does not exist in complete_users at position ${tribute_index}`);
                tributes.push(tribute);
                tribute_index++;
            }
            newDistricts.push(tributes);
        });
        await interaction.client.db.update(games).set({ districts_data: districts }).where(eq(games.guild_id, guild_id));
    } else {
        // check whether position is available (with real) or not
        // if not available move onto the next player id
        // if available then register the player to the current id
        const newDistricts: PlayersDistricts[][] = [];
        let complete_users: PlayersDistricts[] = [];
        districts.forEach(district => district.forEach(player => complete_users.push(player)));

        for (let i = 0; i < complete_users.length; i++) {
            const old_user = complete_users[i];
            if (!old_user) return console.error(`could not find complete_users at index ${i}`);

            // check whether user is real or not
            const real = old_user.real;
            if (real) continue;

            if (i !== -1) complete_users.splice(i, 1);

            const user: PlayersDistricts = {
                ...old_user,
                user_id,
                username,
                profile_pic_url,
                gender: 2,
                real: true
            };

            complete_users = [
                ...complete_users.slice(0, i),
                user,
                ...complete_users.slice(i),
            ];
            break;
        }

        let tribute_index = 0;
        qGames[0]?.district_size.forEach(size => {
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
