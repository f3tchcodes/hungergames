import { type Interaction } from "discord.js";
import { eq } from "drizzle-orm";

import { districts, games } from "./db/schema.js";
import type { PlayerslistInfo } from "./interfaces.js";

export async function getPlayerslist(interaction: Interaction, includedefaultplayers: boolean | undefined): Promise<PlayerslistInfo[] | undefined> {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    // get guild and id and check whether it's available
    const guild_id = interaction.guildId;
    if (!guild_id) return;

    // get games table
    const qResSel = await interaction.client.db.select().from(games).where(eq(games.guild_id, guild_id));
    if (!qResSel[0]) return;

    // get players list
    const qResSelDistricts = await interaction.client.db
        .select()
        .from(districts)
        .where(eq(districts.guild_id, guild_id));

    // push players list to an array of embed fields
    const playerslist: PlayerslistInfo[] = [];

    // create playerListTimeout to add an empty field every 2 fields
    // this will help us create 2 columns for the embed
    qResSelDistricts.forEach(player => {
        const data: PlayerslistInfo = {
            username: player.username,
            player_id: player.player_id,
            profile_pic_url: player.profile_pic_url,
            district_id: player.district_id,
            district_position: player.district_position,
            real: Boolean(player.real)
        };

        const unknown_data: PlayerslistInfo = {
            username: "",
            player_id: player.id,
            profile_pic_url: "./assets/unknown_player.png",
            district_id: player.district_id,
            district_position: player.district_position,
            real: Boolean(player.real)
        };

        if (includedefaultplayers) {
            if (player.real) playerslist.push(data);
            playerslist.push(unknown_data);
            return;
        }

        playerslist.push(data);
        return;
    });

    return playerslist;
}
