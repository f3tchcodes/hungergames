import {
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";

import config from "#utils/constants";
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

        // f3tching the session cookie that we'll save
        // and use to send request to every endpoint
        const res = await fetch(`${config.BASE_URL}/hungergames/agree.php`);
        res.headers.forEach(cookie => {
            if (cookie.startsWith("PHPSESSID")) {
                const cRegex = /PHPSESSID=.*;/g;
                const c = cookie.match(cRegex);
                if (c === null) return interaction.reply({
                    content: "Error occured while fetching the session cookie. Contact dev to fix.\nUsername: f3tch",
                    flags: MessageFlags.Ephemeral
                });
                const cVal = c[0].replace("PHPSESSID=", "").slice(0, -1);
                console.log(cVal);
            }
        });
    }
} satisfies MyInteractions;
