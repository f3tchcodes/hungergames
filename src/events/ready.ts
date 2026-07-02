import { Events } from "discord.js";

import type { MyEvents } from "#utils/interfaces";

export default {
    name: Events.ClientReady,
    async execute(client) {
        console.log(`${client.user?.tag} is alive!`);
    }
} satisfies MyEvents<"clientReady">;
