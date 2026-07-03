import "dotenv/config";

import { Client, GatewayIntentBits } from "discord.js";
import type { EmptyRelations } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import loadEvents from "#handlers/loadEvents";
import loadInteractions from "#handlers/loadInteractions";
import { db } from "#utils/db/db";
import type { MyInteractions } from "#utils/interfaces";

// augmenting @discord.js
declare module "discord.js" {
    interface Client {
        interactions: Map<string, MyInteractions>;
        db: BetterSQLite3Database<EmptyRelations>;
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
client.db = db;

// updating and loading interaction commands, and loading events
await loadInteractions(client);
await loadEvents(client);

// login to the bot
client.login(process.env.BOT_TOKEN);
