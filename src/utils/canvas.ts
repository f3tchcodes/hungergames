import { Canvas, grayscale, loadImage, textWrap } from "canvas-constructor/cairo";

import config from "#utils/config";
import type {
    GameplaySections,
    TributeList
} from "#utils/interfaces";


export async function showTributeList(tribute_list: TributeList[], rows: number, alive_status: boolean) {
    const background = await loadImage("./assets/status_bg.png");
    const canvas = new Canvas(1000, 1000).printImage(background, 0, 0, 1000, 1000);

    await buildTributeList(canvas, tribute_list, rows, alive_status);

    return canvas.png();
}

// don't ask me anything in this code i literally have no fucking idea how i managed to write this
// and yes contributing in this part of the code is going to suck for you have fun :3
export async function buildTributeList(canvas: Canvas, tribute_list: TributeList[], rows: number, alive_status: boolean) {
    canvas.setTextAlign("center");

    const total_districts = 12;
    const tribute_size = tribute_list.length;
    const district_size = Math.floor(tribute_size / total_districts);
    const heading_columns = total_districts / rows;
    const pfp_columns = district_size * 2;

    let heading_row = -1;
    for (let i = 0; i < total_districts; i++) {
        const column = i % heading_columns;
        if (column > heading_columns - 1) heading_row = 0;
        if (column === 0) heading_row++;

        const district_number = i + 1;

        const heading_width = (column * canvas.width / heading_columns) + ((canvas.width / 2) / heading_columns);
        const heading_height = (heading_row * (canvas.height - (canvas.height * 0.10)) / rows) + ((canvas.height / 2) / rows);

        canvas.setColor(config.CANVAS_TEXT_COLOR).setTextFont("25px").printText(`DISTRICT ${district_number}`, heading_width, heading_height);
    }

    for (let i = 0; i < tribute_list.length; i++) {
        const player = tribute_list[i];
        if (!player) return console.error(`Player does not exist: ${i}`);
        const player_id = player.player_id - 1;

        const column = player_id % pfp_columns;
        const row = Math.floor(player_id / pfp_columns);
        // (i * (112.5 * district_size) / district.length) + heading_width - (110 + (45 * (district_size - 2)));
        const pfp_width = (column * canvas.width / ((district_size * 2) + 0.5)) + ((canvas.width / 2) / (2 * district_size));
        const pfp_height = (row * (canvas.height - (canvas.height * 0.10)) / rows) + ((canvas.height / 2) / rows) + 10;
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
            const text_width = username_width;
            const text_height = username_height + 15;
            let text = "Alive";
            let text_color = config.CANVAS_ALIVE_COLOR;
            if (!alive) { text = "Dead"; text_color = config.CANVAS_DEAD_COLOR; }
            canvas.setColor(text_color).setTextFont("13px").printText(text, text_width, text_height);
        }
    }
}

export async function showGamplay(gameplay_section: GameplaySections[], grayscale_toggle: boolean) {
    const background = await loadImage("./assets/list_bg.png");
    const canvas = new Canvas(500, 1000).printImage(background, 0, 0, 500, 1000);
    await buildGameplay(canvas, gameplay_section, grayscale_toggle);

    return canvas.png();
}

export async function buildGameplay(canvas: Canvas, gameplay_section: GameplaySections[], grayscale_toggle: boolean) {
    canvas.setTextFont("20px").setColor(config.CANVAS_TEXT_COLOR);

    const chunk_length = gameplay_section.length;

    // generate profile pictures
    for (let i = 0; i < chunk_length; i++) {
        const row = i; // effects the height
        const current_section = gameplay_section[i];
        if (!current_section) return console.error(`absolute current section ${i} does not exist`);

        const pfp_size_width = 80;
        const pfp_size_height = 80;
        const pfp_arr = current_section.profile_pic_url;
        const base_height = (row * 950 / chunk_length) + (200 / chunk_length);

        const pfp_length = pfp_arr.length;
        for (let j = 0; j < pfp_length; j++) {
            const pfp_width = (j * 430 / pfp_length) + ((250 - (pfp_size_width / 2)) / pfp_length);

            const current_pfp = pfp_arr[j];
            if (!current_pfp) return console.error(`pfp ${j}  on gameplay_section ${gameplay_section} not found`);

            const pfp = await loadImage(current_pfp);
            const run_grayscale = grayscale_toggle ? grayscale(canvas.printImage(pfp, pfp_width, base_height, pfp_size_width, pfp_size_height)) : canvas.printImage(pfp, pfp_width, base_height, pfp_size_width, pfp_size_height);
        }

        // generate text
        // the plan is to break text with new line characters on canvas overflow
        // get all the names separately that are wrapped with ** so we can control their colors
        // create a clean line without ** and get its measurements, this will be used for pasting in all the chunks of texts with correct size
        // create chunks of text separated by names regex and add new line character(s) at the start of every chunked text
        // for consistent line breaks in each part of the text
        // start printing string from the chunked array starting from a starting value width,
        // increment that width with the measurement of the string we put for continuing with the next string at the correct width
        const text = current_section.message;
        const text_height = base_height + pfp_size_height + 30;
        let nl_char_count = 0;

        // text breaks on canvas overflow
        const names_regex = new RegExp(/(\*\*[^\*\* ].+?\*\*)/g);
        const text_whole_name = text.split(names_regex).map(text => { if (text.match(names_regex)) { return text.replaceAll(" ", "ㅤ"); } else return text; }).join("");
        textWrap(canvas, text_whole_name, canvas.width - 50)
            .split(/(?=\n)/g)
            .forEach((line: string) => {
                // get names wrapped in ** separately
                let names = line.match(names_regex)?.map(name => name.replaceAll("**", "\\*\\*").replaceAll("ㅤ", " ")) ?? ["(?=\n)"];

                // clean line for measurements
                let clean_line = line;
                names.forEach(name => clean_line = line.replaceAll(name.replaceAll("\\", ""), name.replaceAll("\\*", "")));
                const clean_line_width = canvas.measureText(clean_line).width;

                // split line by name to manage names color separately
                let line_split = line.split(names_regex);

                // add new line character to every chunk every time a line breaks, increment number of line break characters if line breaks more than once
                const new_line_first_index = line.match("\n");
                if (new_line_first_index) {
                    const first_index = line_split[0];
                    if (!first_index) return console.error(`first index of line split ${line_split} does not exist`);
                    nl_char_count += 1;
                    let nl_char = "";
                    for (let j = 0; j < nl_char_count; j++) nl_char += "\n";
                    line_split = line_split.map(line_chunk => nl_char + line_chunk.replaceAll("\n", ""));
                    names = names.map(name => nl_char + name);
                }

                // print text, increment line width with the text's width, use that width to print the next text
                // if the text matches names_regex, it means it's a name and should be printed in a different color
                let name_index = 0;
                let line_width = (canvas.width - clean_line_width) / 2;
                line_split.forEach(line_chunk => {
                    if (line_chunk.match(names_regex)) {
                        const name = names[name_index];
                        if (!name) return console.error(`Damn bro name doesn't exist ${name_index}`);
                        canvas.setColor(config.CANVAS_NAME_COLOR).printMultilineText(name.replaceAll("\\*", ""), line_width, text_height).setColor(config.CANVAS_TEXT_COLOR);
                        line_width += canvas.measureText(name.replaceAll("\\*", "")).width;
                        name_index++;
                    } else {
                        canvas.printMultilineText(line_chunk, line_width, text_height);
                        line_width += canvas.measureText(line_chunk).width;
                    }
                });
            });
    }
}
