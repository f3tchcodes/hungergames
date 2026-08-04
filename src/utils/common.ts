import {
    type Client,
    type Interaction,
    type MessageCreateOptions,
    MessageFlags,
    MessagePayload,
    type RepliableInteraction
} from "discord.js";
import { eq } from "drizzle-orm";

import { districts, games } from "./db/schema.js";

export async function _EphToast(interaction: RepliableInteraction, content: string): Promise<undefined> {
    await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}

export async function _EphToastDefer(interaction: RepliableInteraction, content: string): Promise<undefined> {
    await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
}

export async function getGamesTable(interaction: Interaction, guild_id: string) {
    const qGames = await interaction.client.db.select().from(games).where(eq(games.guild_id, guild_id));
    return qGames;
}

export async function sendChannelMessage(interaction: Interaction, channel_id: string, message: string | MessagePayload | MessageCreateOptions) {
    const channel = await interaction.client.channels.fetch(channel_id);
    if (!channel?.isSendable()) return console.error(`${channel_id}: channel not sendable`);
    await channel.send(message);
}

export function replaceLastOccurrence(str: string, search: string, replacement: string) {
    const lastIndex = str.lastIndexOf(search);
    if (lastIndex === -1) return str;
    return str.substring(0, lastIndex) + replacement + str.substring(lastIndex + search.length);
}

export async function stopGame(client: Client, guild_id: string) {
    // delete game data to stop the game
    await client.db.delete(games).where(eq(games.guild_id, guild_id));
    await client.db.delete(districts).where(eq(districts.guild_id, guild_id));
}
