import "dotenv/config";

import { Client, GatewayIntentBits } from "discord.js";

import loadEvents from "#handlers/loadEvents";
import loadInteractions from "#handlers/loadInteractions";

// initiating the client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

// updating interaction commands and loading events
await loadInteractions();
await loadEvents(client);

// login to the bot
client.login(process.env.BOT_TOKEN);
