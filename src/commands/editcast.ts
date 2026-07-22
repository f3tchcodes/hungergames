import { SlashCommandBuilder } from "discord.js";

import { _EphToast, _EphToastDefer, getGamesTable } from "#utils/common";
import type { MyInteractions, RegisterPlayer } from "#utils/interfaces";
import { registerPlayer } from "#utils/register";

const players = new SlashCommandBuilder()
    .setName("editcast")
    .setDescription("Edit players in the current game.")
    .addSubcommand(list =>
        list
            .setName("swap")
            .setDescription("Swap current registered players.")
            .addBooleanOption(op =>
                op
                    .setName("target-player-id")
                    .setDescription("Player ID of the player you want to move.")
                    .setRequired(true)
            )
            .addBooleanOption(op =>
                op
                    .setName("swap-player-id")
                    .setDescription("Player ID of the player you want to swap with.")
                    .setRequired(true)
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
        const response = await interaction.deferReply({ withResponse: true });

        // get guild and id and check whether it's available
        const guild_id = interaction.guildId;
        if (!guild_id) return await _EphToastDefer(interaction, "Failed to f3tch the guild ID.");

        // check whether a game is hosted or not
        const qGames = await getGamesTable(interaction, guild_id);
        if (!qGames || !qGames[0]) return await _EphToastDefer(interaction, "No available game.\nYou may host a new game with `/host` anytime.");

        const listOp = interaction.options.getSubcommand();

        if (listOp === "register") {
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
            return await _EphToast(interaction, "Unknown subcommand.");
        }
    }
} satisfies MyInteractions;
