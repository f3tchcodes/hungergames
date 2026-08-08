import { Client, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import type { MyInteractions, MyPrefixCommands } from "#utils/interfaces";

export default async (client: Client): Promise<void> => {
    // create dirname and filename from scratch
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // array of the body
    const body = [];

    // commands files
    const commandsFoldersPaths = path.join(__dirname, "../commands");
    const commandsFolders = fs.readdirSync(commandsFoldersPaths);
    const interactionFiles: string[] = [];
    const ownerCommandFiles: string[] = [];
    commandsFolders.forEach(folder => {
        const commandsPath = path.join(__dirname, `../commands/${folder}`);
        const commandsFiles = fs.readdirSync(commandsPath);
        commandsFiles.forEach(file => { if (folder === "owner") return ownerCommandFiles.push(`${folder}/${file}`); return interactionFiles.push(`${folder}/${file}`); });
    });

    for (const file of ownerCommandFiles) {
        if (!file.endsWith(".js")) continue;

        // prefix commands of owner
        const commandModule = await import(`../commands/${file}`);
        const command = commandModule.default as MyPrefixCommands;
        client.commands.set(command.name, command);
    }

    for (const file of interactionFiles) {
        if (!file.endsWith(".js")) continue;

        // push content of each interaction's data into body
        const interactionModule = await import(`../commands/${file}`);
        const interaction = interactionModule.default as MyInteractions;
        client.interactions.set(interaction.data.name, interaction);
        body.push(interaction.data.toJSON());
    }

    // if empty, don't send the request
    if (body.length < 1) return;

    // send request to update interactions
    try {
        const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);
        rest.put(
            Routes.applicationCommands(process.env.APP_ID!),
            { body }
        );
    } catch (err) {
        return console.log(`Error updating commands: ${err}`);
    }
};
