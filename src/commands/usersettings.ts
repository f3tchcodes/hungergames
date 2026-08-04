
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { and, eq } from "drizzle-orm";

import { _EphToast } from "#utils/common";
import config from "#utils/config";
import { districts } from "#utils/db/schema";
import type { MyInteractions } from "#utils/interfaces";

const host = new SlashCommandBuilder()
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
    data: host,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        const guild_id = interaction.guildId ?? "unknown";
        const user_id = interaction.user.id;
        const user_exists = await client.db.select().from(districts).where(and(eq(districts.guild_id, guild_id), eq(districts.user_id, user_id)));
        if (!user_exists || !user_exists[0]) return await _EphToast(interaction, "Please register in a game before changing your settings!");

        const displayname = interaction.user.displayName;
        const current_pfp = interaction.user.displayAvatarURL();
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "gender") {
            const gender = interaction.options.getString("gender") ?? "?";
            await client.db.update(districts).set({ gender }).where(and(eq(districts.guild_id, guild_id), eq(districts.user_id, user_id)));
            await _EphToast(interaction, `Successfully set your game gender to \`${gender}\`.\n-# Note: Changes will take effect from the next game if the current game hasn't been started.`);
        } else if (subcommand === "name") {
            const username = interaction.options.getString("name") ?? displayname;
            await client.db.update(districts).set({ username }).where(and(eq(districts.guild_id, guild_id), eq(districts.user_id, user_id)));
            await _EphToast(interaction, `Successfully set your game name to \`${username}\`.\n-# Note: Changes will take effect from the next game if the current game hasn't been started.`);
        } else if (subcommand === "list") {
            const user = user_exists[0];

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
                    { name: "District ID: ", value: district_id.toString() },
                    { name: "District position: ", value: district_position.toString() }
                ])
                .setThumbnail(profile_pic_url)
                .setFooter({ text: `Requested by ${displayname}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
} satisfies MyInteractions;
