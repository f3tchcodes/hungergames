import { Client, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import type { MyInteractions } from "#utils/interfaces";

export default async (client: Client): Promise<void> => {
    // create dirname and filename from scratch
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // array of the body
    const body = [];

    // interaction files
    const interactionPath = path.join(__dirname, "../interactions");
    const interactionFiles = fs.readdirSync(interactionPath);

    for (const file of interactionFiles) {
        if (!file.endsWith(".js")) continue;

        // push content of each interaction's data into body
        const interactionModule = await import(`../interactions/${file}`);
        const interaction = interactionModule.default as MyInteractions;
        client.interactions.set(interaction.data.name, interaction);
        body.push(interaction.data.toJSON());
    }

    // send request to update interactions
    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);
    rest.put(
        Routes.applicationCommands(process.env.APP_ID!),
        { body }
    );
};
