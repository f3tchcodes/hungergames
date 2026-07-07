import { Events, MessageFlags } from "discord.js";

import { channelIdSelected, nextButtonSelected, tributeSizeSelected } from "#utils/host";
import type { MyEvents } from "#utils/interfaces";

let channel_id: string | undefined = undefined;
let tribute_size: number | undefined = undefined;

export default {
    name: Events.InteractionCreate,
    async execute(client, interaction, ...args) {

        if (interaction.isChatInputCommand()) {
            const command = client.interactions.get(interaction.commandName);
            try {
                await command?.execute(client, interaction, args);
            } catch (err) {
                console.log(`Error running command: ${err}`);
            }
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) { await interaction.reply({ content: "Mind your own business you stupid bastard.", flags: MessageFlags.Ephemeral }); return; }
            if (interaction.customId === "tribute_size") {
                tribute_size = await tributeSizeSelected(interaction);
                console.log(tribute_size);
            } else {
                await interaction.reply({ content: "Interaction failed. Try again.", flags: MessageFlags.Ephemeral });
            }
        } else if (interaction.isChannelSelectMenu()) {
            if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) { await interaction.reply({ content: "Mind your own business you stupid bastard.", flags: MessageFlags.Ephemeral }); return; }
            if (interaction.customId === "channel") {
                channel_id = await channelIdSelected(interaction);
                console.log(channel_id);
            }
        } else if (interaction.isButton()) {
            if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) { await interaction.reply({ content: "Mind your own business you stupid bastard.", flags: MessageFlags.Ephemeral }); return; }
            const next = interaction.customId === "next" ? await nextButtonSelected(interaction, channel_id, tribute_size) : await interaction.reply({ content: "Interaction failed. Try again.", flags: MessageFlags.Ephemeral });
        }

    }
} satisfies MyEvents<"interactionCreate">;
