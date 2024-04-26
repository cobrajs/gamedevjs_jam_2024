let FLYER_ID = 1;
class Flyer {
  id;
  type;
  requirements;
  layout;
  payout;

  constructor() {
    this.id = FLYER_ID++;

    this.type = Phaser.Utils.Array.GetRandom(Object.keys(TypeRequirements));
    this.region = Phaser.Utils.Array.GetRandom(REGIONS);

    this.requirements = Object.fromEntries(TypeRequirements[this.type].map((requirement) => {
      if (Generators[requirement]) {
        return [requirement, Generators[requirement](this.type)];
      }
    }).filter((requirement) => requirement));

    this.payout = Phaser.Math.RND.between(90, 110);

    this.layout = [];
    this.complaints = [];

    this.complete = false;
  }

  getRequest() {
    const base = `Hello! I need a flyer for my ${this.type.toLowerCase()}.`;
    const requirementSentences = Object.entries(this.requirements).map(([requirementType, requirement]) => {
      return ToSentence[requirementType](requirement, this.type);
    });

    const region = ` I'm in ${this.region.name}.`;

    return base + ' ' + requirementSentences.join(' ') + region + ' $' + this.payout + '. Thanks!';
  }

  getRequirementsInfo() {
    const base = [];
    if (this.type === 'Found Pet') {
      base.push({ type: 'type', value: 'found ' + this.requirements.Animal.type });
    } else if (this.type === 'Lost Pet') {
      base.push({ type: 'type', value: 'lost ' + this.requirements.Animal.type });
    } else {
      base.push({ type: 'type', value: this.type.toLowerCase() });
    }
    return [...base, ...Object.entries(this.requirements).flatMap(([requirementType, requirement]) => {
      const info = ToInfo[requirementType](requirement, this.type);
      if (typeof info === 'object') {
        return info.map((value) => ({
          type: requirementType, value
        }));
      }
      return {
        type: requirementType,
        value: info
      };
    })];
  }

  judge() {
    let leveled = 0;
    let quirky = 1;
    let irreverence = 0;
    let centered = 1;
    let relevance = 0;

    const emphasisTracker = {};

    let allRequirements = Object.keys(this.requirements).every((requirement) => {
      return this.layout.some((item) => (
        item.type === 'requirement' && item.subType === requirement
      ));
    }) && this.layout.some((item) => item.subType === 'type');
    
    const layoutCount = this.layout.length;
    for (const item of this.layout) {
      centered += item.x / 10;

      if (item.relevance) {
        if (item.relevance.includes(this.type) || item.relevance === 'all') {
          relevance++;
          quirky++;
        } else {
          relevance -= 2;
        }
      }
      if (item.offensive && item.offensive.includes(this.type)) {
        irreverence += 2;
      }

      if (!item.angle) {
        leveled += 1.5;
      } else {
        quirky += Math.abs(Math.floor(item.angle / 10));
      }

      const key = this.type === 'requirement' ? this.subType : this.frame;
      if (!emphasisTracker[key]) {
        emphasisTracker[key] = 0;
      }
      emphasisTracker[key]++;
    }

    const stickerCount = this.layout.filter(({ type }) => type === 'sticker').length;
    this.judgement = {
      allRequirements,
      centered,
      leveled: leveled === layoutCount * 1.5 ? 2 : leveled / layoutCount,
      quirky: quirky / layoutCount,
      irreverence: stickerCount ? irreverence / stickerCount : 0,
      relevance: stickerCount ? relevance / stickerCount : 0,
      stickers: stickerCount,
      emphasis: Object.values(emphasisTracker)
        .filter((value) => value > 1)
        .reduce((max, value) => Math.max(max, value), 0)
    };

    console.log('Judgement: ', this.judgement, this.layout);
    return this.judgement; 
  }

  complain(complaint) {
    this.complaints.push(complaint);
    console.log('Complaint: ', complaint);
  }
}


class FlyerCollection {
  constructor() {
    this.flyers = [];
  }

  getFlyer(id) {
    return this.flyers.find(({ id: flyerId }) => flyerId === id);
  }

  createFlyer() {
    const flyer = new Flyer();
    this.flyers.push(flyer);
    return flyer;
  }
}

const TypeRequirements = {
  Cookout: ['Address', 'DateTime'],
  'Yard Sale': ['Address', 'DateTime'],
  Concert: ['Band', 'Venue', 'DateTime'],
  'Lost Pet': ['Animal', 'Phone'],
  'Found Pet': ['Animal', 'Address', 'Phone'],
  'Grand Opening': ['Store', 'DateTime']
}

const Generators = {
  Address: (requirementType) => {
    return Phaser.Math.RND.between(10, 222) + ' ' +
      Phaser.Utils.Array.GetRandom(['Radio', 'Robert', 'Amelia', 'Charts', 'Smith', 'Blue', 'Pecan', 'Olive']) + ' ' +
      Phaser.Utils.Array.GetRandom(['St', 'Ave', 'Ln', 'Rd']);
  },
  Phone: (requirementType) => {
    return Random.Digits(3) + '-' + Random.Digits(3);
  },
  DateTime: (requirementType) => {
    const hour = Phaser.Math.RND.between(8, 20);

    return {
      date: Phaser.Math.RND.between(1, 12) + '/' + Phaser.Math.RND.between(1, 28),
      time: hour < 12 ? hour + 'AM' : hour > 12 ? (hour - 12) + 'PM' : hour + 'PM'
    };
  },
  Band: (requirementType) => {
    return {
      name: Phaser.Utils.Array.GetRandom([
        'Super Loud', 'Astringency', 'Astral Pie', 'BlacknBlue', 'Shampu Boi', 'The Wonks',
        'Snack Fight', 'Pad Surfers', 'Shnozzle', 'Frantik', 'Blue Dream', 'Wet Stinks'
      ])
    };
  },
  Animal: (requirementType) => {
    const baseAnimal = {
      type: Phaser.Utils.Array.GetRandom(['dog', 'cat']),
      name: Phaser.Utils.Array.GetRandom([
        'Fief', 'Bucket', 'Charlie', 'Majorca', 'Ustice', 'Fluffs', 'Mr. Pink', 'Cutie',
        'Bill', 'Spotch', 'Reneer', 'Quainty', 'Galap', 'Thinky', 'Waslty', 'Procky'
      ]),
      pronoun: Phaser.Utils.Array.GetRandom(['he', 'she']),
      description: [
        Phaser.Utils.Array.GetRandom(['small', 'big', 'bold', 'long', 'short', 'tall', 'ugly', 'plump']),
        Phaser.Utils.Array.GetRandom(['round', 'fluffy', 'shaggy', 'sleek', 'slick', 'frumpy', 'hairy']),
        Phaser.Utils.Array.GetRandom(['white', 'brown', 'black', 'blonde', 'grey', 'dotted'])
      ].join(', ')
    };

    if (requirementType === 'Found Pet') {
      return {
        type: baseAnimal.type,
        description: baseAnimal.description
      };
    }

    return baseAnimal; 
  },
  Venue: (requirementType) => {
    return Phaser.Utils.Array.GetRandom(['Blank Arena', 'The Fillis', 'Canker Club', 'Henry Stadium']);
  },
  Store: (requirementType) => {
    return Phaser.Utils.Array.GetRandom([
      'General Store', 'Super Bank', 'Car Washy', "Jim's Food", 'Burgerland', "Wilmbell's",
      'Tieland', 'All Dollars', 'Pharmacy', 'Self Store 4 U'
    ]);
  }
}

const ToSentence = {
  Address: (address, requirementType) => `My address is ${address}.`,
  Phone: (phone, requirementType) => `My phone number is ${phone}.`,
  DateTime: ({ date, time }, requirementType) => `The date is ${date} at ${time}.`,
  Band: ({ name }, requirementType) => `Our band name is ${name}.`,
  Animal: ({ type, name, pronoun, description }, requirementType) => {
    if (requirementType === 'Found Pet') {
      return `This ${type} is ${description}`;
    }
    return `My ${type}'s name is ${name} and ${pronoun} is ${description}`;
  },
  Venue: (venue, requirementType) => `It will take place at ${venue}`,
  Store: (store, requirementType) => `My store's name is ${store}`
};


const ToInfo = {
  Address: (address, requirementType) => address,
  Phone: (phone, requirementType) => phone,
  DateTime: ({ date, time }, requirementType) => `${date} @ ${time}`,
  Band: ({ name }, requirementType) => name,
  Animal: ({ type, name, pronoun, description }, requirementType) => {
    if (requirementType === 'Found Pet') {
      return description;
    }
    return [name, description];
  },
  Venue: (venue, requirementType) => venue,
  Store: (store, requirementType) => store
};

const Random = {
  Digit: () => Phaser.Math.RND.between(0, 9),
  Digits: (count) => new Array(count).fill(0).map(() => Phaser.Math.RND.between(0, 9)).join('')
};