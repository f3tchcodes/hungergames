import type { Client, Guild } from "discord.js";

import { DEFAULT_EVENTS } from "#config/events";

import { server_data } from "./db/schema.js";

export async function processGuilds(client: Client, guild: Guild) {
    const ownerId = guild.ownerId;
    const owner = await client.users.fetch(ownerId);
    const ownerUsername = owner.username;
    const guildId = guild.id;
    const guildName = guild.name;

    const guilds = await client.db.select().from(server_data);
    const guildsId = guilds.map(server => server.guild_id);
    await client.db.update(server_data).set({ events: DEFAULT_EVENTS });
    if (guildsId.includes(guildId)) return;

    await client.db.insert(server_data).values({ guild_id: guildId, guild_owner: ownerUsername, guild_name: guildName });
    console.log(`New guild joined: ${guildName} (${guildId}) | Owner: ${ownerUsername} (${ownerId})`);
}
