
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import config from "#config/config";
import { _EphToast, getGamesTable, readPlayer, updatePlayer } from "#utils/common";
import type { MyInteractions } from "#utils/interfaces";

const usersettings = new SlashCommandBuilder()
    .setName("usersettings")
    .setDescription("Edit your settings.")
    .addSubcommand(subcommand =>
        subcommand
            .setName("gender")
            .setDescription("Set your gender.")
            .addIntegerOption(op =>
                op
                    .setName("gender")
                    .addChoices(
                        { name: "Male", value: 0 },
                        { name: "Female", value: 1 },
                        { name: "Other", value: 2 }
                    )
                    .setDescription("The gender that will be used in the gameplay.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("name")
            .setDescription("Set your name.")
            .addStringOption(op =>
                op
                    .setName("name")
                    .setDescription("The name that will be used in the gameplay.")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("list")
            .setDescription("List your game settings.")
    );

export default {
    data: usersettings,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        const guild_id = interaction.guildId ?? "unknown";
        const qGames = await getGamesTable(interaction, guild_id);
        if (!qGames[0]) return await _EphToast(interaction, "No available game.\nYou may change user settings after registering in a game!");

        const user_id = interaction.user.id;
        const user = await readPlayer(interaction, guild_id, user_id);
        if (!user) return await _EphToast(interaction, "Please register in a game before changing your settings!");

        const displayname = interaction.user.displayName;
        const current_pfp = interaction.user.displayAvatarURL();
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "gender") {
            user.user.gender = interaction.options.getInteger("gender") ?? 0;
            let genderString: string;
            switch (user.user.gender) {
                case 0: genderString = "male"; break;
                case 1: genderString = "female"; break;
                default: genderString = "they/them"; break;
            }
            await _EphToast(interaction, `Successfully set your game gender to \`${genderString}\`.\n-# Note: Changes will take effect from the next game if the current game hasn't been started.`);
        } else if (subcommand === "name") {
            user.user.username = interaction.options.getString("name") ?? displayname;
            await _EphToast(interaction, `Successfully set your game name to \`${user.user.username}\`.\n-# Note: Changes will take effect from the next game if the current game hasn't been started.`);
        } else if (subcommand === "list") {
            const name = user.user.username;
            const gender = user.user.gender;
            const profile_pic_url = user.user.profile_pic_url;
            const district_id = user.district_id;
            const district_position = user.district_position;
            let genderString: string;
            switch (gender) {
                case 0: genderString = "He/Him"; break;
                case 1: genderString = "She/Her"; break;
                default: genderString = "They/Them"; break;
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: displayname, iconURL: current_pfp })
                .setColor(config.THEME_COLOR)
                .setTitle("Settings")
                .setFields([
                    { name: "Gamename: ", value: name },
                    { name: "Gender: ", value: genderString },
                    { name: "Profile picture: ", value: profile_pic_url },
                    { name: "District ID: ", value: (district_id ?? "Unknown").toString() },
                    { name: "District position: ", value: (district_position ?? "Unknown").toString() }
                ])
                .setThumbnail(profile_pic_url)
                .setFooter({ text: `Requested by ${displayname}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        await updatePlayer(interaction, guild_id, qGames[0].district_size, user.user);
    }
} satisfies MyInteractions;
