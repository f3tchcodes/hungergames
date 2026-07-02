import { type Interaction, SlashCommandBuilder } from "discord.js";

// for interactions
export interface MyInteractions {
    data: SlashCommandBuilder;
    execute: (interaction: Interaction, args: string[]) => Promise<unknown>;
}
