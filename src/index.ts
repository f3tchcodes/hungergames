import "dotenv/config";

import { Client, GatewayIntentBits } from "discord.js";

import loadInteractions from "#handlers/loadInteractions";

// augmenting @discord.js
declare module "discord.js" {
    interface Client {
        interactions: Map<string, Interaction>;
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

// loading the interactions
client.interactions = new Map();
await loadInteractions(client);

// are you ready?
client.once("clientReady", client => {
    console.log(`${client.user.tag} is alive!`);
});

// login to the bot
client.login(process.env.BOT_TOKEN);
