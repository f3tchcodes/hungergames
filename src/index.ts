import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

client.once("clientReady", (client) => {
    console.log(`${client.user.tag} is alive!`);
});

client.login(process.env.BOT_TOKEN);
