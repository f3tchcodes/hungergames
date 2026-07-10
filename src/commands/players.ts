import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import _ from "lodash";

import { _EphToast } from "#utils/common";
import config from "#utils/config";
import { games } from "#utils/db/schema";
import type { MyInteractions, RegisterPlayer } from "#utils/interfaces";
import { getPlayerslist } from "#utils/playerslist";
import { registerPlayer } from "#utils/register";

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
            .setDescription("Register users.")
            .addUserOption(op =>
                op
                    .setName("user")
                    .setDescription("Select user to register.")
                    .setRequired(true)
            )
            .addIntegerOption(op =>
                op
                    .setName("district-id")
                    .setDescription("Select user's district ID.")
            )
            .addIntegerOption(op =>
                op
                    .setName("district-position")
                    .setDescription("Select user's position in the district")
            )
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
        } else if (listOp === "register") {
            // get user, district id, and district position options
            const target_user_id = interaction.options.getUser("user");
            const district_id = interaction.options.getUser("district-id");
            const district_position = interaction.options.getUser("district-position");

            if (district_id) {
                if (!district_position) return await _EphToast(interaction, "Provide district position for the user!");
            }

            const registerPlayerObject: RegisterPlayer = {
                interaction: interaction,
                guild_id: interaction.guildId,
                user_id: target_user_id?.id,
                username: target_user_id?.displayName,
                profile_pic_url: target_user_id?.displayAvatarURL()
            };

            const register = await registerPlayer(registerPlayerObject);
            if (!register) return;

            return await _EphToast(interaction, `Successfully registered **${register.username}** to The Hunger Games.\nUse \`/mysettings gender\` to set your gender.`);
        } else {
            return await _EphToast(interaction, "Incorrect subcommand.");
        }
    }
} satisfies MyInteractions;
