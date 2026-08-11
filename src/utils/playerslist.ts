import { type Interaction } from "discord.js";

import { _EphToast, getGamesTable } from "#utils/common";
import type { PlayersDistricts } from "#utils/interfaces";


export async function getPlayerslist(interaction: Interaction, includedefaultplayers: boolean | undefined) {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    // get guild and id and check whether it's available
    const guild_id = interaction.guildId;
    if (!guild_id) return;

    // get games table
    const qGames = await getGamesTable(interaction, guild_id);
    if (!qGames || !qGames[0]) return;

    // get players list
    const qResSelDistricts = qGames[0].districts_data;
    if (!qResSelDistricts) return await _EphToast(interaction, "Players data does not exist!");

    const playerslistComplete: PlayersDistricts[][] = [];

    qResSelDistricts.forEach(district => {
        const playerslist: PlayersDistricts[] = [];

        district.forEach(player => {
            const common_data = {
                player_id: player.player_id,
                user_id: player.user_id,
                gender: player.gender,
                real: Boolean(player.real),
                alive: Boolean(player.alive)
            };

            const data: PlayersDistricts = {
                username: player.username,
                profile_pic_url: player.profile_pic_url,
                ...common_data
            };

            const unknown_data: PlayersDistricts = {
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
        });

        playerslistComplete.push(playerslist);
    });

    return playerslistComplete;
}
