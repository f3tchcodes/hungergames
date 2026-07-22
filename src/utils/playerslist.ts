import { type Interaction } from "discord.js";
import { eq } from "drizzle-orm";

import { getGamesTable } from "./common.js";
import { districts } from "./db/schema.js";
import type { TributeList } from "./interfaces.js";

export async function getPlayerslist(interaction: Interaction, includedefaultplayers: boolean | undefined): Promise<TributeList[] | undefined> {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    // get guild and id and check whether it's available
    const guild_id = interaction.guildId;
    if (!guild_id) return;

    // get games table
    const qGames = await getGamesTable(interaction, guild_id);
    if (!qGames || !qGames[0]) return;

    // get players list
    const qResSelDistricts = await interaction.client.db.select().from(districts).where(eq(districts.guild_id, guild_id));

    // push players list to an array of embed fields
    const playerslist: TributeList[] = [];

    // create playerListTimeout to add an empty field every 2 fields
    // this will help us create 2 columns for the embed
    qResSelDistricts.forEach(player => {
        const common_data = {
            player_id: player.player_id,
            district_id: player.district_id,
            district_position: player.district_position,
            real: Boolean(player.real),
            alive: Boolean(player.alive)
        };

        const data: TributeList = {
            username: player.username,
            profile_pic_url: player.profile_pic_url,
            ...common_data
        };

        const unknown_data: TributeList = {
            username: "",
            profile_pic_url: "./assets/unknown_player.png",
            ...common_data
        };

        if (includedefaultplayers) {
            playerslist.push(data);
            return;
        }

        if (player.real) playerslist.push(data);
        playerslist.push(unknown_data);
        return;
    });

    return playerslist;
}
