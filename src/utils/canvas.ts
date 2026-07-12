import { Canvas, loadImage } from "canvas-constructor/napi-rs";
import _ from "lodash";

import config from "#utils/config";
import type { BuildListDistrictsData, BuildListUserData, ListCanvasGenerateInfo, PaginatedDistricts, PaginatedUsers, PlayerslistInfo } from "#utils/interfaces";

// PUTTING TOGETHER THE LIST
export async function buildListCanvas(canvas_info: ListCanvasGenerateInfo) {
    const { district_size, tribute_size, page, playerslistInfoChunks } = canvas_info;

    const background = await loadImage("./assets/listBg.png");
    const canvas = new Canvas(500, 720).printImage(background, 0, 0, 500, 720);

    // GENERATING DISTRICT TEXT
    const buildListDistrictsData: BuildListDistrictsData = {
        canvas,
        district_size,
        page,
        tribute_size
    };

    buildListDistrictRows(buildListDistrictsData);

    // GENERATING USER PFP AND USERNAME
    const buildListUserData: BuildListUserData = {
        playerslistInfoChunks,
        ...buildListDistrictsData
    };

    await buildListUserRows(buildListUserData);

    // RETURNING THE LIST
    return canvas.pngAsync();
}

// BUILDING DISTRICTS TEXT
function buildListDistrictRows(districts_data: BuildListDistrictsData) {
    const { canvas, district_size, page, tribute_size } = districts_data;

    let districts_per_page = 3;
    let districts_columns_per_page = 1;
    if (district_size === 2) {
        districts_columns_per_page = 2;
        districts_per_page = 6;
    }

    canvas
        .setColor(config.CANVAS_TEXT_COLOR)
        .setTextFont("25px bold")
        .setTextAlign("center");

    const district_amount = tribute_size / district_size;
    const paginated_districts: PaginatedDistricts[] = [];

    let row_index = -1;

    for (let i = 0; i < district_amount; i++) {
        const column_index = i % districts_columns_per_page;
        if (column_index === 0) row_index++;
        if (row_index > 3 - 1) row_index = 0;

        const current_district = i + 1;
        const width = (column_index * 250) + (250 / districts_columns_per_page);
        const height = (row_index * 210) + 80;

        const district_name = `DISTRICT ${current_district}`;

        paginated_districts.push({
            district_name,
            width,
            height
        });
    }

    const paginated_districts_chunks: PaginatedDistricts[][] = _.chunk(paginated_districts, districts_per_page);
    if (!paginated_districts_chunks[page]) return console.error("page does not exist.");

    paginated_districts_chunks[page].forEach(text_info => {
        canvas.printText(
            text_info.district_name,
            text_info.width,
            text_info.height
        );
    });

    return canvas;
}

// BUILDING USER PROFILE PICTURE AND USERNAMES
async function buildListUserRows(user_data: BuildListUserData) {
    const { canvas, playerslistInfoChunks, district_size, page, tribute_size } = user_data;

    let users_per_page = 12;
    let user_columns_per_page = 4;
    let size_const = 1;
    if (district_size === 3) {
        user_columns_per_page = 3;
        users_per_page = 9;
        size_const = 1;
    }

    canvas
        .setColor(config.CANVAS_TEXT_COLOR)
        .setTextFont("16px bold")
        .setTextAlign("center");

    const paginated_users: PaginatedUsers[] = [];

    let row = -1;

    for (let i = 0; i < tribute_size; i++) {
        const column_index = i % user_columns_per_page;
        if (column_index === 0) row++;
        if (row > 2) row = 0;

        const playerlist: PlayerslistInfo[] = [];
        if (!playerlist) return console.error("Player list does not exist.");

        playerslistInfoChunks.forEach(page => {
            page.forEach(player => playerlist.push(player));
        });

        const index = i;
        const player = playerlist[index];
        if (!player) return console.error(`Player does not exist man: ${index}`);

        let margin = 35;
        if (user_columns_per_page === 4) margin = 12.5;

        const position_width = (column_index * (500 / user_columns_per_page)) + margin;
        const position_height = (row * 210) + 105;

        const size_width = 100 * size_const;
        const size_height = 100 * size_const;

        let username = player.username.trim();
        const profile_pic_url = player.profile_pic_url;

        if (username.length > 15) {
            username = username.split("").slice(0, 14).join("") + "...";
        }

        paginated_users.push({
            real: player.real,
            user: {
                username,
                width: position_width + 50,
                height: position_height + 130
            },
            profile: {
                profile_pic_url,
                position_width,
                position_height,
                size_width,
                size_height,
            }
        });
    }

    console.log(paginated_users);

    const paginated_users_chunks = _.chunk(paginated_users, users_per_page);
    const current_page = paginated_users_chunks[page];
    if (!current_page) return console.error("current_page does not exist");

    const promises = current_page.map(async user => {
        const image = await loadImage(user.profile.profile_pic_url);
        canvas.printImage(
            image,
            user.profile.position_width,
            user.profile.position_height,
            user.profile.size_width,
            user.profile.size_height
        );
        canvas.printText(
            user.user.username,
            user.user.width,
            user.user.height
        );
    });

    await Promise.all(promises);
}
