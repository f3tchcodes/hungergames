import type { MyEvents } from "#utils/interfaces";

export default {
    name: "guildCreate",
    async execute(client, guild) {
        const ownerId = guild.ownerId;
        const owner = await client.users.fetch(ownerId);

        console.log(`New guild joined: ${guild.name} (${guild.id}) | Owner: ${owner.username} (${ownerId})`);
    }
} satisfies MyEvents<"guildCreate">;
