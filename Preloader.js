class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');

    this.loadText;
  }

  preload() {
    this.loadText = this.add.text(400, 300, 'Loading...', { fontFamily: 'monospace', fontSize: 64, color: '#000' });
    this.loadText.setOrigin(0.5);
    this.loadText.setStroke('#000', 5);

    this.load.setPath('assets');
    this.load.image('desk', 'desk.png');
    this.load.image('flyer_1', 'flyer_1.png');
    this.load.image('flyer_2', 'flyer_2.png');
    this.load.image('flyer_3', 'flyer_3.png');
    this.load.image('phone', 'phone.png');
    this.load.image('phone_handle', 'phone_handle.png');
    this.load.image('talk_bubble', 'talk_bubble.png');
    this.load.spritesheet('flyer_filler', 'flyer_fillers.png', { frameWidth: 107, frameHeight: 126 });

    // Flyer Design Scene
    this.load.image('info_1', 'info_1.png');
    this.load.image('info_2', 'info_2.png');
    this.load.image('info_3', 'info_3.png');
    this.load.image('flyer_design', 'flyer_design.png');
    this.load.image('notes_selected', 'notes_selected.png');
    this.load.image('stickers_selected', 'stickers_selected.png');

    // Street View Scene
    this.load.image('street', 'street.png');
    this.load.image('pole', 'pole.png');
    this.load.image('flyer_pole', 'flyer_pole.png');
    this.load.spritesheet('human', 'human.png', { frameWidth: 91, frameHeight: 197 })

    this.load.image('help', 'help_text.png');

    this.load.spritesheet('icons', 'icon_sheet.png', { frameWidth: 90, frameHeight: 90 });

    this.load.audioSprite('fx', 'regions.json', ['fx.mp3', 'fx.ogg']);
    this.load.audio('music1', ['music1.mp3', 'music1.ogg']);
    this.load.audio('music2', ['music2.mp3', 'music2.ogg']);
    this.load.audio('music3', ['music3.mp3', 'music3.ogg']);
    this.load.audio('intro_music', ['intro_music.mp3', 'intro_music.ogg']);

    this.load.atlas({
      key: 'title',
      textureURL: 'title_sprites.png',
      atlasURL: 'title_sprites.json'
    });
  }

  create() {
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('human', { frames: [0, 1, 2, 3] }),
      frameRate: 10,
      repeat: -1
    });

    if (this.sound.locked) {
      this.loadText.setText('Click to start');
      this.input.once('pointerdown', () => {
        this.nextScene();
      });
    } else {
      this.nextScene();
    }
  }

  nextScene() {
    this.scene.start('MainMenu');
  }
}