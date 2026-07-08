import type { ButtonInteraction } from "discord.js";
import { and, eq, not } from "drizzle-orm";

import { _EphToast } from "#utils/common";
import { districts, games } from "#utils/db/schema";

export async function registerUser(interaction: ButtonInteraction) {
    // get all info needed
    const guild_id = interaction.guildId;
    const user_id = interaction.user.id;
    const username = interaction.user.displayName;
    const profile_pic_url = interaction.user.displayAvatarURL({ extension: "png" });

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
    const player_id = qGames[0]?.registered_players + 1;

    if (player_id > tribute_size) {
        interaction.update({ components: [] });
        return await _EphToast(interaction, "All spots have been filled, you can no longer register!");
    }

    // send query to register players
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

    // increment registered_players by 1
    await interaction.client.db
        .update(games)
        .set({
            registered_players: player_id
        })
        .where(eq(games.guild_id, guild_id));

    // finaly reply
    return await _EphToast(interaction, `Successfully registered **${username}** to The Hunger Games.\nUse \`/setgender\` to set your gender.`);
}
