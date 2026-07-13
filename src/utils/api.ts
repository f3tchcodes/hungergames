
import config from "#utils/config";

import type { TributesReg } from "./interfaces.js";

export async function createSessionId() {
    let session_id: string | undefined;

    // f3tching the session cookie that we'll save
    // and use to send request to every endpoint
    const res = await fetch(`${config.BASE_URL}/hungergames/agree.php`);
    res.headers.forEach(async header => {
        if (!header.startsWith("PHPSESSID")) return;

        const cRegex = /PHPSESSID=.*;/g;
        const cookieArr = header.match(cRegex);
        if (!cookieArr) return console.error("Session cookie match did not work.");

        session_id = cookieArr[0].replace("PHPSESSID=", "").slice(0, -1);
    });

    if (!res.ok || !session_id) return console.error("Failed to f3tch session cookie!");
    return session_id;
}

export async function setTributeSize(session_id: string, tribute_size: number) {
    const res = await fetch(`${config.BASE_URL}/hungergames/ChangeTributes-${tribute_size}.php`, { headers: { Cookie: `PHPSESSID=${session_id}` } });
    if (!res.ok) return console.error("Failed to set tribute size!");
    return true;
}

export async function setTributes(session_id: string, tribute_size: number, tributes_reg: TributesReg[]) {
    const registeration_list: string[] = [];

    tributes_reg.forEach(player => {
        const pad = "00";
        const id = pad.substring(0, pad.length - (player.player_id).toString().length) + (player.player_id).toString();
        const body_data_partial = `cusTribute${id}=${player.username}&cusTribute${id}img=${player.profile_pic_url}&cusTribute${id}gender=${player.gender}&cusTribute${id}custom=000&cusTribute${id}nickname=${player.username}&cusTribute${id}imgBW=BW&`;
        registeration_list.push(body_data_partial);
    });

    const body_data = `seasonname=Hunger+Games&logourl=https://brantsteele.com/extras/hungergames/01/logo.png&existinglogo=00&${registeration_list.join("")}ChangeAll=028`;
    const res = await fetch(`${config.BASE_URL}/hungergames/personalize-${tribute_size}.php`, { method: "POST", headers: { Cookie: `PHPSESSID=${session_id}` }, body: body_data });
    if (!res.ok) return console.error("Failed to set tribute members!");
    console.log(body_data);
    return true;
}
