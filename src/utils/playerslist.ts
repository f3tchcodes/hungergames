import type { APIEmbedField, Interaction, RestOrArray } from "discord.js";
import { eq } from "drizzle-orm";

import { _EphToast } from "./common.js";
import { districts, games } from "./db/schema.js";

export async function getPlayerslist(interaction: Interaction) {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    // get guild and id and check whether it's available
    const guild_id = interaction.guildId;
    if (!guild_id) return await _EphToast(interaction, "Failed to f3tch the guild ID.");

    // get games table
    const qResSel = await interaction.client.db.select().from(games).where(eq(games.guild_id, guild_id));
    if (!qResSel[0]) return;

    // get players list
    const qResSelDistricts = await interaction.client.db.select().from(districts).where(eq(districts.guild_id, guild_id));
    if (!qResSelDistricts) {
        await _EphToast(interaction, "No available players list. This is an error in the backend, rehost the game and if it's not fixed contact dev to fix.\nUsername: f3tch");
        return [];
    }

    // push players list to an array of embed fields
    const playerslist: RestOrArray<APIEmbedField> = [];
    const playerListRowSize = qResSel[0]?.district_size - 1;
    let playerListTimeout = 0;
    let district = 0;

    // create playerListTimeout to add an empty field every 2 fields
    // this will help us create 2 columns for the embed
    qResSelDistricts.forEach(player => {
        if (playerListTimeout === 0) {
            district++;
            playerslist.push({
                name: `DISTRICT ${district.toString()}`,
                value: ""
            });
        }

        playerListTimeout++;

        playerslist.push({
            name: player.player_id.toString(),
            value: player.username,
            inline: true
        });
        if (playerListTimeout > playerListRowSize) {
            playerslist.push({
                name: "",
                value: ""
            });

            playerListTimeout = 0;
        }
    });

    return playerslist;
}
