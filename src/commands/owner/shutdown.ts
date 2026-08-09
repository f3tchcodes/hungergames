import { exec } from "node:child_process";
import { promisify } from "node:util";

import config from "#utils/config";
import type { MyPrefixCommands } from "#utils/interfaces";
import { shutdown } from "#utils/shutdown";

const execAsync = promisify(exec);

export default {
    name: "execute",
    async execute(client, message, args) {
        if (!message.channel.isSendable()) return;
        if (message.author.id !== config.BOT_OWNER_USERID) return;
        try {
            console.log("Shutting down the bot...");
            await message.channel.send("Shutting down the bot...");
            return shutdown();
        } catch (err) {
            message.channel.send("Error occured while shutting down! Shutdown failed.");
            process.exit(1);
        }
    }
} satisfies MyPrefixCommands;
