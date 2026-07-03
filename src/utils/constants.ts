const config = {
    BASE_URL: "https://brantsteele.net/"
};

export default {
    BASE_URL: config.BASE_URL.endsWith("/") ? config.BASE_URL.slice(0, -1) : config.BASE_URL
};
