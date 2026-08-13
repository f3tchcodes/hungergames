
import { Events } from "discord.js";

import { cancelCommand } from "#utils/commands/common";
import { moveListPages, submitEmbededEvent, updateEventEmbed } from "#utils/commands/events";
import { channelIdSelected, createGame, nextButtonSelected, tributeSizeSelected } from "#utils/commands/host";
import { registerPlayerBtn } from "#utils/commands/register";
import { _EphToast, _EphToastDefer } from "#utils/common";
import type { MyEvents } from "#utils/interfaces";

export default {
    name: Events.InteractionCreate,
    async execute(client, interaction, ...args) {
        if (interaction.isChatInputCommand()) {
            const command = client.interactions.get(interaction.commandName);
            if (!command) return await _EphToast(interaction, "Unknown command. Try again.");
            try {
                await command.execute(client, interaction, args);
            } catch (err) {
                console.log(`Error running command: ${err}`);
            }
            // await command.execute(client, interaction, args);
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
                const messageId = interaction.message.id;
                if (!messageId) return await _EphToast(interaction, "Failed to f3tch message ID!");

                if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) { await _EphToast(interaction, "Mind your own business you stupid bastard."); return; }
                if (interaction.customId === "tribute_size") {
                    const tribute_size = await tributeSizeSelected(interaction);
                    const hostValues = client.hostValues.get(interaction.message.id);
                    client.hostValues.set(interaction.message.id, { channel_id: hostValues?.channel_id, tribute_size });
                } else if (interaction.customId === "event_killed") {
                    const newKilled = [interaction.values[0] ?? "Unkown"];
                    const event = interaction.client.fatalValues.get(messageId);
                    if (!event) return await _EphToastDefer(interaction, "Event and action not found. Try again.");
                    await updateEventEmbed(interaction, messageId, event.gameEvents, event.action, newKilled, []);
                } else if (interaction.customId === "event_killers") {
                    const newKillers = [interaction.values[0] ?? "Unkown"];
                    const event = interaction.client.fatalValues.get(messageId);
                    if (!event) return await _EphToastDefer(interaction, "Event and action not found. Try again.");
                    await updateEventEmbed(interaction, messageId, event.gameEvents, event.action, [], newKillers);
                }
            } catch (err) {
                console.log(`Error running string select: ${err}`);
            }
        } else if (interaction.isButton()) {
            try {
                const messageId = interaction.message.id;
                if (!messageId) return await _EphToast(interaction, "Failed to f3tch message ID!");

                const customId = interaction.customId;
                const hostValues = interaction.client.hostValues.get(messageId);
                const channel_id = hostValues?.channel_id;
                const tribute_size = hostValues?.tribute_size;

                // global buttons
                if (customId === "register") return await registerPlayerBtn(interaction) as void;

                if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) { await _EphToast(interaction, "Mind your own business you stupid bastard."); return; }

                // normal buttons
                if (customId === "next") return await nextButtonSelected(interaction, channel_id, tribute_size) as void;
                if (customId === "create_game") return await createGame(interaction, channel_id, tribute_size) as void;
                if (customId === "event_submit") return await submitEmbededEvent(interaction, messageId);

                // page buttons
                if (customId === "forward_list") return await moveListPages(interaction, messageId, "forward") as void;
                if (customId === "backward_list") return await moveListPages(interaction, messageId, "backward") as void;

                // common buttons
                if (customId === "cancel") return await cancelCommand(interaction) as void;
            } catch (err) {
                console.log(`Error running button: ${err}`);
            }
        }
    }
} satisfies MyEvents<"interactionCreate">;
