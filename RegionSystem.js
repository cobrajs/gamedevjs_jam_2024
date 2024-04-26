const DEFAULT_REGION_PROPERTIES = {
    averageHeight: 1,

    // How level (angle = 0) and even (as close to center of flyer's x axis) are the notes
    leveled: 1,

    // How many different angles are there and how many stickers
    quirky: 1,

    // Are any of the stickers offensive?
    irreverence: 0.5,

    boring: 0.9,
    emphasis: 0.9,
    flair: 0.8,
    centered: 0.9
};

class Region {
    constructor(name, properties) {
        this.name = name;
        this.properties = { ...DEFAULT_REGION_PROPERTIES, ...properties};
    }
}

let REGION_NAMES = localStorage.getItem('region_names');
if (!REGION_NAMES) {
    REGION_NAMES = [
        Phaser.Utils.Array.GetRandom(['Negociola', 'Squarevi', 'Levelas']),
        Phaser.Utils.Array.GetRandom(['Artesa', 'Excentra', 'Quirkas']),
        Phaser.Utils.Array.GetRandom(['Cortato', 'Halfings', 'Demillo']),
        Phaser.Utils.Array.GetRandom(['Altono', 'Upsville', 'Hightown'])
    ];
    localStorage.setItem('region_names', REGION_NAMES);
} else {
    REGION_NAMES = REGION_NAMES.split(',');
}

const REGIONS = [
    new Region(REGION_NAMES[0], {
        averageHeight: 1.2,
        leveled: 1.5,
        quirky: 0.5,
        irreverence: 0.5,
        population: 50,
        boring: 0.7,
        centered: 0.7,
        flair: 0.95,
        emphasis: 0.8
    }),
    new Region(REGION_NAMES[1], {
        averageHeight: 0.8,
        leveled: 0.75,
        quirky: 2,
        irreverence: 1.2,
        population: 20,
        boring: 0.95,
        flair: 0.3,
        emphasis: 0.8
    }),
    new Region(REGION_NAMES[2], {
        averageHeight: 0.5,
        irreverence: 2,
        quirky: 1.2,
        population: 30,
        flair: 0.8,
        emphasis: 0.6,
        centered: 0.8,
        boring: 0.9
    }),
    new Region(REGION_NAMES[3], {
        averageHeight: 1.5,
        leveled: 1.5,
        quirky: 0.8,
        irreverence: 0.6,
        population: 30
    })
];