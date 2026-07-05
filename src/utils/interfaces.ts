import { Client, type ClientEvents, type Interaction, type SlashCommandOptionsOnlyBuilder } from "discord.js";

// for interactions
export interface MyInteractions {
    data: SlashCommandOptionsOnlyBuilder;
    execute: (client: Client, interaction: Interaction, args: string[]) => Promise<unknown>;
}

// for events: need separate for interaction as interaction
// does not have client passed in as the first argument
export interface MyEvents<EventName extends keyof ClientEvents = keyof ClientEvents> {
    name: EventName;
    execute?: (client: Client, ...args: ClientEvents[EventName]) => Promise<void>;
    executeInteraction?: (client: Client, interaction: Interaction, ...args: string[]) => Promise<unknown>;
}
