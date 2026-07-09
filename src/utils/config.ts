const config = {
    BASE_URL: "https://brantsteele.net/",
    DISCLAIMER: "https://brantsteele.com/disclaimer.php",
    PRIVACY_POLICY: "https://brantsteele.com/privacypolicy.php",
    ICON_URL: "https://brantsteele.com/extras/hungergames/01/logo.png",
    THEME_COLOR: 0xDC6219,
    REGISTERED_PLAYERS_LIST_PAGES_CHUNKS: 24,
    TRIBUTE_SIZE: [
        { name: "Default (24)", value: 24 },
        { name: "Medium (36)", value: 36 },
        { name: "Large (48)", value: 48 }
    ],
    DISTRICT_SIZE: {
        default: 2,
        medium: 3,
        large: 4
    },
    DEFAULT_PLAYERS: [
        {
            user_id: "default1",
            username: "Jory Cassel",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/jory.png",
            gender: "M"
        },
        {
            user_id: "default2",
            username: "Nym Sand",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/05/nym.png",
            gender: "F"
        },
        {
            user_id: "default3",
            username: "Ramsay Snow",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/03/ramsay.png",
            gender: "M"
        },
        {
            user_id: "default4",
            username: "Septa Mordane",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/septa.png",
            gender: "F"
        },
        {
            user_id: "default5",
            username: "Khal Drogo",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/khaldrogo.png",
            gender: "M"
        },
        {
            user_id: "default6",
            username: "Margaery Tyrel",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/02/margaery.png",
            gender: "F"
        },
        {
            user_id: "default7",
            username: "Podrick Payne",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/02/podrick.png",
            gender: "M"
        },
        {
            user_id: "default8",
            username: "Ros",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/ros.png",
            gender: "F"
        },
        {
            user_id: "default9",
            username: "Izembaro",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/06/izembaro.png",
            gender: "M"
        },
        {
            user_id: "default10",
            username: "Daenerys Targaryen",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/daenerys.png",
            gender: "F"
        },
        {
            user_id: "default11",
            username: "The Night King",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/04/nightking.png",
            gender: "M"
        },
        {
            user_id: "default12",
            username: "Meera Reed",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/03/meera.png",
            gender: "F"
        },
        {
            user_id: "default13",
            username: "Pyat Pree",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/02/pyat.png",
            gender: "M"
        },
        {
            user_id: "default14",
            username: "Obara Sand",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/05/obara.png",
            gender: "F"
        },
        {
            user_id: "default15",
            username: "Trystane Martell",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/05/trystane.png",
            gender: "M"
        },
        {
            user_id: "default16",
            username: "Tyene Sand",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/05/tyene.png",
            gender: "F"
        },
        {
            user_id: "default17",
            username: "Petyr Baelish",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/littlefinger.png",
            gender: "M"
        },
        {
            user_id: "default18",
            username: "Brienne of Tarth",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/02/brienne.png",
            gender: "F"
        },
        {
            user_id: "default19",
            username: "Rickon Stark",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/rickon.png",
            gender: "M"
        },
        {
            user_id: "default20",
            username: "Irri",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/irri.png",
            gender: "F"
        },
        {
            user_id: "default21",
            username: "Hodor",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/hodor.png",
            gender: "M"
        },
        {
            user_id: "default22",
            username: "High Priestess",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/06/highpriestess.png",
            gender: "F"
        },
        {
            user_id: "default23",
            username: "Jon Snow",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/jon.png",
            gender: "M"
        },
        {
            user_id: "default24",
            username: "Osha",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/osha.png",
            gender: "F"
        },
        {
            user_id: "default25",
            username: "Sandor Clegane",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/thehound.png",
            gender: "M"
        },
        {
            user_id: "default26",
            username: "Ellaria Sand",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/04/ellaria.png",
            gender: "F"
        },
        {
            user_id: "default27",
            username: "Thoros",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/03/thoros.png",
            gender: "M"
        },
        {
            user_id: "default28",
            username: "Lady Crane",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/06/ladycrane.png",
            gender: "F"
        },
        {
            user_id: "default29",
            username: "Olly",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/04/olly.png",
            gender: "M"
        },
        {
            user_id: "default30",
            username: "Myrcella Baratheon",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/myrcella.png",
            gender: "F"
        },
        {
            user_id: "default31",
            username: "Rodrik Cassel",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/rodrik.png",
            gender: "M"
        },
        {
            user_id: "default32",
            username: "Shae",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/shae.png",
            gender: "F"
        },
        {
            user_id: "default33",
            username: "Oberyn Martell",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/04/oberyn.png",
            gender: "M"
        },
        {
            user_id: "default34",
            username: "Arya Stark",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/arya.png",
            gender: "F"
        },
        {
            user_id: "default35",
            username: "Syrio Forel",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/syrio.png",
            gender: "M"
        },
        {
            user_id: "default36",
            username: "Melisandre",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/02/melisandre.png",
            gender: "F"
        },
        {
            user_id: "default37",
            username: "Bronn",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/bronn.png",
            gender: "M"
        },
        {
            user_id: "default38",
            username: "Talisa Stark",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/02/talisa.png",
            gender: "F"
        },
        {
            user_id: "default39",
            username: "Tormund",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/03/tormund.png",
            gender: "M"
        },
        {
            user_id: "default40",
            username: "Walda Bolton",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/04/walda.png",
            gender: "F"
        },
        {
            user_id: "default41",
            username: "Orell",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/03/orell.png",
            gender: "M"
        },
        {
            user_id: "default42",
            username: "Shireen Baratheon",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/03/shireen.png",
            gender: "F"
        },
        {
            user_id: "default43",
            username: "Robin Arryn",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/robin.png",
            gender: "M"
        },
        {
            user_id: "default44",
            username: "Yara Greyjoy",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/02/yara.png",
            gender: "F"
        },
        {
            user_id: "default45",
            username: "Areo Hotah",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/05/areo.png",
            gender: "M"
        },
        {
            user_id: "default46",
            username: "Catelyn Stark",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/catelyn.png",
            gender: "F"
        },
        {
            user_id: "default47",
            username: "Grenn",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/01/grenn.png",
            gender: "M"
        },
        {
            user_id: "default48",
            username: "Karsi",
            profile_pic_url: "https://cdn.brantsteele.com/images/gameofthrones/05/karsi.png",
            gender: "F"
        }
    ]
};

export default {
    BASE_URL: config.BASE_URL.endsWith("/") ? config.BASE_URL.slice(0, -1) : config.BASE_URL,
    DISCLAIMER: config.DISCLAIMER,
    PRIVACY_POLICY: config.PRIVACY_POLICY,
    ICON_URL: config.ICON_URL,
    THEME_COLOR: config.THEME_COLOR,
    REGISTERED_PLAYERS_LIST_PAGES_CHUNKS: config.REGISTERED_PLAYERS_LIST_PAGES_CHUNKS,
    TRIBUTE_SIZE: config.TRIBUTE_SIZE,
    DISTRICT_SIZE: config.DISTRICT_SIZE,
    DEFAULT_PLAYERS: config.DEFAULT_PLAYERS
};
