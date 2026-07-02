import { Client, type ClientEvents, type Interaction, SlashCommandBuilder } from "discord.js";

// for interactions
export interface MyInteractions {
    data: SlashCommandBuilder;
    execute: (interaction: Interaction, args: string[]) => Promise<unknown>;
}

// for events
export interface MyEvents<EventName extends keyof ClientEvents = keyof ClientEvents> {
    name: EventName;
    execute: (client: Client, ...args: ClientEvents[EventName]) => Promise<void>;
}
