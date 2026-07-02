import { Events } from "discord.js";

import type { MyEvents } from "#utils/interfaces";

export default {
    name: Events.InteractionCreate,
    async executeInteraction(client, interaction, ...args) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.interactions.get(interaction.commandName);
        await command?.execute(client, interaction, args);
    }
} satisfies MyEvents<"interactionCreate">;
