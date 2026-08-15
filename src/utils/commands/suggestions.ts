import type { RepliableInteraction } from "discord.js";
import { eq } from "drizzle-orm";

import { _EphToastDefer, getServerDataTable } from "#utils/common";
import { server_data } from "#utils/db/schema";
import type { GameEvents } from "#utils/interfaces";

export async function voteSuggestion(interaction: RepliableInteraction, events: GameEvents[], eventId: number, action: "upvote" | "downvote" | "withdrawvote") {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    if (!guildId) return await _EphToastDefer(interaction, "This command can only be used in a server!");

    const qServerData = await getServerDataTable(interaction, guildId);
    let votes = qServerData[0]?.suggestions_votes ?? [];
    const myEvent = events.find(event => event.id === eventId);
    if (!myEvent) return await _EphToastDefer(interaction, "Suggestion not found!");

    const userVote = votes.find(vote => vote.user_id === userId && vote.suggestion_id === eventId);

    if (userVote) {
        if (userVote.vote) {
            if (action === "downvote") {
                votes = votes.filter(vote => eventId !== vote.suggestion_id || userId !== vote.user_id);
                myEvent.votes -= 1;
            }
            if (action === "upvote") return await _EphToastDefer(interaction, `You have already upvoted event ${eventId}!`);
        }
        if (!userVote.vote) {
            if (action === "downvote") return await _EphToastDefer(interaction, `You have already downvoted event ${eventId}!`);
            if (action === "upvote") {
                votes = votes.filter(vote => eventId !== vote.suggestion_id || userId !== vote.user_id);
                myEvent.votes += 1;
            }
        }
    }

    if (action === "upvote") {
        myEvent.votes += 1;
        votes.push({
            suggestion_id: eventId,
            user_id: userId,
            vote: true
        });
        await interaction.followUp(`Successfully upvoted suggestion ${eventId}!`);
    }

    if (action === "downvote") {
        myEvent.votes -= 1;
        votes.push({
            suggestion_id: eventId,
            user_id: userId,
            vote: false
        });
        await interaction.followUp(`Successfully downvoted suggestion ${eventId}!`);
    }

    if (action === "withdrawvote") {
        if (userVote) {
            votes = votes.filter(vote => eventId !== vote.suggestion_id || userId !== vote.user_id);
            if (userVote.vote) myEvent.votes -= 1;
            else myEvent.votes += 1;
            await interaction.followUp(`Successfully withdrawn your vote for suggestion ${eventId}!`);
        } else {
            await interaction.followUp(`Wait... You haven't voted suggestion ${eventId} in the first place!!`);
        }
    }

    const newEvents = events.map(event => event.id === myEvent.id ? myEvent : event);
    await interaction.client.db.update(server_data).set({ suggestions_votes: votes, suggestions: newEvents }).where(eq(server_data.guild_id, guildId));
}
