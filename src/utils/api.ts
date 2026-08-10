
import { parse } from "node-html-parser";

import { replaceLastOccurrence } from "#utils/common";
import config from "#utils/config";
import type { CompleteGameplay, GameplaySections, PlayersDistricts } from "#utils/interfaces";

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
    const body = `FormCode=6&DistrictNumber=12&NumberPerDistrict=${tribute_size}&District1=${tribute_size}&District2=${tribute_size}&District3=${tribute_size}&District4=${tribute_size}&District5=${tribute_size}&District6=${tribute_size}&District7=${tribute_size}&District8=${tribute_size}&District9=${tribute_size}&District10=${tribute_size}&District11=${tribute_size}&District12=${tribute_size}`;
    const res = await fetch(`${config.BASE_URL}/hungergames/classic/AdjustSize-Submit.php`, { method: "POST", headers: { Cookie: `PHPSESSID=${session_id}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
    if (!res.ok) return console.error("Failed to set tribute size!");
    return true;
}

export async function setTributes(session_id: string, districts: PlayersDistricts[][]) {
    let district_id = 0;
    let body_data = "";
    districts.forEach(district => {
        district_id++;
        body_data += `\nDistrict ${district_id}\n#FFFFFF 0 0\n\n`;
        district.forEach(player => {
            body_data += `${player.username}\n${player.username}\n${player.gender === "M" ? 0 : 1}\n${player.profile_pic_url}\nBW\n\n`;
        });
    });

    const body = `The Hunger Games\nhttps://cdn.brantsteele.com/extras/hungergames/01/logo.png\n\n${body_data}`.trim();
    const blob = new Blob([body], { type: "text/plain" });
    const formData = new FormData();
    formData.append("fileToUpload", blob, "cast.txt");
    formData.append("submit", "Import Cast from a Text File");
    const res = await fetch(`${config.BASE_URL}/hungergames/classic/ImportCast.php`, { method: "POST", headers: { Cookie: `PHPSESSID=${session_id}` }, body: formData });
    if (!res.ok) return console.error("Failed to set tribute members!");
    return true;
}

export async function readGameplay(session_id: string) {
    // bloodbath is the first step, after that we simply take the proceed url from the response
    // unlock the next page and send the request, store it, and keep repeating until the end
    const complete_gameplay: CompleteGameplay[] = [];
    let proceed: string = "winner.php";
    const unlock_bloodbath = await fetch(`${config.BASE_URL}/hungergames/classic/ProceedStart.php`, { headers: { Cookie: `PHPSESSID=${session_id}` } });
    if (!unlock_bloodbath.ok) return console.error("Bloodbath not unlocked");
    let res = await fetch(`${config.BASE_URL}/hungergames/classic/bloodbath.php`, { headers: { Cookie: `PHPSESSID=${session_id}` } });
    if (!res.ok) return console.error("Response not ok bloodbath");

    do {
        const html = await res.text();
        if (html.includes("I am 13 years or older. I have read and understand these terms.")) return console.error("session has expired.");
        const root = parse(html);
        const title = (root.querySelector(".PageName")?.textContent ?? "Unkown").replaceAll("\r\n", "").trim();
        const div = root.querySelector(".MiddleBarContent");
        div?.getElementsByTagName("strong").forEach(player => player.insertAdjacentHTML("afterbegin", "**").insertAdjacentHTML("beforeend", "**"));
        div?.getElementsByTagName("a").forEach(a => { if (a.textContent.includes("Proceed")) proceed = a?.attributes.href ?? "winner.php"; });
        const text: string[] = [];
        const blacklist: string[] = ["", "See everyone's status.", "Proceed."];
        const fallen = title.includes("Fallen");
        const split = fallen ? "\n\n" : "\n\n\n";
        div?.textContent.split(split).forEach(content => {
            let reliable_content = content.replaceAll("\n", "").replaceAll("Proceed.", "").replaceAll("\r", "").trim();
            if (blacklist.includes(reliable_content)) return;
            if (reliable_content.includes("District") && fallen) { reliable_content = replaceLastOccurrence(content, "District", "District"); }
            if (reliable_content === "") return;
            text.push(reliable_content);
        });
        const pfp: string[][] = [];
        const tables = div?.querySelectorAll(".DivTable");

        tables?.forEach(table => {
            const current_pfp: string[] = [];
            table?.getElementsByTagName("img").forEach(img => {
                if (!img.attributes.src) return console.error(`${img.attributes.src} img src does not exist`);
                current_pfp.push(img.attributes.src);
            });
            if (current_pfp.length === 0) return;
            pfp.push(current_pfp);
        });

        const diff = text.length - pfp.length;
        if (diff !== 0) { for (let i = 0; i < Math.abs(diff); i++) { const larger = text.length > pfp.length ? pfp.unshift([]) : text.unshift(""); } }

        const gameplay_sections: GameplaySections[] = [];
        for (let i = 0; i < text.length; i++) gameplay_sections.push({ profile_pic_url: pfp[i] ?? ["Unkown"], message: text[i] ?? "Unknown" });

        complete_gameplay.push({ title, sections: gameplay_sections });
        res = await fetch(`${config.BASE_URL}/hungergames/classic/${proceed}`, { headers: { Cookie: `PHPSESSID=${session_id}` } });
    } while (!proceed.includes("placements"));

    return complete_gameplay;
}
