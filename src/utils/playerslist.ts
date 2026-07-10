import { type APIEmbedField, EmbedBuilder, type Interaction, type RestOrArray } from "discord.js";
import { and, eq } from "drizzle-orm";

import config from "#utils/config";

import { _EphToast } from "./common.js";
import { districts, games } from "./db/schema.js";

export async function getPlayerslist(interaction: Interaction, includedefaultplayers: boolean | undefined) {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;
    let qResSelDistricts;

    // get guild and id and check whether it's available
    const guild_id = interaction.guildId;
    if (!guild_id) return await _EphToast(interaction, "Failed to f3tch the guild ID.");

    // get games table
    const qResSel = await interaction.client.db.select().from(games).where(eq(games.guild_id, guild_id));
    if (!qResSel[0]) return;

    // get players list
    if (includedefaultplayers) {
        qResSelDistricts = await interaction.client.db
            .select()
            .from(districts)
            .where(eq(districts.guild_id, guild_id));
    } else {
        qResSelDistricts = await interaction.client.db
            .select()
            .from(districts)
            .where(and(eq(districts.guild_id, guild_id), eq(districts.real, 1)));
    }

    if (!qResSelDistricts || qResSelDistricts.length === 0) {
        const playerlistNAEmbed = new EmbedBuilder()
            .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
            .setColor(config.THEME_COLOR)
            .setTitle("List of registered players: ")
            .setDescription("No registerations. I feel sorry for you man.")
            .setTimestamp();

        await interaction.reply({ embeds: [playerlistNAEmbed] });
        return [];
    }

    // push players list to an array of embed fields
    const playerslist: RestOrArray<APIEmbedField> = [];
    const playerListRowSize = qResSel[0]?.district_size - 1;
    let playerListTimeout = 0;

    // create playerListTimeout to add an empty field every 2 fields
    // this will help us create 2 columns for the embed
    qResSelDistricts.forEach(player => {
        if (playerListTimeout === 0) {
            playerslist.push({
                name: `DISTRICT ${player.district_id.toString()}`,
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
