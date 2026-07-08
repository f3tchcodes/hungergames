import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
    game_id: integer().primaryKey({ autoIncrement: true }),
    guild_id: text(),
    channel_id: text().notNull(),
    session_id: text(),
    tribute_size: integer().notNull(),
    district_size: integer().notNull()
});

export const districts = sqliteTable("districts", {
    game_id: integer().primaryKey({ autoIncrement: true }),
    guild_id: text(),
    player_id: integer().notNull(),
    district_id: integer().notNull(),
    user_id: text().notNull(),
    username: text().notNull(),
    profile_pic_url: text().notNull(),
    gender: text(),
    real: integer() // there is no boolean in sqlite, so we're using integer 0 for false and 1 for true
});
