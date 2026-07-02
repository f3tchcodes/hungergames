import {
    type ChatInputCommandInteraction,
    InteractionContextType,
    SlashCommandBuilder,
} from "discord.js";

const host = new SlashCommandBuilder()
    .setName("host")
    .setDescription("Host a game!")
    .addStringOption(op =>
        op
            .setName("channel-id")
            .setDescription("Enter the ID of the channel where you'd like to host the game!")
            .setRequired(true)
    )
    .setContexts(
        InteractionContextType.Guild
    );

export default {
    data: host,
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply("wow man");
    }
};
