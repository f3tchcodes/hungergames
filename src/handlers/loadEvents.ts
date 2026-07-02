import type { Client, Interaction } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import type { MyEvents } from "#utils/interfaces";

export default async (client: Client): Promise<void> => {
    // create dirname and filename from scratch
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // event files
    const eventPath = path.join(__dirname, "../events");
    const eventFiles = fs.readdirSync(eventPath);

    // going through each event file and running them
    for (const file of eventFiles) {
        if (!file.endsWith(".js")) continue;

        const eventModule = await import(`../events/${file}`);
        const event = eventModule.default as MyEvents;

        try {
            // run the normal event
            client.on(event.name, (...args) => {
                if (event.execute === undefined) return;
                event.execute(client, ...args);
            });

            // run the interaction event
            if (event.name !== "interactionCreate") continue;
            client.on(event.name, (interaction: Interaction, ...args) => {
                if (event.executeInteraction === undefined) return;
                event.executeInteraction(client, interaction, ...args);
            });
        } catch (err) {
            return console.log(`Error on loading event: ${err}`);
        }
    }
};
