
import { type ButtonInteraction, type RepliableInteraction, StringSelectMenuInteraction } from "discord.js";
import { eq } from "drizzle-orm";

import { showEventsList } from "#utils/canvas";
import { _EphToastDefer, eventsActionEmbed, getServerDataTable } from "#utils/common";
import { server_data } from "#utils/db/schema";
import type { CategoryNames, GameEvents } from "#utils/interfaces";

export async function addEvent(interaction: RepliableInteraction, guild_id: string, categoryInput: string, eventTxt: string, playerCount: number, suggestion: boolean, killed: string[] = [], killers: string[] = []) {
    const qServerData = await getServerDataTable(interaction, guild_id);
    const events = qServerData[0]?.events;
    const eventsId = qServerData[0]?.events_id;
    if (!qServerData[0] || !events || !eventsId) return await _EphToastDefer(interaction, "Guild information not present in server_data. Kick and rejoin the bot or ask dev to fix.");

    const newEvent: GameEvents = {
        categoryName: categoryInput as CategoryNames,
        id: eventsId,
        event: eventTxt,
        tributes_involved: playerCount,
        suggestion: suggestion,
        killed,
        killers
    };

    await interaction.client.db.update(server_data).set({ events: [...events, newEvent], events_id: eventsId + 1 }).where(eq(server_data.guild_id, guild_id));
    await interaction.followUp("Successfully added the event!");
}

export async function editEvent(interaction: RepliableInteraction, guild_id: string, categoryInput: string | null, eventId: number, eventTxt: string | null, playerCount: number | null, killed: string[] = [], killers: string[] = []) {
    const qServerData = await getServerDataTable(interaction, guild_id);
    const events = qServerData[0]?.events;
    if (!qServerData[0] || !events) return await _EphToastDefer(interaction, "Guild information not present in server_data. Kick and rejoin the bot or ask dev to fix.");

    let updated = false;
    const newEvents = events.map(event => {
        if (eventId === event.id) {
            updated = true;
            return {
                ...event,
                categoryName: (categoryInput as CategoryNames) ?? event.categoryName,
                event: eventTxt ?? event.event,
                tributes_involved: playerCount ?? event.tributes_involved,
                killed,
                killers
            };
        } else return event;
    });
    await interaction.client.db.update(server_data).set({ events: newEvents }).where(eq(server_data.guild_id, guild_id));
    updated ?
        await interaction.followUp("Successfully edited the event!") :
        await interaction.followUp("Event not found!");
}

export async function moveListPages(interaction: ButtonInteraction, messageId: string, action: "forward" | "backward") {
    await interaction.deferUpdate();

    const qServerData = await getServerDataTable(interaction, interaction.guildId ?? "");
    const events = qServerData[0]?.events;
    if (!qServerData || !qServerData[0] || !events) return await _EphToastDefer(interaction, "Game events data not found!");

    const totalPages = interaction.client.eventPagesLength.get(messageId) ?? 1;
    const categoryInput = interaction.client.eventPage.get(messageId)?.category;
    const currentPage = interaction.client.eventPage.get(messageId)?.page ?? 2;
    const page = action === "forward" ? currentPage + 1 : currentPage - 1;
    if (page < 1) return await _EphToastDefer(interaction, "No page 0!!");
    if (page > totalPages) return await _EphToastDefer(interaction, "Where are you trying to go?");
    if (categoryInput) {
        const newEvents = events.filter(event => event.categoryName === categoryInput);
        if (!newEvents[0]) return await interaction.followUp("Category not found.");
        const eventsImage = await showEventsList(interaction.client, newEvents, page, messageId, false);
        await interaction.editReply({ files: [eventsImage] });
        interaction.client.eventPage.set(messageId, { page, category: categoryInput as CategoryNames });
        return;
    }

    const eventsImage = await showEventsList(interaction.client, events, page, messageId, false);
    await interaction.editReply({ files: [eventsImage] });
    interaction.client.eventPage.set(messageId, { page });
    return;
}

export async function updateEventEmbed(interaction: StringSelectMenuInteraction, messageId: string, gameEvents: GameEvents, action: "adding" | "editing", newKilled: string[], newKillers: string[]) {
    await interaction.deferUpdate();

    const killed = gameEvents.killed ?? [];
    const killers = gameEvents.killers ?? [];

    const cleanNewKilled = newKilled[0] ?? "";
    const cleanNewKiller = newKillers[0] ?? "";

    const updatedKilled = cleanNewKilled
        ? killed.includes(cleanNewKilled)
            ? killed.filter(killedPlayer => killedPlayer !== cleanNewKilled)
            : [...killed, cleanNewKilled]
        : killed;

    const updatedKillers = cleanNewKiller
        ? killers.includes(cleanNewKiller)
            ? killers.filter(killer => killer !== cleanNewKiller)
            : [...killers, cleanNewKiller]
        : killers;

    const editedGameEvents = {
        ...gameEvents,
        killed: updatedKilled,
        killers: updatedKillers,
    };

    interaction.client.fatalValues.set(messageId, { action, gameEvents: editedGameEvents });
    await interaction.editReply({ embeds: [eventsActionEmbed(interaction, action, editedGameEvents)] });
}

export async function submitEmbededEvent(interaction: ButtonInteraction, messageId: string) {
    await interaction.deferUpdate();
    const event = interaction.client.fatalValues.get(messageId);
    if (!event) return _EphToastDefer(interaction, "Event information not found. Try again.");

    const guild_id = interaction.guildId ?? "";
    const gameEvents = event.gameEvents;
    const id = gameEvents.id;
    const categoryName = gameEvents.categoryName;
    const eventTxt = gameEvents.event;
    const playerCount = gameEvents.tributes_involved;
    const suggestion = gameEvents.suggestion;
    const killed = gameEvents.killed ?? [];
    const killers = gameEvents.killers ?? [];

    if (event.action === "adding") addEvent(interaction, guild_id, categoryName, eventTxt, playerCount, suggestion, killed, killers);
    if (event.action === "editing") editEvent(interaction, guild_id, categoryName, id, eventTxt, playerCount, killed, killers);
}
