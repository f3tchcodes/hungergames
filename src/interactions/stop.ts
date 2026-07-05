import { InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";

import { games } from "#utils/db/schema";
import type { MyInteractions } from "#utils/interfaces";

// building the command
const stop = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop a hosted game.")
    .setContexts(
        InteractionContextType.Guild
    );

export default {
    data: stop,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        // get guild and id and check whether it's available
        const guild_id = interaction.guildId;

        if (guild_id === null) return await interaction.reply({
            content: "Failed to f3tch the guild ID.",
            flags: MessageFlags.Ephemeral
        });

        // check whether a game is hosted or not
        const qResSel = await client.db.select().from(games).where(eq(games.guild_id, guild_id));

        if (qResSel.length === 0) return await interaction.reply({
            content: "No available game to stop.\nYou may host a new game with `/host <channelID>` anytime.",
            flags: MessageFlags.Ephemeral
        });

        // stop the game
        await client.db.delete(games).where(eq(games.guild_id, guild_id));
        return await interaction.reply({
            content: "The game has been successfully stopped.\nYou may host a new game with `/host <channelID>` anytime."
        });
    }
} satisfies MyInteractions;
