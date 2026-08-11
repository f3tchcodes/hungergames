import { server_data } from "#utils/db/schema";
import type { MyEvents } from "#utils/interfaces";

export default {
    name: "guildCreate",
    async execute(client, guild) {
        const ownerId = guild.ownerId;
        const owner = await client.users.fetch(ownerId);
        const ownerUsername = owner.username;
        const guildId = guild.id;
        const guildName = guild.name;

        const guilds = await client.db.select().from(server_data);
        const guildsId = guilds.map(server => server.guild_id);
        if (guildsId.includes(guildId)) return;

        await client.db.insert(server_data).values({ guild_id: guildId, guild_owner: ownerUsername, guild_name: guildName });
        console.log(`New guild joined: ${guildName} (${guildId}) | Owner: ${ownerUsername} (${ownerId})`);
    }
} satisfies MyEvents<"guildCreate">;
