
import config from "#utils/config";

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

    if (!session_id) return console.error("Session cookie could not be f3tched.");

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
