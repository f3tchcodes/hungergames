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
    interaction: Interaction;
    player_id?: number;
    guild_id: string | undefined | null;
    user_id: string | undefined | null;
    username: string | undefined | null;
    profile_pic_url: string | undefined | null;
}

// default players
export interface DefaultPlayers {
    user_id: string;
    username: string;
    profile_pic_url: string;
    gender: string;
}

// for player districts and list in db
export interface PlayersDistricts extends DefaultPlayers {
    player_id: number;
    real: boolean;
    alive: boolean;
}

// for readPlayer response
export interface ReadPlayerResponse {
    user: PlayersDistricts;
    district_id: number;
    district_position: number;
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

// for events
export interface GameEvents {
    id: number;
    event: string;
    tributes_involved: number;
    killer?: string[];
    killed?: string[];
}
export interface GameEventsCategorized {
    type: "bloodbath" | "day" | "night" | "feast" | "fatalBloodbath" | "fatalDay" | "fatalNight" | "fatalFeast";
    events: GameEvents[];
}
