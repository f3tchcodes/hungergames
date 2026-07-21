import { Canvas, loadImage } from "canvas-constructor/napi-rs";
import _ from "lodash";

import config from "#utils/config";
import type {
    BuildListDistrictsData,
    BuildListUserData,
    ListCanvasGenerateInfo,
    PaginatedDistricts,
    PaginatedUsers,
    PlayerslistInfo,
    TributeList
} from "#utils/interfaces";

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

export async function showTributeList(tribute_list: TributeList[], rows: number, alive_status: boolean) {
    const background = await loadImage("./assets/status_bg.png");
    const canvas = new Canvas(1000, 1000).printImage(background, 0, 0, 1000, 1000);

    await buildTributeList(canvas, tribute_list, rows, alive_status);

    return canvas.png();
}

export async function buildTributeList(canvas: Canvas, tribute_list: TributeList[], rows: number, alive_status: boolean) {
    canvas.setTextAlign("center");

    const total_districts = 12;
    const tribute_size = tribute_list.length;
    const district_size = tribute_size / total_districts;
    const columns = total_districts / rows;

    const district_tribute_list = _.chunk(tribute_list, district_size);

    let column = -1;
    for (let i = 0; i < total_districts; i++) {
        const row = i % rows;
        if (row > rows - 1) column = 0;
        if (row === 0) column++;

        const district_number = i + 1;

        const district = district_tribute_list[i];
        if (!district) return console.error(`District does not exist: ${i}`);

        const heading_width = (column * 1000 / columns) + (500 / columns);
        const heading_height = (row * 900 / rows) + (500 / rows);

        canvas.setColor(config.CANVAS_TEXT_COLOR).setTextFont("25px").printText(`DISTRICT ${district_number}`, heading_width, heading_height);

        for (let j = 0; j < district.length; j++) {
            const player = district[j];
            if (!player) return console.error(`Player does not exist: ${i}:${j}`);

            const pfp_width = (j * (112.5 * district_size) / district.length) + heading_width - (110 + (45 * (district_size - 2)));
            const pfp_height = heading_height + 10;
            const pfp_size_width = 80;
            const pfp_size_height = 80;
            const pfp = await loadImage(player.profile_pic_url);
            canvas.printImage(pfp, pfp_width, pfp_height, pfp_size_width, pfp_size_height);

            const username_width = pfp_width + 40;
            const username_height = pfp_height + pfp_size_height + 15;
            const username = player.username;
            canvas.setColor(config.CANVAS_TEXT_COLOR).setTextFont("13px").printText(username, username_width, username_height);

            if (alive_status) {
                const alive = player.alive;
                let alive_text = "Alive";
                let alive_color = config.CANVAS_ALIVE_COLOR;
                if (!alive) {
                    alive_text = "Dead";
                    alive_color = config.CANVAS_DEAD_COLOR;
                }
                const alive_width = username_width;
                const alive_height = username_height + 15;
                canvas.setColor(alive_color).setTextFont("13px").printText(alive_text, alive_width, alive_height);
            }
        }
    }
}
