import {
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";

import config from "#utils/constants";
import { games } from "#utils/db/schema";
import type { MyInteractions } from "#utils/interfaces";

// building the command
const host = new SlashCommandBuilder()
    .setName("host")
    .setDescription("Host a game!")
    .addStringOption(op =>
        op
            .setName("channel-id")
            .setDescription("Enter the ID of the channel where you'd like to host the game!")
            .setRequired(true)
    )
    .setContexts(
        InteractionContextType.Guild
    );

// when the command is executed
export default {
    data: host,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        const guild_id = interaction.guildId;
        const channel_id = interaction.options.getString("channel-id", true);

        if (guild_id === null) return interaction.reply({
            content: "Failed to f3tch the guild ID."
        });

        // f3tching the session cookie that we'll save
        // and use to send request to every endpoint
        const res = await fetch(`${config.BASE_URL}/hungergames/agree.php`);
        res.headers.forEach(async (header) => {
            if (header.startsWith("PHPSESSID")) {
                const cRegex = /PHPSESSID=.*;/g;
                const cookieArr = header.match(cRegex);
                if (cookieArr === null) return interaction.reply({
                    content: "Error occured while f3tching the session cookie. Contact dev to fix.\nUsername: f3tch",
                    flags: MessageFlags.Ephemeral
                });
                const session_id = cookieArr[0].replace("PHPSESSID=", "").slice(0, -1);
                await client.db.insert(games).values({
                    guild_id,
                    channel_id,
                    session_id
                });
            }
        });
    }
} satisfies MyInteractions;
