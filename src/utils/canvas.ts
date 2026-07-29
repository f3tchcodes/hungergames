import { Canvas, loadImage } from "canvas-constructor/napi-rs";
import _ from "lodash";

import config from "#utils/config";
import type {
    TributeList
} from "#utils/interfaces";


export async function showTributeList(tribute_list: TributeList[], rows: number, alive_status: boolean) {
    const background = await loadImage("./assets/status_bg.png");
    const canvas = new Canvas(1000, 1000).printImage(background, 0, 0, 1000, 1000);

    await buildTributeList(canvas, tribute_list, rows, alive_status);

    return canvas.png();
}

// don't ask me anything in this code i literally have no fucking idea how i managed to write this
// especially the long ass pfp_width down there don't even ask idk how i wrote that man took a few days
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
                let text = "Alive";
                let text_color = config.CANVAS_ALIVE_COLOR;
                if (!alive) {
                    text = "Dead";
                    text_color = config.CANVAS_DEAD_COLOR;
                }
                const text_width = username_width;
                const text_height = username_height + 15;
                canvas.setColor(text_color).setTextFont("13px").printText(text, text_width, text_height);
            }
        }
    }
}
