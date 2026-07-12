import { type ChatInputCommandInteraction } from "discord.js";

import { _EphToast } from "#utils/common";
import config from "#utils/config";

export async function createSessionId(interaction: ChatInputCommandInteraction) {
    let session_id: string | undefined;

    // f3tching the session cookie that we'll save
    // and use to send request to every endpoint
    const res = await fetch(`${config.BASE_URL}/hungergames/agree.php`);
    res.headers.forEach(async header => {
        if (!header.startsWith("PHPSESSID")) return;

        const cRegex = /PHPSESSID=.*;/g;
        const cookieArr = header.match(cRegex);
        if (!cookieArr) return await _EphToast(interaction, "Error occured while f3tching the session cookie. Contact dev to fix.\nUsername: f3tch");

        session_id = cookieArr[0].replace("PHPSESSID=", "").slice(0, -1);
    });

    if (!session_id) return await _EphToast(interaction, "Session ID for starting the game could not be f3tched. Contact dev to fix.\nUsername: f3tch");

    return session_id;
}

export async function setTributeSize(session_id: string, tribute_size: number) {
    const res = await fetch(`${config.BASE_URL}/hungergames/ChangeTributes-${tribute_size}.php`, {
        headers: {
            Cookies: `PHPSESSID=${session_id}`
        }
    });

    if (!res.ok) return console.error("Setting tribute size failed.");

    return;
}
