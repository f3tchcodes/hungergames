import { Events } from "discord.js";

import { games } from "#utils/db/schema";
import type { MyEvents } from "#utils/interfaces";
import { processGuilds } from "#utils/processGuilds";

export default {
    name: Events.ClientReady,
    async execute(client) {
        console.log(`${client.user?.tag} is alive!`);

        for (const guild of client.guilds.cache.values()) processGuilds(client, guild);
        await client.db.update(games).set({ restarting: 0 });
    }
} satisfies MyEvents<"clientReady">;
