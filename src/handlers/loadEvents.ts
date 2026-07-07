import type { Client } from "discord.js";
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
            // run event
            client.on(event.name, (...args) => {
                event.execute(client, ...args);
            });
        } catch (err) {
            return console.log(`Error on loading event: ${err}`);
        }
    }
};
