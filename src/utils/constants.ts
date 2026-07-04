const config = {
    BASE_URL: "https://brantsteele.net/",
    TRIBUTES_SIZE: [
        { name: "24", value: 24 },
        { name: "36", value: 36 },
        { name: "48", value: 48 }
    ]
};

export default {
    BASE_URL: config.BASE_URL.endsWith("/") ? config.BASE_URL.slice(0, -1) : config.BASE_URL,
    TRIBUTES_SIZE: config.TRIBUTES_SIZE
};
