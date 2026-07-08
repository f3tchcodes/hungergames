import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
    guild_id: text().primaryKey(),
    channel_id: text().notNull(),
    session_id: text(),
    tribute_size: integer().notNull(),
    district_size: integer().notNull(),
    registered_players: integer().notNull().default(0)
});

// by default we enter fake characters
export const districts = sqliteTable("districts", {
    id: integer().primaryKey({ autoIncrement: true }),
    guild_id: text(),
    player_id: integer().notNull(),
    district_id: integer().notNull(),
    user_id: text().notNull(),
    username: text().notNull(),
    profile_pic_url: text().notNull(),
    gender: text().notNull(),
    real: integer().default(0) // there is no boolean in sqlite, so we're using integer 0 for false and 1 for true
});
