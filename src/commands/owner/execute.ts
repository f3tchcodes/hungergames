import { exec } from "node:child_process";
import { promisify } from "node:util";

import config from "#config/config";
import type { MyPrefixCommands } from "#utils/interfaces";

const execAsync = promisify(exec);

export default {
    name: "execute",
    async execute(client, message, args) {
        if (!message.channel.isSendable()) return;
        if (message.author.id !== config.BOT_OWNER_USERID) return;

        const command = args.slice(0).join(" ");
        const result = await execAsync(command, { timeout: 60000 }).catch(error => ({ stdout: null, stderr: error }));
        const resultFormated = [result.stdout, result.stderr].join("\n");
        if (resultFormated.length > 2000) return message.channel.send("Output too long");
        console.log(`COMMAND RAN: ${command}\nRESULT: ${resultFormated}`);
        await message.channel.send(`\`\`\`${resultFormated}\`\`\``);
    }
} satisfies MyPrefixCommands;
