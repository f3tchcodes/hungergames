import { Events } from "discord.js";

import type { MyEvents } from "#utils/interfaces";
import { processGuilds } from "#utils/processGuilds";

export default {
    name: Events.ClientReady,
    async execute(client) {
        console.log(`${client.user?.tag} is alive!`);

        for (const guild of client.guilds.cache.values()) processGuilds(client, guild);
    }
} satisfies MyEvents<"clientReady">;
