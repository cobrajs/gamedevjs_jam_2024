class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    const flyers = new FlyerCollection();
    this.registry.set('flyers', flyers);
    this.registry.set('money', 0);

    const letters = this.textures.get('title');

    this.letters = [
      { key: 'F', x: 184, y: 151 },
      { key: 'l', x: 330, y: 161 },
      { key: 'y', x: 415, y: 239 },
      { key: 'e', x: 510, y: 253 },
      { key: 'r', x: 610, y: 245 },

      { key: 'p', x: 143, y: 442 },
      { key: 'o', x: 260, y: 458 },
      { key: 'w', x: 385, y: 442 },
      { key: 'e2', x: 500, y: 475 },
      { key: 'r2', x: 585, y: 476 },
    ].map(({ x, y, key }, i) => {
      const letter = this.add.image(x, y, 'title', key);
      letter.setAlpha(0);
      this.tweens.add({
        targets: letter,
        alpha: 1,
        delay: i * 100,
        duration: 200
      });
      this.tweens.add({
        targets: letter,
        scale: 1.2,
        ease: 'Cubic.Out',
        yoyo: true,
        delay: i * 100,
        duration: 200
      });
      return letter;
    });

    const settings = new IconButton(this, 727, 61, 23);
    this.add.existing(settings);
    settings.on('click', (pointer) => {
      this.scene.start('Settings');
    });
    this.add.text(727, 135, 'Settings', { fontFamily: 'monospace', fontSize: 24, color: '#000' })
      .setOrigin(0.5)
      .setStroke('#000', 2);

    this.add.text(727, 463, 'Start', { fontFamily: 'monospace', fontSize: 24, color: '#000' })
      .setOrigin(0.5)
      .setStroke('#000', 2);
    const proceed = new IconButton(this, 727, 536, 40);
    this.add.existing(proceed);
    proceed.on('click', (pointer) => {
      let currentMoney = this.registry.get('money') || 0;
      this.registry.set('money', currentMoney);

      this.scene.start('Office');
    });

    if (!this.registry.get('music_disabled')) {
      this.sound.play('intro_music', { loop: true });
      this.events.on('shutdown', () => {
        this.sound.stopByKey('intro_music');
      });
    }
  }
}