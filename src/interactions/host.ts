import {
    type ChatInputCommandInteraction,
    InteractionContextType,
    SlashCommandBuilder,
} from "discord.js";

const hostSetup = new SlashCommandBuilder()
    .setName("host")
    .setDescription("Host a game!")
    .addStringOption(op =>
        op
            .setName("channel-id")
            .setDescription("Enter the ID of the channel where you'd like to host the game!")
            .setRequired(true)
    )
    .setContexts(
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
        InteractionContextType.Guild
    );

const host = {
    data: hostSetup,
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.reply("wow man");
    }
};

export default host;
