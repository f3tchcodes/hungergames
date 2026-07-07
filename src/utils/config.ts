const config = {
    BASE_URL: "https://brantsteele.net/",
    ICON_URL: "https://brantsteele.com/extras/hungergames/01/logo.png",
    THEME_COLOR: 0xDC6219,
    TRIBUTE_SIZE: [
        { name: "Default (24)", value: 24 },
        { name: "Medium (36)", value: 36 },
        { name: "Large (48)", value: 48 }
    ],
    DISTRICT_SIZE: {
        default: 2,
        medium: 3,
        large: 4
    }
};

export default {
    BASE_URL: config.BASE_URL.endsWith("/") ? config.BASE_URL.slice(0, -1) : config.BASE_URL,
    ICON_URL: config.ICON_URL,
    THEME_COLOR: config.THEME_COLOR,
    TRIBUTE_SIZE: config.TRIBUTE_SIZE,
    DISTRICT_SIZE: config.DISTRICT_SIZE
};
