import { Client, type ClientEvents, type Interaction, type SlashCommandOptionsOnlyBuilder, type SlashCommandSubcommandsOnlyBuilder } from "discord.js";

// for interactions
export interface MyInteractions {
    data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (client: Client, interaction: Interaction, args: string[]) => Promise<unknown>;
}

// for events
export interface MyEvents<EventName extends keyof ClientEvents = keyof ClientEvents> {
    name: EventName;
    execute: (client: Client, ...args: ClientEvents[EventName]) => Promise<void>;
}

// for host command
export interface HostValues {
    channel_id: string | undefined;
    tribute_size: number | undefined;
}

// for registerations
export interface RegisterPlayer {
    interaction: Interaction,
    guild_id: string | undefined | null,
    user_id: string | undefined | null,
    username: string | undefined | null,
    profile_pic_url: string | undefined | null;

    district_id?: number | undefined | null;
    district_position?: number | undefined | null;
}
