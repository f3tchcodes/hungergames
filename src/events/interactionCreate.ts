import { Events } from "discord.js";

import { cancelCommand } from "#utils/commands/common";
import { channelIdSelected, createGame, nextButtonSelected, tributeSizeSelected } from "#utils/commands/host";
import { _EphToast } from "#utils/common";
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
        } else if (interaction.isChannelSelectMenu()) {
            try {
                if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) { await _EphToast(interaction, "Mind your own business you stupid bastard."); return; }
                if (interaction.customId === "channel") {
                    channel_id = await channelIdSelected(interaction);
                    console.log(channel_id);
                }
            } catch (err) {
                console.log(`Error running channel select: ${err}`);
            }
        } else if (interaction.isStringSelectMenu()) {
            try {
                if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) { await _EphToast(interaction, "Mind your own business you stupid bastard."); return; }
                if (interaction.customId === "tribute_size") {
                    tribute_size = await tributeSizeSelected(interaction);
                    console.log(tribute_size);
                }
            } catch (err) {
                console.log(`Error running string select: ${err}`);
            }
        } else if (interaction.isButton()) {
            try {
                // normal buttons
                const next = interaction.customId === "next" ? await nextButtonSelected(interaction, channel_id, tribute_size) : null;
                const create_game = interaction.customId === "create_game" ? await createGame(interaction, channel_id, tribute_size) : null;

                // cancel button
                const cancel = interaction.customId === "cancel" ? await cancelCommand(interaction) : null;
            } catch (err) {
                console.log(`Error running button: ${err}`);
            }
        }

    }
} satisfies MyEvents<"interactionCreate">;
