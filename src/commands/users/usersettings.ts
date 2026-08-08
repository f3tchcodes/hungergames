
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { _EphToast, readPlayer, updatePlayer } from "#utils/common";
import config from "#utils/config";
import type { MyInteractions } from "#utils/interfaces";

const usersettings = new SlashCommandBuilder()
    .setName("usersettings")
    .setDescription("Edit your settings.")
    .addSubcommand(subcommand =>
        subcommand
            .setName("gender")
            .setDescription("Set your gender.")
            .addStringOption(op =>
                op
                    .setName("gender")
                    .addChoices(
                        { name: "Male", value: "M" },
                        { name: "Female", value: "F" },
                        { name: "Other", value: "?" }
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
        const user_id = interaction.user.id;
        const user = await readPlayer(interaction, guild_id, user_id);
        if (!user) return await _EphToast(interaction, "Please register in a game before changing your settings!");

        const displayname = interaction.user.displayName;
        const current_pfp = interaction.user.displayAvatarURL();
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "gender") {
            user.gender = interaction.options.getString("gender") ?? "?";
            await _EphToast(interaction, `Successfully set your game gender to \`${user.gender}\`.\n-# Note: Changes will take effect from the next game if the current game hasn't been started.`);
        } else if (subcommand === "name") {
            user.username = interaction.options.getString("name") ?? displayname;
            await _EphToast(interaction, `Successfully set your game name to \`${user.username}\`.\n-# Note: Changes will take effect from the next game if the current game hasn't been started.`);
        } else if (subcommand === "list") {
            const name = user.username;
            const gender = user.gender;
            const profile_pic_url = user.profile_pic_url;
            const district_id = user.district_id;
            const district_position = user.district_position;

            const embed = new EmbedBuilder()
                .setAuthor({ name: displayname, iconURL: current_pfp })
                .setColor(config.THEME_COLOR)
                .setTitle("Settings")
                .setFields([
                    { name: "Gamename: ", value: name },
                    { name: "Gender: ", value: gender },
                    { name: "Profile picture: ", value: profile_pic_url },
                    { name: "District ID: ", value: (district_id ?? "Unknown").toString() },
                    { name: "District position: ", value: (district_position ?? "Unknown").toString() }
                ])
                .setThumbnail(profile_pic_url)
                .setFooter({ text: `Requested by ${displayname}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        await updatePlayer(interaction, guild_id, user);
    }
} satisfies MyInteractions;
