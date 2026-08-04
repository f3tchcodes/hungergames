import "dotenv/config";

import { ActivityType, Client, GatewayIntentBits } from "discord.js";
import type { EmptyRelations } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import loadEvents from "#handlers/loadEvents";
import loadInteractions from "#handlers/loadInteractions";
import { db } from "#utils/db/db";
import type { HostValues, MyInteractions } from "#utils/interfaces";

// augmenting @discord.js
declare module "discord.js" {
    interface Client {
        db: BetterSQLite3Database<EmptyRelations>;
        interactions: Map<string, MyInteractions>;
        hostValues: Map<string, HostValues>;
        current_page: Map<string, number>;
        includedefaultplayers: Map<string, boolean | undefined>;
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
    ],
    presence: {
        status: "online",
        activities: [{
            type: ActivityType.Playing,
            name: "Hunger Games"
        }]
    }
});

client.db = db;
client.interactions = new Map();
client.hostValues = new Map();
client.current_page = new Map();
client.includedefaultplayers = new Map();

// updating and loading interaction commands, and loading events
await loadInteractions(client);
await loadEvents(client);

// login to the bot
client.login(process.env.BOT_TOKEN);
