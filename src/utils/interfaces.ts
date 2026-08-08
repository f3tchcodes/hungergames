import { Client, type ClientEvents, type Interaction, Message, type SlashCommandOptionsOnlyBuilder, type SlashCommandSubcommandsOnlyBuilder } from "discord.js";

// for interactions
export interface MyInteractions {
    data: SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (client: Client, interaction: Interaction, args: string[]) => Promise<unknown>;
}

// for prefix commands
export interface MyPrefixCommands {
    name: string;
    execute: (client: Client, message: Message, args: string[]) => Promise<unknown>;
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

// for player districts and list in db
export interface PlayersDistricts {
    player_id: number;
    district_id?: number;
    district_position?: number;
    user_id: string;
    username: string;
    profile_pic_url: string;
    gender: string;
    real: boolean;
    alive: boolean;
}

// for building canvas list
export interface TributesReg {
    player_id: number;
    username: string;
    profile_pic_url: string;
    gender: string;
}

export interface TributeList {
    player_id: number;
    username: string;
    profile_pic_url: string;
    district_id: number;
    district_position: number;
    alive: boolean;
    real: boolean;
}

// for building canvas gameplay
export interface GameplaySections {
    profile_pic_url: string[];
    message: string;
}

export interface CompleteGameplay {
    title: string;
    sections: GameplaySections[];
}
