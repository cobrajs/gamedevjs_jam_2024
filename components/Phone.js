class Phone extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    this.phoneHandle = scene.add.image(0, -70, 'phone_handle');
    this.phone = scene.add.image(0, 0, 'phone');

    this.add([ this.phoneHandle, this.phone ]);

    this.phone.setInteractive({ useHandCursor: true });
    this.phone.disableInteractive();

    this.handlePoint = new Phaser.Math.Vector2(0, 0);

    this.phone.on('pointerup', () => {
      if (!this.getRinging()) {
        return;
      }

      this.clearRings();

      scene.tweens.add({
        targets: this.phoneHandle,
        duration: 200,
        x: this.handlePoint.x,
        y: this.handlePoint.y,
        rotation: Math.PI / 2,
        onComplete: () => {
          this.emit('answerphone');
        }
      });
    });

    scene.add.existing(this);
  }

  setRinging(ringing = true) {
    this.setData('ringing', ringing);

    if (ringing) {
      this.addRings();

      this.phone.setInteractive();
    } else {
      this.phone.disableInteractive();
    }
  }

  getRinging() {
    return this.getData('ringing');
  }

  setHandlePoint(x, y) {
    this.handlePoint.set(x - this.x, y - this.y);
  }

  hangUp() {
    this.scene.tweens.add({
      targets: this.phoneHandle,
      duration: 200,
      x: 0,
      y: -70,
      rotation: 0,
    });
    this.setRinging(false);
  }

  addRings() {
    const ring1 = this.scene.add.text(Phaser.Math.RND.between(-100, -80), Phaser.Math.RND.between(-150, -130), 'Ring', {
      fontFamily: 'monospace',
      fontSize: 32,
      color: '#000'
    }).setOrigin(0.5).setStroke('#000', 2);
    const ring2 = this.scene.add.text(Phaser.Math.RND.between(100, 80), Phaser.Math.RND.between(-150, -130), 'Ring', {
      fontFamily: 'monospace',
      fontSize: 32,
      color: '#000'
    }).setOrigin(0.5).setStroke('#000', 2);
    //this.ringRing.visible = false;
    this.rings = [ring1, ring2];
    this.add([ring1, ring2]);
    this.ringTweens = [this.scene.tweens.add({
      targets: ring1,
      duration: 400,
      rotation: -0.4,
      yoyo: true,
      repeat: -1
    }), this.scene.tweens.add({
      targets: ring2,
      duration: 400,
      rotation: 0.4,
      yoyo: true,
      repeat: -1
    })];
  }

  clearRings() {
    this.rings.forEach((ring) => ring.destroy());
    this.rings = [];
    this.ringTweens.forEach((tween) => tween.destroy());
    this.ringTweens = [];
  }
}