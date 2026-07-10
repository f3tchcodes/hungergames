import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import _ from "lodash";

import { _EphToast } from "#utils/common";
import config from "#utils/config";
import { games } from "#utils/db/schema";
import type { MyInteractions } from "#utils/interfaces";
import { getPlayerslist } from "#utils/playerslist";

const players = new SlashCommandBuilder()
    .setName("players")
    .setDescription("Registered players in the current game.")
    .addSubcommand(list =>
        list
            .setName("list")
            .setDescription("List of current registered players.")
            .addBooleanOption(op =>
                op
                    .setName("include-default-players")
                    .setDescription("Include default players in registered list.")
            )
    )
    .addSubcommand(register =>
        register
            .setName("register")
            .setDescription("List of current registered players.")
    );

export default {
    data: players,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        // get guild and id and check whether it's available
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToast(interaction, "Failed to f3tch the guild ID.");

        // check whether a game is hosted or not
        const qResSel = await client.db.select().from(games).where(eq(games.guild_id, guild_id));
        if (qResSel.length === 0) return await _EphToast(interaction, "No available game.\nYou may host a new game with `/host` anytime.");

        const listOp = interaction.options.getSubcommand();

        if (listOp === "list") {
            // get options
            let includedefaultplayers = interaction.options.getBoolean("include-default-players");
            if (!includedefaultplayers) includedefaultplayers = false;

            // get players list
            const playerslist = await getPlayerslist(interaction, includedefaultplayers);
            if (!playerslist) return;

            // split the players list in chunks because discord
            // does not allow more fields than 25 in each embed
            const playerslistChunks = _.chunk(playerslist, config.REGISTERED_PLAYERS_LIST_PAGES_CHUNKS);
            if (!playerslistChunks[0]) return;

            // creating forward and backward buttons
            const backwardButton = new ButtonBuilder().setCustomId("backward").setLabel("<-").setStyle(ButtonStyle.Secondary);
            const forwardButton = new ButtonBuilder().setCustomId("forward").setLabel("->").setStyle(ButtonStyle.Secondary);

            const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardButton, forwardButton);

            // build players list embed
            const playersListEmbed = new EmbedBuilder()
                .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
                .setColor(config.THEME_COLOR)
                .setTitle("List of registered players: ")
                .setFields(playerslistChunks[0])
                .setFooter({ text: "Page 1" })
                .setTimestamp();

            if (playerslist.length > 24) {
                const response = await interaction.reply({ embeds: [playersListEmbed], components: [buttonsRow], withResponse: true });

                // get message id and set it in current page to change each page
                // independently rather than globally changing the variable
                const messageId = response.resource?.message?.id;
                if (!messageId) return await _EphToast(interaction, "Not able to f3tch message ID, forward and backward arrows might not work.");
                client.current_page.set(messageId, 0);
                client.includedefaultplayers.set(messageId, includedefaultplayers);

                return;
            } else {
                return await interaction.reply({ embeds: [playersListEmbed] });
            }
        }
    }
} satisfies MyInteractions;
