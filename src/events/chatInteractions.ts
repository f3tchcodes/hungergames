import { Events } from "discord.js";

import type { MyEvents } from "#utils/interfaces";

export default {
    name: Events.InteractionCreate,
    async executeInteraction(client, interaction, ...args) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.interactions.get(interaction.commandName);
        try {
            await command?.execute(client, interaction, args);
        } catch (err) {
            interaction.reply("Error occured while running the command, contact the developer to fix!\nUsername: f3tch");
            return console.log(`Error running command: ${err}`);
        }
    }
} satisfies MyEvents<"interactionCreate">;
