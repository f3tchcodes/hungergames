import { Events, MessageFlags } from "discord.js";

import type { MyEvents } from "#utils/interfaces";

export default {
    name: Events.InteractionCreate,
    async executeInteraction(client, interaction, ...args) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.interactions.get(interaction.commandName);
        try {
            await command?.execute(client, interaction, args);
        } catch (err) {
            console.log(`Error running command: ${err}`);
            return await interaction.reply({
                content: "Error occured while running the command, contact the developer to fix!\nUsername: f3tch",
                flags: MessageFlags.Ephemeral
            });
        }
    }
} satisfies MyEvents<"interactionCreate">;
