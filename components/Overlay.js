class Overlay extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    scene.add.image('help');

    scene.add.existing(this);
  }
}