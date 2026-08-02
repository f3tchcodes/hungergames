import { SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import _ from "lodash";

import { showGamplay } from "#utils/canvas";
import { _EphToastDefer, getGamesTable } from "#utils/common";
import { games } from "#utils/db/schema";
import type { MyInteractions } from "#utils/interfaces";

const next = new SlashCommandBuilder()
    .setName("next")
    .setDescription("Proceed to the next page!");

export default {
    data: next,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;
        await interaction.deferReply();

        // f3tch the guild id
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToastDefer(interaction, "Failed to f3tch guild ID");

        // f3tch the games table
        const qGames = await getGamesTable(interaction, guild_id);
        if (!qGames[0]) return await _EphToastDefer(interaction, "No available game to start.\nYou may host a new game with `/host` anytime.");
        if (interaction.channelId !== qGames[0].channel_id) return await _EphToastDefer(interaction, `Wrong channel! Start the game in the correct channel: <#${qGames[0].channel_id}>`);

        // check whether games data exist or not
        const game_data = qGames[0].game_data;
        if (!game_data) return await _EphToastDefer(interaction, "You must start a game before running this command!");

        // check page and section, get gameplay for it, then increment by one
        let game_page = qGames[0].game_page;
        let section_page = qGames[0].section_page;

        // find out the maximum pages
        const chunk = 5;
        const max_game_pages = game_data.length;
        const max_section_pages = _.chunk(game_data[game_page]?.sections, chunk).length;

        // show game and increment after each section passes by
        const image = await showGamplay(game_data, game_page, section_page, chunk);

        const page_title = game_data[game_page]?.title;
        if (!page_title) return _EphToastDefer(interaction, "Page title not found. Run the command again!");
        await interaction.followUp({ content: page_title, files: [image] });

        if (game_page === max_game_pages - 1) {
            // finish the game
        } else if (section_page === max_section_pages - 1) {
            game_page++;
            section_page = 0;
            console.log(`game_page set to ${game_page}`);
        }

        section_page++;
        console.log(`section_page set to ${section_page}`);
        await client.db.update(games).set({ game_page, section_page }).where(eq(games.guild_id, guild_id));
    }
} satisfies MyInteractions;
