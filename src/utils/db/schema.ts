import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
    guild_id: text().primaryKey(),
    channel_id: text(),
    session_id: text(),
    tribute_size: integer(),
    district_size: integer()
});

export const districts = sqliteTable("districts", {
    guild_id: text().primaryKey(),
    player_id: integer(),
    district_id: integer(),
    user_id: text(),
    username: text(),
    profile_pic_url: text(),
    gender: text()
});
