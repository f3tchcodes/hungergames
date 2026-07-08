CREATE TABLE `districts` (
	`guild_id` text PRIMARY KEY,
	`player_id` integer,
	`district_id` integer,
	`user_id` text,
	`username` text,
	`profile_pic_url` text,
	`gender` text
);
--> statement-breakpoint
ALTER TABLE `games` ADD `district_size` integer;