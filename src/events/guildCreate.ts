import type { MyEvents } from "#utils/interfaces";
import { processGuilds } from "#utils/processGuilds";

export default {
    name: "guildCreate",
    async execute(client, guild) {
        await processGuilds(client, guild);
    }
} satisfies MyEvents<"guildCreate">;
