import type { Interaction } from "discord.js";

import { _EphToast } from "#utils/common";
import config from "#utils/config";
import { games } from "#utils/db/schema";
import type { PlayersDistricts } from "#utils/interfaces";

export async function generateDefaultPlayers(interaction: Interaction, district_size: number, tribute_size: number) {
    if (!interaction.isRepliable()) return;

    // getting guild id and checking whether it exists or not
    const guild_id = interaction.guildId;
    if (!guild_id) return await _EphToast(interaction, "Failed to f3tch the guild ID.");

    // creating district rows in the database
    // we loop over tribute size to create tribute size amount of rows
    // if district_position is larger than district_size, we reset it back to 1
    // then we loop over default players and add them one by one and stop according to tribute size
    // then we push each object of values into sqlInsertData array
    // finally we send query to the database and insert all those values
    const sqlInsertData: PlayersDistricts[] = [];

    let district_position = 0;
    let player_id = 0;
    let district_id = 0;

    for (let i = 0; i < tribute_size; i++) {
        district_position++;
        player_id++;

        const DEFAULT_PLAYER = config.DEFAULT_PLAYERS[i];

        if (district_position > district_size) district_position = 1;
        if (district_position === 1) district_id++;
        if (!DEFAULT_PLAYER) return _EphToast(interaction, "Not enough default players for your tribute size. Please configure default players list, ask dev to fix this issue.\nUsername: f3tch");

        sqlInsertData.push({
            player_id,
            district_id,
            district_position,
            real: Boolean(0),
            alive: Boolean(1),
            ...DEFAULT_PLAYER
        });
    }

    await interaction.client.db.update(games).set({ districts_data: sqlInsertData });
}
