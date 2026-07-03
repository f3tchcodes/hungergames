import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
    guild_id: text().primaryKey(),
    channel_id: text(),
    session_id: text()
});
