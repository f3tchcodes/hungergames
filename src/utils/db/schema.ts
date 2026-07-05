import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
    guild_id: text().primaryKey(),
    channel_id: text(),
    session_id: text(),
    tribute_size: integer(),
    district_size: integer()
});

export const districts = sqliteTable("districts", {
    player_id: integer().primaryKey({ autoIncrement: true }),
    guild_id: text(),
    district_id: integer(),
    user_id: text(),
    username: text(),
    profile_pic_url: text(),
    gender: text()
});