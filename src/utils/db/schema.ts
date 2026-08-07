import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { CompleteGameplay, PlayersDistricts } from "#utils/interfaces";

export const games = sqliteTable("games", {
    guild_id: text().primaryKey(),
    channel_id: text().notNull(),
    session_id: text(),
    tribute_size: integer().notNull(),
    district_size: integer().notNull(),
    districts_data: text({ mode: "json" }).$type<PlayersDistricts[]>(),
    registered_players: integer().notNull().default(0),
    game_page: integer().notNull().default(0),
    section_page: integer().notNull().default(0),
    game_data: text({ mode: "json" }).$type<CompleteGameplay[]>(),
    game_started: integer().notNull().default(0)
});
