class IconButton extends Phaser.GameObjects.Image {
  constructor(scene, x, y, frame, clicky = true) {
    super(scene, x, y, 'icons', frame);

    this.setInteractive({ useHandCursor: true });

    let downOn = false;

    this.on('pointerover', (e) => {
      this.addWiggle();
    });

    this.on('pointerout', (e) => {
      this.removeWiggle();
      downOn = false;
    });

    this.on('pointerdown', (pointer) => {
      downOn = Phaser.Math.RND.between(1, 2);
      if (clicky) {
        scene.sound.playAudioSprite('fx', 'click_down' + downOn, { volume: 0.8 });
      }
    });

    this.on('pointerup', (pointer) => {
      if (!downOn) {
        return;
      }
      this.click();
      if (clicky) {
        scene.sound.playAudioSprite('fx', 'click_up' + downOn, { volume: 0.8 });
      }
      downOn = false;
    });
  }

  click() {
    this.emit('click');
  }

  disable() {
    this.disableInteractive();
    this.removeWiggle();
  }

  enable() {
    this.setInteractive();
  }

  addWiggle() {
    if (this.wiggleTween) {
      return;
    }

    this.wiggleTween = this.scene.tweens.add({
      targets: this,
      angle: { start: -20, to: 20},
      ease: 'Sine.inOut',
      yoyo: true,
      duration: 300,
      repeat: -1,
      onComplete: () => {
        if (this.wiggleTween) {
          this.wiggleTween.destroy();
          this.wiggleTween = null;
        }
      }
    });
  }

  removeWiggle() {
    if (this.wiggleTween) {
      this.wiggleTween.complete();
      this.angle = 0;
    }
  }
}