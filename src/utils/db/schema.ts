import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { DEFAULT_EVENTS } from "#config/events";
import type { CompleteGameplay, GameEventsCategorized, PlayersDistricts } from "#utils/interfaces";

export const games = sqliteTable("games", {
    guild_id: text().primaryKey(),
    channel_id: text().notNull(),
    session_id: text(),
    tribute_size: integer().notNull(),
    district_size: text({ mode: "json" }).$type<string[]>().notNull(),
    districts_data: text({ mode: "json" }).$type<PlayersDistricts[][]>(),
    registered_players: integer().notNull().default(0),
    game_page: integer().notNull().default(0),
    section_page: integer().notNull().default(0),
    game_data: text({ mode: "json" }).$type<CompleteGameplay[]>(),
    game_started: integer().notNull().default(0),
    restarting: integer().notNull().default(0)
});

export const server_data = sqliteTable("server_data", {
    guild_id: text().primaryKey(),
    guild_name: text().default("Unkown").notNull(),
    guild_owner: text().default("Unkown").notNull(),
    events: text({ mode: "json" }).$type<GameEventsCategorized[]>().default(DEFAULT_EVENTS).notNull()
});
