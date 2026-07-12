import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js";
import { eq } from "drizzle-orm";
import _ from "lodash";

import { buildListCanvas } from "#utils/canvas";
import { _EphToast } from "#utils/common";
import { games } from "#utils/db/schema";
import type { ListCanvasGenerateInfo, MyInteractions, RegisterPlayer } from "#utils/interfaces";
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
        const district_size = qResSel[0]?.district_size;
        const tribute_size = qResSel[0]?.tribute_size;
        if (qResSel.length === 0 || !district_size || !tribute_size) return await _EphToast(interaction, "No available game.\nYou may host a new game with `/host` anytime.");

        const listOp = interaction.options.getSubcommand();

        if (listOp === "list") {
            // get options
            let includedefaultplayers = interaction.options.getBoolean("include-default-players");
            if (!includedefaultplayers) includedefaultplayers = false;

            // get players list
            const playerslist = await getPlayerslist(interaction);
            if (!playerslist) return;

            // split the players list in chunks for paginated messages
            let chunk_size = 12;
            if (district_size === 3) chunk_size = 9;
            const playerslistChunks = _.chunk(playerslist, chunk_size);
            if (!playerslistChunks) return await _EphToast(interaction, "Players list chunks not available!");

            // creating forward and backward buttons
            const backwardButton = new ButtonBuilder().setCustomId("backward").setLabel("<-").setStyle(ButtonStyle.Secondary);
            const forwardButton = new ButtonBuilder().setCustomId("forward").setLabel("->").setStyle(ButtonStyle.Secondary);

            const buttonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backwardButton, forwardButton);

            // canvas info for generating the canvas
            const listCanvasGenerateInfo: ListCanvasGenerateInfo = {
                playerslistInfoChunks: playerslistChunks,
                page: 0,
                district_size,
                tribute_size,
                includedefaultplayers
            };

            const image = await buildListCanvas(listCanvasGenerateInfo);
            if (!image) return await _EphToast(interaction, "Image could not be generated!");

            if (playerslist.length > 9) {
                const response = await interaction.deferReply({ withResponse: true });
                await interaction.followUp({ files: [image], components: [buttonsRow] });

                // get message id and set it in current page to change each page
                // independently rather than globally changing the variable
                const messageId = response.resource?.message?.id;
                if (!messageId) return await _EphToast(interaction, "Not able to f3tch message ID, forward and backward arrows might not work.");
                client.current_page.set(messageId, 0);
                client.includedefaultplayers.set(messageId, includedefaultplayers);

                return;
            } else {
                await interaction.deferReply();
                return await interaction.followUp({ files: [image] });
            }
        } else if (listOp === "register") {
            // get user, district id, and district position options
            const target_user_id = interaction.options.getUser("user");
            const district_id = interaction.options.getInteger("district-id");
            const district_position = interaction.options.getInteger("district-position");

            if (district_id || district_position) {
                if (!district_id || !district_position) return await _EphToast(interaction, "You must provide both district ID and district position to register a user into a specific position!");
            }

            const registerPlayerObject: RegisterPlayer = {
                interaction: interaction,
                guild_id: interaction.guildId,
                user_id: target_user_id?.id,
                username: target_user_id?.displayName,
                profile_pic_url: target_user_id?.displayAvatarURL(),

                district_id,
                district_position
            };

            const register = await registerPlayer(registerPlayerObject);
            if (!register) return;

            return await _EphToast(interaction, `Successfully registered **${register.username}** to The Hunger Games.\nUse \`/mysettings gender\` to set your gender.`);
        } else {
            return await _EphToast(interaction, "Incorrect subcommand.");
        }
    }
} satisfies MyInteractions;
