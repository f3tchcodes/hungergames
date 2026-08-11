PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_games` (
	`guild_id` text PRIMARY KEY,
	`channel_id` text NOT NULL,
	`session_id` text,
	`tribute_size` integer NOT NULL,
	`district_size` text NOT NULL,
	`districts_data` text,
	`registered_players` integer DEFAULT 0 NOT NULL,
	`game_page` integer DEFAULT 0 NOT NULL,
	`section_page` integer DEFAULT 0 NOT NULL,
	`game_data` text,
	`game_started` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_games`(`guild_id`, `channel_id`, `session_id`, `tribute_size`, `district_size`, `districts_data`, `registered_players`, `game_page`, `section_page`, `game_data`, `game_started`) SELECT `guild_id`, `channel_id`, `session_id`, `tribute_size`, `district_size`, `districts_data`, `registered_players`, `game_page`, `section_page`, `game_data`, `game_started` FROM `games`;--> statement-breakpoint
DROP TABLE `games`;--> statement-breakpoint
ALTER TABLE `__new_games` RENAME TO `games`;--> statement-breakpoint
PRAGMA foreign_keys=ON;