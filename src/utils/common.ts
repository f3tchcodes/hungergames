import { type Interaction, MessageFlags, type RepliableInteraction } from "discord.js";
import { eq } from "drizzle-orm";

import { games } from "./db/schema.js";

export async function _EphToast(interaction: RepliableInteraction, content: string): Promise<undefined> {
    await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}

export async function _EphToastDefer(interaction: RepliableInteraction, content: string): Promise<undefined> {
    await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
}

export async function getGamesTable(interaction: Interaction, guild_id: string) {
    const qGames = await interaction.client.db.select().from(games).where(eq(games.guild_id, guild_id));
    if (!qGames || !qGames[0]) return;
    return qGames;
}
