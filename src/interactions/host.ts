import {
    InteractionContextType,
    MessageFlags,
    SlashCommandBuilder
} from "discord.js";
import { eq } from "drizzle-orm";
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

        // get guild and id and check whether it's available
        const guild_id = interaction.guildId;

        if (guild_id === null) return interaction.reply({
            content: "Failed to f3tch the guild ID.",
            flags: MessageFlags.Ephemeral
        });

        // get channel id, check whether it's correct or not
        // then check whether or not the it's a text channel
        const channel_id = interaction.options.getString("channel-id", true);
        const channel_exists = interaction.guild?.channels.cache.get(channel_id);

        if (!channel_exists) return interaction.reply({
            content: "Incorrect channel ID, please try again!",
            flags: MessageFlags.Ephemeral
        });

        if (!channel_exists.isTextBased() || channel_exists.isVoiceBased()) return interaction.reply({
            content: "Incorrect channel type, make sure to provide a text channel!",
            flags: MessageFlags.Ephemeral
        });

        // check if a game is already hosted
        const qRes = await client.db.select().from(games).where(eq(games.guild_id, guild_id));
        if (qRes.length > 0) return interaction.reply({
            content: "Game already hosted!\nUse `/stop` to stop the current game and host a new one.",
            flags: MessageFlags.Ephemeral
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

                return interaction.reply({
                    content: `The game has been scheduled to be hosted in the channel <#${channel_id}>\nStart the game by heading over to the channel and running \`/start\`.`
                });
            }
        });
    }
} satisfies MyInteractions;
