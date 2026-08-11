const config = {
    BASE_URL: "https://brantsteele.com/",
    DISCLAIMER: "https://brantsteele.com/disclaimer.php",
    PRIVACY_POLICY: "https://brantsteele.com/privacypolicy.php",
    ICON_URL: "https://brantsteele.com/extras/hungergames/01/logo.png",
    THEME_COLOR: 0xDC6219, // discord embeds, they don't accept string colors
    CANVAS_TEXT_COLOR: "#FFFFFF", // for canvas, it only accepts string colors
    CANVAS_ALIVE_COLOR: "#98fb98",
    CANVAS_DEAD_COLOR: "#000000",
    CANVAS_NAME_COLOR: "#F68200",
    TRIBUTE_SIZE: [
        { name: "Default (24)", value: 24 },
        { name: "Medium (36)", value: 36 },
        { name: "Large (48)", value: 48 }
    ],
    DISTRICT_SIZE: {
        default: ["2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2"],
        medium: ["3", "3", "3", "3", "3", "3", "3", "3", "3", "3", "3", "3"],
        large: ["4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4", "4"]
    },
    BOT_OWNER_USERID: "1016388460929626174"
};

export default {
    BASE_URL: config.BASE_URL.endsWith("/") ? config.BASE_URL.slice(0, -1) : config.BASE_URL,
    DISCLAIMER: config.DISCLAIMER,
    PRIVACY_POLICY: config.PRIVACY_POLICY,
    ICON_URL: config.ICON_URL,
    THEME_COLOR: config.THEME_COLOR,
    CANVAS_TEXT_COLOR: config.CANVAS_TEXT_COLOR,
    CANVAS_ALIVE_COLOR: config.CANVAS_ALIVE_COLOR,
    CANVAS_DEAD_COLOR: config.CANVAS_DEAD_COLOR,
    CANVAS_NAME_COLOR: config.CANVAS_NAME_COLOR,
    TRIBUTE_SIZE: config.TRIBUTE_SIZE,
    DISTRICT_SIZE: config.DISTRICT_SIZE,
    BOT_OWNER_USERID: config.BOT_OWNER_USERID
};
