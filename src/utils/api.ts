
import { parse } from "node-html-parser";

import config from "#utils/config";

import type { CompleteGameplay, GameplaySections, TributesReg } from "./interfaces.js";

export async function createSessionId() {
    let session_id: string | undefined;

    // f3tching the session cookie that we'll save
    // and use to send request to every endpoint
    const res = await fetch(`${config.BASE_URL}/hungergames/`);
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

export async function agreeToDisclaimer(session_id: string) {
    const res = await fetch(`${config.BASE_URL}/hungergames/agree.php`, { headers: { Cookie: `PHPSESSID=${session_id}` } });
    if (!res) return console.error("Failed to agree to the disclaimer.");
    return true;
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
        const body_data = `cusTribute${id}=${player.username}&cusTribute${id}img=${player.profile_pic_url}&cusTribute${id}gender=${player.gender}&cusTribute${id}custom=000&cusTribute${id}nickname=${player.username}&cusTribute${id}imgBW=BW&`;
        registeration_list.push(body_data);
    });

    const body = `seasonname=Hunger+Games&logourl=https://brantsteele.com/extras/hungergames/01/logo.png&existinglogo=00&${registeration_list.join("")}ChangeAll=028`;
    const res = await fetch(`${config.BASE_URL}/hungergames/personalize-${tribute_size}.php`, { method: "POST", headers: { Cookie: `PHPSESSID=${session_id}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
    if (!res.ok) return console.error("Failed to set tribute members!");
    return true;
}

export async function readGameplay(session_id: string) {
    // bloodbath is the first step, after that we simply take the proceed url from the response
    // unlock the next page and send the request, store it, and keep repeating until the end
    const complete_gameplay: CompleteGameplay[] = [];
    let proceed: string = "winner.php";
    const unlock_bloodbath = await fetch(`${config.BASE_URL}/hungergames/ProceedStart.php?r=0`, { headers: { Cookie: `PHPSESSID=${session_id}` } });
    if (!unlock_bloodbath.ok) return console.error("Bloodbath not unlocked");
    let res = await fetch(`${config.BASE_URL}/hungergames/bloodbath.php`, { headers: { Cookie: `PHPSESSID=${session_id}` } });
    if (!res.ok) return console.error("Response not ok bloodbath");

    do {
        const html = await res.text();
        if (html.includes("I am 13 years or older. I have read and understand these terms.")) return console.error("session has expired.");
        const root = parse(html);
        const title = root.getElementById("titleHolder")?.textContent ?? "Unkown";
        const div = root.getElementById("content");
        div?.getElementsByTagName("strong").forEach(player => player.insertAdjacentHTML("afterbegin", "**").insertAdjacentHTML("beforeend", "**"));
        div?.getElementsByTagName("a").forEach(a => { if (a.textContent.includes("Proceed")) proceed = a?.attributes.href ?? "winner.php"; });
        const text: string[] = [];
        div?.textContent.split("\n\n\n").forEach(content => text.push(content.replaceAll("\n", "").replaceAll("Proceed.\r", "")));
        const pfp: string[][] = [];
        const tables = div?.getElementsByTagName("table");

        tables?.forEach(table => {
            const current_pfp: string[] = [];
            table?.getElementsByTagName("img").forEach(img => {
                if (!img.attributes.src) return console.error(`${img.attributes.src} img src does not exist`);
                current_pfp.push(img.attributes.src);
            });
            pfp.push(current_pfp);
        });

        const diff = text.length - pfp.length;
        if (diff !== 0) { for (let i = 0; i < Math.abs(diff); i++) { const larger = text.length > pfp.length ? pfp.unshift([]) : text.unshift(""); } }

        const gameplay_sections: GameplaySections[] = [];

        for (let i = 0; i < text.length; i++) gameplay_sections.push({ profile_pic_url: pfp[i] ?? ["Unkown"], message: text[i] ?? "Unknown" });

        complete_gameplay.push({ title, sections: gameplay_sections });
        res = await fetch(`${config.BASE_URL}/hungergames/${proceed}`, { headers: { Cookie: `PHPSESSID=${session_id}` } });
        console.log(`Working on ${title}`);
    } while (!proceed.includes("placements"));

    return complete_gameplay;
}
