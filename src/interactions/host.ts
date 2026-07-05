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
    .addNumberOption(op =>
        op
            .setName("tribute-size")
            .setDescription("Enter the amount of players.")
            .addChoices(config.TRIBUTES_SIZE)
    )
    .setContexts(
        InteractionContextType.Guild
    );

// when the command is executed
export default {
    data: host,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;
        let session_id;
        let district_size;
        let tribute_size = interaction.options.getNumber("tribute-size");

        // get guild and id and check whether it's available
        const guild_id = interaction.guildId;

        if (!guild_id) return interaction.reply({
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
            content: `Game already hosted in the channel <#${qRes[0]?.channel_id}> !\nUse \`/stop\` to stop the current game and host a new one.`,
            flags: MessageFlags.Ephemeral
        });

        // f3tching the session cookie that we'll save
        // and use to send request to every endpoint
        const res = await fetch(`${config.BASE_URL}/hungergames/agree.php`);
        res.headers.forEach(async (header) => {
            if (!header.startsWith("PHPSESSID")) return;

            const cRegex = /PHPSESSID=.*;/g;
            const cookieArr = header.match(cRegex);

            if (!cookieArr) return interaction.reply({
                content: "Error occured while f3tching the session cookie. Contact dev to fix.\nUsername: f3tch",
                flags: MessageFlags.Ephemeral
            });

            session_id = cookieArr[0].replace("PHPSESSID=", "").slice(0, -1);
        });

        // setting tribute size
        if (!config.TRIBUTES_SIZE[0]) return console.error("Tribute size configuration not set.");
        if (!tribute_size) tribute_size = config.TRIBUTES_SIZE[0]?.value;
        const tributesOptions: number[] = [];
        config.TRIBUTES_SIZE.forEach(v => tributesOptions.push(v.value));
        if (!tributesOptions.includes(tribute_size)) return interaction.reply({
            content: "Incorrect tribute size settings",
            flags: MessageFlags.Ephemeral
        });

        // setting district size
        switch (tribute_size) {
            case config.TRIBUTES_SIZE[1]?.value:
                district_size = config.DISTRICT_SIZE.medium;
                break;
            case config.TRIBUTES_SIZE[2]?.value:
                district_size = config.DISTRICT_SIZE.large;
                break;
            default:
                district_size = config.DISTRICT_SIZE.default;
        }
        console.log(district_size);

        await fetch(`${config.BASE_URL}/hungergames/ChangeTributes-${tribute_size}.php`);

        await client.db.insert(games).values({
            guild_id,
            channel_id,
            session_id,
            tribute_size,
            district_size
        });

        return interaction.reply({
            content: `The game has been scheduled to be hosted in the channel <#${channel_id}>\nStart the game by heading over to the channel and running \`/start\`.`
        });
    }
} satisfies MyInteractions;
