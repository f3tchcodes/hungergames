import type { Canvas } from "canvas-constructor/napi-rs";
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

// for building canvas list
export interface PlayerslistInfo {
    username: string;
    player_id: number;
    profile_pic_url: string;
    district_id: number;
    district_position: number;
    real: boolean;
}

export interface ListCanvasGenerateInfo {
    playerslistInfoChunks: PlayerslistInfo[][];

    page: number;
    district_size: number;
    tribute_size: number;
    includedefaultplayers: boolean | undefined;
}

export interface BuildListDistrictsData {
    canvas: Canvas;
    district_size: number;
    page: number;
    tribute_size: number;
}

export interface BuildListUserData extends BuildListDistrictsData {
    playerslistInfoChunks: PlayerslistInfo[][];
}

export interface PaginatedDistricts {
    district_name: string;
    width: number;
    height: number;
}

export interface PaginatedUsers {
    real: boolean;
    user: {
        username: string;
        width: number;
        height: number;
    };
    profile: {
        profile_pic_url: string;
        position_width: number;
        position_height: number;
        size_width: number;
        size_height: number;
    };
}

export interface TributesReg {
    player_id: number;
    username: string;
    profile_pic_url: string;
    gender: string;
}

export interface TributeList {
    username: string;
    profile_pic_url: string;
    district_id: number;
    district_position: number;
    alive: boolean;
    real: boolean;
}
