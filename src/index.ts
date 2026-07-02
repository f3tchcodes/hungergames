import "dotenv/config";

import { Client, GatewayIntentBits } from "discord.js";

import loadEvents from "#handlers/loadEvents";
import loadInteractions from "#handlers/loadInteractions";
import type { MyInteractions } from "#utils/interfaces";

declare module "discord.js" {
    interface Client {
        interactions: Map<string, MyInteractions>;
    }
}

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

client.interactions = new Map();

// updating and loading interaction commands, and loading events
await loadInteractions(client);
await loadEvents(client);

// login to the bot
client.login(process.env.BOT_TOKEN);
