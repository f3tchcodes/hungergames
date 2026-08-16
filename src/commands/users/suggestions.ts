
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { eq } from "drizzle-orm";

import { choices } from "#config/choices";
import { showEventsList } from "#utils/canvas";
import { addEvent, editEvent } from "#utils/commands/events";
import { voteSuggestion } from "#utils/commands/suggestions";
import { _EphToastDefer, eventsActionEmbed, eventsViewEmbed, getServerDataTable } from "#utils/common";
import { server_data } from "#utils/db/schema";
import type { CategoryNames, ChangedCategory, GameEvents, MyInteractions } from "#utils/interfaces";
import { userPermissions } from "#utils/permissions";

const suggestions = new SlashCommandBuilder()
    .setName("suggestions")
    .setDescription("Add, edit, remove, or clear game event suggestions!")
    .addSubcommand(subcommand =>
        subcommand
            .setName("list")
            .setDescription("List all game event suggestions!")
            .addIntegerOption(op =>
                op
                    .setName("page")
                    .setDescription("List game event suggestions at a specific page.")
                    .setRequired(false)
            )
            .addStringOption(op =>
                op
                    .setName("category")
                    .setDescription("List game event suggestions categorically.")
                    .addChoices(...choices.EVENTS_CATEGORIES)
                    .setRequired(false)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("view")
            .setDescription("View details of a specific game event suggestion!")
            .addIntegerOption(op =>
                op
                    .setName("suggestion-id")
                    .setDescription("Suggestion ID of the suggestion you wish to view.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("add")
            .setDescription("Add a game event suggestion!")
            .addStringOption(op =>
                op
                    .setName("event")
                    .setDescription("Event suggestion text (make sure to use correct format).")
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
            .setDescription("Edit a game event suggestion!")
            .addIntegerOption(op =>
                op
                    .setName("suggestion-id")
                    .setDescription("Suggestion ID of the event you wish to edit.")
                    .setRequired(true)
            )
            .addStringOption(op =>
                op
                    .setName("event")
                    .setDescription("Event suggestion text (make sure to use correct format).")
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
            .setDescription("Remove a game event suggestion!")
            .addIntegerOption(op =>
                op
                    .setName("suggestion-id")
                    .setDescription("Suggestion ID of the event you wish to remove.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("upvote")
            .setDescription("Upvote a suggestion!")
            .addIntegerOption(op =>
                op
                    .setName("suggestion-id")
                    .setDescription("Suggestion ID of the event you wish to upvote.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("downvote")
            .setDescription("Downvote a suggestion!")
            .addIntegerOption(op =>
                op
                    .setName("suggestion-id")
                    .setDescription("Suggestion ID of the event you wish to downvote.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("withdrawvote")
            .setDescription("Withdraw your vote for a suggestion!")
            .addIntegerOption(op =>
                op
                    .setName("suggestion-id")
                    .setDescription("Suggestion ID of the event you wish to withdraw your vote from.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("accept")
            .setDescription("Accept a suggestion and add to event list!")
            .addIntegerOption(op =>
                op
                    .setName("suggestion-id")
                    .setDescription("Suggestion ID of the event you wish to accept.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("clear")
            .setDescription("Clear all game event suggestions!")
            .addStringOption(op =>
                op
                    .setName("category")
                    .setDescription("Clear game event suggestions categorically.")
                    .addChoices(...choices.EVENTS_CATEGORIES)
                    .setRequired(false)
            )
    );

export default {
    data: suggestions,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        const deferResponse = await interaction.deferReply({ withResponse: true });
        const messageId = deferResponse.resource?.message?.id;
        if (!messageId) return _EphToastDefer(interaction, "Message ID not found. Try again.");

        const guild_id = interaction.guildId ?? "unknown";
        const qServerData = await getServerDataTable(interaction, guild_id);
        const events = qServerData[0]?.suggestions;
        const eventsId = qServerData[0]?.events_id;
        if (!qServerData[0] || !events || !eventsId) return await _EphToastDefer(interaction, "Guild information not present in server_data. Kick and rejoin the bot or ask dev to fix.");
        const suggestion = true;

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
                const response = await interaction.followUp({ content: `${categoryInput} Suggestions`, files: [eventsImage], components: [buttonBuilderRowList], withResponse: true });
                client.eventPage.set(response.id, { page: 1, category: categoryInput as CategoryNames });
                return;
            }

            const eventsImage = await showEventsList(client, events, page, messageId, suggestion);
            const response = await interaction.followUp({ content: "All Game Events Suggestions", files: [eventsImage], components: [buttonBuilderRowList], withResponse: true });
            client.eventPage.set(response.id, { page: 1 });
            return;
        } else if (subcommand === "view") {
            const eventId = interaction.options.getInteger("suggestion-id");
            if (!eventId) return await _EphToastDefer(interaction, "Required input not received.");

            const event = events.find(event => event.id === eventId);
            if (!event) return await _EphToastDefer(interaction, "Event not found!");

            await interaction.followUp({ embeds: [await eventsViewEmbed(interaction, event)] });
        } else if (subcommand === "accept") {
            // check required permissions
            const isAdmin = await userPermissions(interaction, [
                PermissionsBitField.Flags.ManageGuild
            ], [
                "ManageGuild"
            ], "deferred");
            if (!isAdmin) return;

            const eventId = interaction.options.getInteger("suggestion-id");
            if (!eventId) return await _EphToastDefer(interaction, "Required input not received.");

            const event = events.find(event => event.id === eventId);
            if (!event) return await interaction.followUp("Suggestion not found!");

            event.suggestion = false;
            await addEvent(interaction, guild_id, event);
        } else if (subcommand === "upvote") {
            const eventId = interaction.options.getInteger("suggestion-id");
            if (!eventId) return await _EphToastDefer(interaction, "Required input not received.");

            const event = events.find(event => event.id === eventId);
            if (!event) return await interaction.followUp("Suggestion not found!");

            await voteSuggestion(interaction, events, eventId, "upvote");
        } else if (subcommand === "downvote") {
            const eventId = interaction.options.getInteger("suggestion-id");
            if (!eventId) return await _EphToastDefer(interaction, "Required input not received.");

            const event = events.find(event => event.id === eventId);
            if (!event) return await interaction.followUp("Suggestion not found!");

            await voteSuggestion(interaction, events, eventId, "downvote");
        }
        else if (subcommand === "withdrawvote") {
            const eventId = interaction.options.getInteger("suggestion-id");
            if (!eventId) return await _EphToastDefer(interaction, "Required input not received.");

            const event = events.find(event => event.id === eventId);
            if (!event) return await interaction.followUp("Suggestion not found!");

            await voteSuggestion(interaction, events, eventId, "withdrawvote");
        } else if (subcommand === "add") {
            const eventTxt = interaction.options.getString("event");
            const categoryInput = interaction.options.getString("category");
            if (!eventTxt || !playerCount || !categoryInput) return await _EphToastDefer(interaction, "Required input not received.");

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
            const gameEvents: GameEvents = {
                added_by: interaction.user.id,
                id: eventsId,
                categoryName: categoryInput as CategoryNames,
                event: eventTxt,
                tributes_involved: playerCount,
                suggestion,
                votes: 0
            };

            if (fatalEvents.includes(categoryInput)) {
                client.fatalValues.set(messageId, { action: "adding", gameEvents });
                return await interaction.followUp({ embeds: [eventsActionEmbed(interaction, "adding", gameEvents, suggestion)], components: [stringSelectRowKilled, stringSelectRowKillers, buttonBuilderRowAction] });
            }
            await addEvent(interaction, guild_id, gameEvents);
        } else if (subcommand === "edit") {
            const eventId = interaction.options.getInteger("suggestion-id");
            const eventTxt = interaction.options.getString("event");
            const categoryInput = interaction.options.getString("category");

            if (!eventId || (categoryInput && !categories.includes(categoryInput as CategoryNames))) return await _EphToastDefer(interaction, "Required input not received.");

            const event = events.find(event => event.id === eventId);
            if (!event) return await _EphToastDefer(interaction, "Suggestion not found.");

            if (event.suggestion && event.added_by !== interaction.user.id) {
                // check required permissions
                const isAdmin = await userPermissions(interaction, [
                    PermissionsBitField.Flags.ManageGuild
                ], [
                    "ManageGuild"
                ], "deferred");

                if (!isAdmin) return;
            }

            const fatalEvent = fatalEvents.includes(event.categoryName);

            const gameEvents = {
                ...event,
                event: eventTxt ?? event.event ?? "Unkown",
                category: categoryInput ?? event.categoryName ?? "Bloodbath Events",
                tributes_involved: event.tributes_involved ?? playerCount,
                killed: event.killed ?? [],
                killers: event.killers ?? [],
            };

            const playerOptions: StringSelectMenuOptionBuilder[] = [];

            for (let i = 1; i < (gameEvents.tributes_involved ?? playerCount) + 1; i++) playerOptions.push(
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
                return await interaction.followUp({
                    embeds: [eventsActionEmbed(interaction, "editing", gameEvents, suggestion)],
                    components: [stringSelectRowKilled, stringSelectRowKillers, buttonBuilderRowAction],
                    withResponse: true
                });
            }

            await editEvent(interaction, guild_id, categoryInput, eventId, eventTxt, playerCount, suggestion);

        } else if (subcommand === "remove") {
            const eventId = interaction.options.getInteger("suggestion-id");
            if (!eventId) return await _EphToastDefer(interaction, "Required input not received.");

            const event = events.find(event => event.id === eventId);
            if (!event) return await interaction.followUp("Suggestion not found!");

            if (event.suggestion && event.added_by !== interaction.user.id) {
                // check required permissions
                const isAdmin = await userPermissions(interaction, [
                    PermissionsBitField.Flags.ManageGuild
                ], [
                    "ManageGuild"
                ], "deferred");

                if (!isAdmin) return;
            }

            const newEvents = events.filter(event => event.id !== eventId);
            updated = true;
            await interaction.client.db.update(server_data).set({ suggestions: newEvents }).where(eq(server_data.guild_id, guild_id));
            await interaction.followUp("Successfully removed the suggestion!");
        } else if (subcommand === "clear") {
            // check required permissions
            const isAdmin = await userPermissions(interaction, [
                PermissionsBitField.Flags.ManageGuild
            ], [
                "ManageGuild"
            ], "deferred");
            if (!isAdmin) return;
            const categoryInput = interaction.options.getString("category");
            if (categoryInput && !categories.includes(categoryInput as CategoryNames)) return await _EphToastDefer(interaction, "Required input not received.");

            let changedCategory: ChangedCategory = "all";
            let newEvents: GameEvents[];
            if (categoryInput) {
                changedCategory = categoryInput as ChangedCategory;
                newEvents = events.filter(event => categoryInput !== event.categoryName);
            } else newEvents = [];

            await interaction.client.db.update(server_data).set({ suggestions: newEvents }).where(eq(server_data.guild_id, guild_id));
            await interaction.followUp(`Successfully cleared the suggestions of ${changedCategory === "all" ? "" : "the "}${changedCategory} ${changedCategory === "all" ? "the " : ""}categor${changedCategory === "all" ? "ies" : "y"}!`);
        }
    }
} satisfies MyInteractions;
