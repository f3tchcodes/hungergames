
import { Events } from "discord.js";

import { cancelCommand } from "#utils/commands/common";
import { channelIdSelected, createGame, nextButtonSelected, tributeSizeSelected } from "#utils/commands/host";
import { playersListBackward, playersListForward } from "#utils/commands/players";
import { registerPlayerBtn } from "#utils/commands/register";
import { _EphToast } from "#utils/common";
import type { MyEvents } from "#utils/interfaces";

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
                    const channel_id = await channelIdSelected(interaction);
                    const hostValues = client.hostValues.get(interaction.message.id);
                    client.hostValues.set(interaction.message.id, { channel_id, tribute_size: hostValues?.tribute_size });
                }
            } catch (err) {
                console.log(`Error running channel select: ${err}`);
            }
        } else if (interaction.isStringSelectMenu()) {
            try {
                if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) { await _EphToast(interaction, "Mind your own business you stupid bastard."); return; }
                if (interaction.customId === "tribute_size") {
                    const tribute_size = await tributeSizeSelected(interaction);
                    const hostValues = client.hostValues.get(interaction.message.id);
                    client.hostValues.set(interaction.message.id, { channel_id: hostValues?.channel_id, tribute_size });
                }
            } catch (err) {
                console.log(`Error running string select: ${err}`);
            }
        } else if (interaction.isButton()) {
            try {
                const messageId = interaction.message.id;

                const hostValues = interaction.client.hostValues.get(messageId);
                const channel_id = hostValues?.channel_id;
                const tribute_size = hostValues?.tribute_size;

                if (!messageId) return await _EphToast(interaction, "Failed to f3tch message ID!");

                // global buttons
                const register = interaction.customId === "register" ? await registerPlayerBtn(interaction) : null;

                if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) { await _EphToast(interaction, "Mind your own business you stupid bastard."); return; }

                // normal buttons
                const next = interaction.customId === "next" ? await nextButtonSelected(interaction, channel_id, tribute_size) : null;
                const create_game = interaction.customId === "create_game" ? await createGame(interaction, channel_id, tribute_size) : null;

                const forward = interaction.customId === "forward" ? await playersListForward(interaction, client.includedefaultplayers.get(messageId)) : null;
                const backward = interaction.customId === "backward" ? await playersListBackward(interaction, client.includedefaultplayers.get(messageId)) : null;

                // cancel button
                const cancel = interaction.customId === "cancel" ? await cancelCommand(interaction) : null;
            } catch (err) {
                console.log(`Error running button: ${err}`);
            }
        }

    }
} satisfies MyEvents<"interactionCreate">;
