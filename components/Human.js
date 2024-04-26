class Human extends Phaser.GameObjects.Container {
  constructor(scene, x, y, region) {
    super(scene, x, y);

    this.region = region;

    this.heightOffset = region.properties.averageHeight + (Math.random() * 0.25 - 0.125);

    const sprite = scene.add.sprite(0, 0);
    sprite.setOrigin(0.5, 1);
    sprite.scaleY = this.heightOffset;
    sprite.play({ key: 'walk', startFrame: Phaser.Math.RND.between(0, 3) });
    this.add(sprite);

    this.personality = { ...region.properties };

    this.didJudge = false;

    // Likes it if any data is on there twice
    this.personality.emphasis = Math.random() > this.personality.emphasis;

    // Likes it if there are more than three stickers
    this.personality.flair = Math.random() > this.personality.flair;

    // Hates it if there are any stickers
    this.personality.boring = Math.random() > this.personality.boring;

    // Likes it if everything is centered
    this.personality.centered = Math.random() > this.personality.centered;
  }

  update() {

  }



  judgeFlyer(flyer) {
    const judgement = flyer.judgement;

    let engagement = 1;

    if (!judgement.allRequirements) {
      engagement -= 2;
      flyer.complain('missing info');
    }

    if (this.personality.emphasis && judgement.emphasis >= 2) {
      engagement += 2;
    }

    if (this.personality.flair && judgement.stickers >= 3) {
      engagement += 3;
    }

    if (this.personality.boring && judgement.stickers === 0) {
      engagement += 2;
    } else if (this.personality.boring && judgement.stickers > 0) {
      engagement -= 2;
    }

    if (this.personality.centered && Math.abs(judgement.centered) <= 5) {
      engagement += 3;
    }

    if (this.personality.leveled > 1) {
      if (judgement.leveled > this.personality.leveled) {
        engagement += 1;
      } else {
        engagement -= 0.5;
        flyer.complain('too crooked');
      }
    } else if (this.personality.leveled < 1) {
      if (judgement.leveled < this.personality.leveled) {
        engagement += 1;
      } else {
        engagement -= 0.5;
        flyer.complain('too straight');
      }
    }

    if (this.personality.quirky > 1) {
      if (judgement.quirky > this.personality.quirky) {
        engagement += 1;
      } else {
        engagement -= 1;
        flyer.complain('not quirky enough');
      }
    } else if (this.personality.quirky < 1) {
      if (judgement.quirky < this.personality.quirky) {
        engagement += 1;
      } else {
        engagement -= 1;
        flyer.complain('too quirky');
      }
    }

    if (judgement.irreverence) {
      if (this.personality.irreverence > 1 && judgement.irreverence > this.personality.irreverence) {
        engagement += 2;
      } else if (this.personality.irreverence < 1 && judgement.irreverence < this.personality.irreverence) {
        engagement += 2;
      } else if (this.personality.irreverence < 1 && judgement.irreverence > this.personality.irreverence) {
        engagement -= 1;
        flyer.complain('too offensive');
      }
    }

    const heightDiff = Math.abs(flyer.heightOffset - this.heightOffset);
    if (heightDiff > 0.4) {
      engagement *= 0.5;
      flyer.complain(flyer.heightOffset < this.heightOffset ? 'too low' : 'too high');
    } else if (heightDiff > 0.2) {
      engagement *= 0.75;
    } else {
      engagement += 1;
    }

    this.didJudge = true;

    this.judgement = Math.ceil(Math.max(engagement, 1));
    return this.judgement;
  }
}