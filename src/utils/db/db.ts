import { drizzle } from "drizzle-orm/better-sqlite3";

const { DB_FILE_NAME } = process.env;

if (!DB_FILE_NAME) {
    console.error("Database name not given in environment file!");
    process.exit(1);
}

export const db = drizzle(DB_FILE_NAME);
