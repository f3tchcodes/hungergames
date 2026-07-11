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

    canvas
        .setColor(config.CANVAS_TEXT_COLOR)
        .setTextFont("25px bold")
        .setTextAlign("center");

    const district_amount = tribute_size / district_size;
    const paginated_districts: PaginatedDistricts[] = [];

    for (let i = 0; i < district_amount; i++) {
        const current_district = i + 1;
        const column_index = i % 3;
        const width = 250;
        const height = (column_index * 210) + 80;

        const district_name = `DISTRICT ${current_district}`;
        paginated_districts.push({
            district_name,
            width,
            height
        });
    }

    const paginated_districts_chunks: PaginatedDistricts[][] = _.chunk(paginated_districts, 3);
    if (!paginated_districts_chunks[page]) return console.error("page does not exist.");

    paginated_districts_chunks[page].forEach(text_info => {
        canvas.printText(text_info.district_name, text_info.width, text_info.height);
    });

    return canvas;
}

// BUILDING USER PROFILE PICTURE AND USERNAMES
async function buildListUserRows(user_data: BuildListUserData) {
    const { canvas, playerslistInfoChunks, district_size, page, tribute_size } = user_data;

    canvas
        .setColor(config.CANVAS_TEXT_COLOR)
        .setTextFont("16px bold")
        .setTextAlign("center");

    const paginated_users: PaginatedUsers[] = [];

    let row = -1;

    for (let i = 0; i < tribute_size; i++) {
        const column_index = i % 3;
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

        const height = (row * 210) + 105;
        const width = (column_index * 150) + 50;

        paginated_users.push({
            real: player.real,
            user: {
                username: player.username,
                width: width + 50,
                height: height + 130
            },
            profile: {
                profile_pic_url: player.profile_pic_url,
                position_width: width,
                position_height: height,
                size_width: 100,
                size_height: 100
            }
        });
    }

    const paginated_users_chunks = _.chunk(paginated_users, 9);
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
