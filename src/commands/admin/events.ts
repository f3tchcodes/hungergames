
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { eq } from "drizzle-orm";

import { choices } from "#config/choices";
import { DEFAULT_EVENTS } from "#config/events";
import { showEventsList } from "#utils/canvas";
import { addEvent, editEvent } from "#utils/commands/events";
import { _EphToast, _EphToastDefer, eventsActionEmbed, getServerDataTable } from "#utils/common";
import { server_data } from "#utils/db/schema";
import type { CategoryNames, ChangedCategory, GameEvents, MyInteractions } from "#utils/interfaces";

const events = new SlashCommandBuilder()
    .setName("events")
    .setDescription("Add, edit, remove, or reset game events!")
    .addSubcommand(subcommand =>
        subcommand
            .setName("list")
            .setDescription("List all game events!")
            .addIntegerOption(op =>
                op
                    .setName("page")
                    .setDescription("List game events at a specific page.")
                    .setRequired(false)
            )
            .addStringOption(op =>
                op
                    .setName("category")
                    .setDescription("List game events categorically.")
                    .addChoices(...choices.EVENTS_CATEGORIES)
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("add")
            .setDescription("Add a game event!")
            .addStringOption(op =>
                op
                    .setName("event")
                    .setDescription("Event text (make sure to use correct format).")
                    .setRequired(true)
            )
            .addIntegerOption(op =>
                op
                    .setName("player-count")
                    .setDescription("Number of unique players involved.")
                    .setRequired(true)
            )
            .addStringOption(op =>
                op
                    .setName("category")
                    .setDescription("Category of the event.")
                    .addChoices(...choices.EVENTS_CATEGORIES)
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("edit")
            .setDescription("Edit a game event!")
            .addIntegerOption(op =>
                op
                    .setName("event-id")
                    .setDescription("Event ID of the event you wish to edit.")
                    .setRequired(true)
            )
            .addStringOption(op =>
                op
                    .setName("event")
                    .setDescription("Event text (make sure to use correct format).")
                    .setRequired(false)
            )
            .addIntegerOption(op =>
                op
                    .setName("player-count")
                    .setDescription("Number of unique players involved.")
                    .setRequired(false)
            )
            .addStringOption(op =>
                op
                    .setName("category")
                    .setDescription("Category of the event.")
                    .addChoices(...choices.EVENTS_CATEGORIES)
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("remove")
            .setDescription("Remove a game event!")
            .addIntegerOption(op =>
                op
                    .setName("event-id")
                    .setDescription("Event ID of the event you wish to remove.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("reset")
            .setDescription("Reset all game events!")
            .addStringOption(op =>
                op
                    .setName("category")
                    .setDescription("Reset game events categorically.")
                    .addChoices(...choices.EVENTS_CATEGORIES)
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("clear")
            .setDescription("Clear all game events!")
            .addStringOption(op =>
                op
                    .setName("category")
                    .setDescription("Clear game events categorically.")
                    .addChoices(...choices.EVENTS_CATEGORIES)
                    .setRequired(false)
            )
    );

export default {
    data: events,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;
        const deferResponse = await interaction.deferReply({ withResponse: true });
        const messageId = deferResponse.resource?.message?.id;
        if (!messageId) return _EphToastDefer(interaction, "Message ID not found. Try again.");

        const guild_id = interaction.guildId ?? "unknown";
        const qServerData = await getServerDataTable(interaction, guild_id);
        const events = qServerData[0]?.events;
        const eventsId = qServerData[0]?.events_id;
        if (!qServerData[0] || !events || !eventsId) return await _EphToast(interaction, "Guild information not present in server_data. Kick and rejoin the bot or ask dev to fix.");

        const categories = [
            "Bloodbath Events",
            "Day Events",
            "Night Events",
            "Feast Events",
            "Fatal Bloodbath Events",
            "Fatal Day Events",
            "Fatal Night Events",
            "Fatal Feast Events",
        ];

        const fatalEvents = [
            "Fatal Bloodbath Events",
            "Fatal Day Events",
            "Fatal Night Events",
            "Fatal Feast Events",
        ];

        let updated = false;
        const playerCount = interaction.options.getInteger("player-count") ?? 0;
        if (playerCount > 10) return await _EphToastDefer(interaction, "Player count too large!");

        const event_killed = new StringSelectMenuBuilder().setCustomId("event_killed").setPlaceholder("Add/remove the killed player(s)!");
        const event_killers = new StringSelectMenuBuilder().setCustomId("event_killers").setPlaceholder("Add/remove the killer(s)!");
        const event_submit = new ButtonBuilder().setCustomId("event_submit").setLabel("Submit").setStyle(ButtonStyle.Success);
        const event_cancel = new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger);
        const buttonBuilderRowAction = new ActionRowBuilder<ButtonBuilder>().addComponents(event_submit, event_cancel);

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "list") {
            const categoryInput = interaction.options.getString("category");
            const page = interaction.options.getInteger("page") ?? 1;
            if (page < 1) return _EphToastDefer(interaction, "Incorrect page number!");

            const forwardButton = new ButtonBuilder().setCustomId("forward_list").setLabel(">").setStyle(ButtonStyle.Secondary);
            const backwardButton = new ButtonBuilder().setCustomId("backward_list").setLabel("<").setStyle(ButtonStyle.Secondary);
            const buttonBuilderRowList = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardButton, forwardButton);

            if (categoryInput) {
                const newEvents = events.filter(event => event.categoryName === categoryInput);
                if (!newEvents[0]) return await interaction.followUp("Category not found.");
                const eventsImage = await showEventsList(client, newEvents, page, messageId, false);
                const response = await interaction.followUp({ content: categoryInput, files: [eventsImage], components: [buttonBuilderRowList], withResponse: true });
                client.eventPage.set(response.id, { page: 1, category: categoryInput as CategoryNames });
                return;
            }

            const eventsImage = await showEventsList(client, events, page, messageId, false);
            const response = await interaction.followUp({ content: "All Game Events", files: [eventsImage], components: [buttonBuilderRowList], withResponse: true });
            client.eventPage.set(response.id, { page: 1 });
            return;
        } else if (subcommand === "add") {
            const eventTxt = interaction.options.getString("event");
            const categoryInput = interaction.options.getString("category");
            if (!eventTxt || !playerCount || !categoryInput) return await _EphToast(interaction, "Required input not received.");

            const playerOptions: StringSelectMenuOptionBuilder[] = [];
            for (let i = 1; i < playerCount + 1; i++) playerOptions.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Player${i}`)
                    .setValue(`Player${i}`)
            );

            event_killed.addOptions(playerOptions);
            event_killers.addOptions(playerOptions);
            const stringSelectRowKilled = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(event_killed);
            const stringSelectRowKillers = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(event_killers);

            if (fatalEvents.includes(categoryInput)) {
                const gameEvents: GameEvents = {
                    id: eventsId,
                    categoryName: categoryInput as CategoryNames,
                    event: eventTxt,
                    tributes_involved: playerCount,
                    suggestion: false
                };
                client.fatalValues.set(messageId, { action: "adding", gameEvents });
                return await interaction.followUp({ embeds: [eventsActionEmbed(interaction, "adding", gameEvents)], components: [stringSelectRowKilled, stringSelectRowKillers, buttonBuilderRowAction] });
            }
            await addEvent(interaction, guild_id, categoryInput, eventTxt, playerCount, false);
        } else if (subcommand === "edit") {
            const eventId = interaction.options.getInteger("event-id");
            const eventTxt = interaction.options.getString("event");
            const categoryInput = interaction.options.getString("category");
            if (!eventId || (categoryInput && !categories.includes(categoryInput as CategoryNames))) return await _EphToast(interaction, "Required input not received.");
            let fatalEvent = false;
            const gameEvents = events.find(event => {
                if (event.id === eventId) {
                    fatalEvents.includes(event.categoryName) ? fatalEvent = true : fatalEvent = false;

                    return {
                        ...event,
                        event: event.event ?? eventTxt ?? "Unkown",
                        category: event.categoryName ?? "Bloodbath Events",
                        tributes_involved: event.tributes_involved ?? playerCount,
                        killed: event.killed ?? [],
                        killers: event.killers ?? [],
                    };
                }
            });
            if (!gameEvents) return await _EphToastDefer(interaction, "Event not found.");

            const playerOptions: StringSelectMenuOptionBuilder[] = [];
            for (let i = 1; i < (gameEvents?.tributes_involved ?? playerCount) + 1; i++) playerOptions.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Player${i}`)
                    .setValue(`Player${i}`)
            );

            event_killed.addOptions(playerOptions);
            event_killers.addOptions(playerOptions);
            const stringSelectRowKilled = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(event_killed);
            const stringSelectRowKillers = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(event_killers);

            if (fatalEvent) {
                client.fatalValues.set(messageId, { action: "editing", gameEvents });
                return await interaction.followUp({ embeds: [eventsActionEmbed(interaction, "editing", gameEvents)], components: [stringSelectRowKilled, stringSelectRowKillers, buttonBuilderRowAction], withResponse: true });
            }
            await editEvent(interaction, guild_id, categoryInput, eventId, eventTxt, playerCount);
        } else if (subcommand === "remove") {
            const eventId = interaction.options.getInteger("event-id");
            if (!eventId) return await _EphToast(interaction, "Required input not received.");

            const newEvents = events.filter(event => {
                if (eventId === event.id) updated = true;
                return eventId !== event.id;
            });
            await interaction.client.db.update(server_data).set({ events: newEvents });
            updated ?
                await interaction.followUp("Successfully removed the event!") :
                await interaction.followUp("Event not found!");
        } else if (subcommand === "reset") {
            const categoryInput = interaction.options.getString("category");
            if (categoryInput && !categories.includes(categoryInput as CategoryNames)) return await _EphToast(interaction, "Required input not received.");

            let changedCategory: ChangedCategory = "all";
            let newEvents: GameEvents[];
            if (categoryInput) {
                const defaultCategory = DEFAULT_EVENTS.filter(defaultCategory => defaultCategory.categoryName === categoryInput) ?? [{ id: 999, categoryName: categoryInput, event: "Default events for this category not found. Contact dev to fix.", suggestion: false }];
                changedCategory = categoryInput as ChangedCategory;
                newEvents = defaultCategory;
            } else newEvents = DEFAULT_EVENTS;

            await interaction.client.db.update(server_data).set({ events: newEvents }).where(eq(server_data.guild_id, guild_id));
            await interaction.followUp(`Successfully reset the events to default for ${changedCategory === "all" ? "" : "the "}${changedCategory} ${changedCategory === "all" ? "the " : ""}categor${changedCategory === "all" ? "ies" : "y"}!`);
        } else if (subcommand === "clear") {
            const categoryInput = interaction.options.getString("category");
            if (categoryInput && !categories.includes(categoryInput as CategoryNames)) return await _EphToast(interaction, "Required input not received.");

            let changedCategory: ChangedCategory = "all";
            let newEvents: GameEvents[];
            if (categoryInput) {
                changedCategory = categoryInput as ChangedCategory;
                newEvents = events.filter(event => categoryInput !== event.categoryName);
            } else newEvents = [];

            await interaction.client.db.update(server_data).set({ events: newEvents }).where(eq(server_data.guild_id, guild_id));
            await interaction.followUp(`Successfully cleared the events of ${changedCategory === "all" ? "" : "the "}${changedCategory} ${changedCategory === "all" ? "the " : ""}categor${changedCategory === "all" ? "ies" : "y"}!`);
        }
    }
} satisfies MyInteractions;
