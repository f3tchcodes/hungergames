import type { Interaction } from "discord.js";

import { _EphToast } from "#utils/common";
import config from "#utils/config";
import { games } from "#utils/db/schema";
import type { PlayersDistricts } from "#utils/interfaces";

export async function generateDefaultPlayers(interaction: Interaction, district_size: string[], tribute_size: number) {
    if (!interaction.isRepliable()) return;

    // getting guild id and checking whether it exists or not
    const guild_id = interaction.guildId;
    if (!guild_id) return await _EphToast(interaction, "Failed to f3tch the guild ID.");
    const dataComplete: PlayersDistricts[][] = [];

    let player_id = 0;

    district_size.forEach(size => {
        const data: PlayersDistricts[] = [];
        for (let i = 0; i < Number(size); i++) {
            const DEFAULT_PLAYER = config.DEFAULT_PLAYERS[player_id];
            if (!DEFAULT_PLAYER) return console.error(`default player doesn't exist ${i}`);
            player_id++;

            data.push({
                player_id,
                real: Boolean(0),
                alive: Boolean(1),
                ...DEFAULT_PLAYER
            });
        }
        dataComplete.push(data);
    });

    await interaction.client.db.update(games).set({ districts_data: dataComplete });
}
