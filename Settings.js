class Settings extends Phaser.Scene {
  constructor() {
    super('Settings');
  }

  create() {
    this.add.text(63, 125, 'Back', { fontFamily: 'monospace', fontSize: 24, color: '#000' })
      .setOrigin(0.5)
      .setStroke('#000', 2);
    const back = new IconButton(this, 60, 60, 43);
    this.add.existing(back);
    back.on('click', (pointer) => {
      this.scene.start('MainMenu');
    });

    this.title = this.add.text(400, 100, 'Settings', { fontFamily: 'monospace', fontSize: 64, color: '#000' });
    this.title.setOrigin(0.5);
    this.title.setStroke('#000', 5);

    const music = this.add.text(400, 300,
      `Music: ${this.registry.get('music_disabled') ? 'Off' : 'On'}`,
      { fontFamily: 'monospace', fontSize: 64, color: '#000' })
      .setOrigin(0.5)
      .setStroke('#000', 5)
      .setInteractive({ useHandCursor: true });
    music.on('pointerdown', (pointer) => {
      this.sound.playAudioSprite('fx', 'click_down1');
    });
    music.on('pointerup', (pointer) => {
      const music_disabled = this.registry.get('music_disabled');
      this.registry.set('music_disabled', !music_disabled);
      music.setText(`Music: ${!music_disabled ? 'Off' : 'On'}`);
      this.sound.playAudioSprite('fx', 'click_up1');
    });
    
    const sound = this.add.text(400, 400,
      `Sound: ${this.sound.mute ? 'Off' : 'On'}`,
      { fontFamily: 'monospace', fontSize: 64, color: '#000' })
      .setOrigin(0.5)
      .setStroke('#000', 5)
      .setInteractive({ useHandCursor: true });
    sound.on('pointerdown', (pointer) => {
      this.sound.playAudioSprite('fx', 'click_down1');
    });
    sound.on('pointerup', (pointer) => {
      this.sound.mute = !this.sound.mute;
      sound.setText(`Sound: ${this.sound.mute ? 'Off' : 'On'}`);
      this.sound.playAudioSprite('fx', 'click_up1');
    });

    const helpText = new HelpPopup(this, 727, 61, 
      `This is the settings menu. There's not really much to do here, \
other than disabling music and/or sound. Though I quite like the \
music, having created it, so I tend to leave it on.`);
    this.add.existing(helpText);
  }
}