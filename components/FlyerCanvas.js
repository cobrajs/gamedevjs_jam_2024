class FlyerCanvas extends Phaser.GameObjects.Container {
  constructor(scene, x, y, flyer) {
    super(scene, x, y);

    this.flyerFull = scene.add.image(0, 0, 'flyer_design');
    this.flyerFull.setInteractive();
    this.flyerFull.on('pointerup', (pointer) => this.emit('clicked'));

    this.flyer = flyer;

    this.add(this.flyerFull);

    if (flyer.layout?.length > 0) {
      this.load(flyer);
    }

    scene.add.existing(this);
  }

  stamp(stampable, itemInfo) {
    const position = this.getLocalPoint(stampable.x, stampable.y);

    const flyerRect = new Phaser.Geom.Rectangle(
      this.flyerFull.x - this.flyerFull.width / 2,
      this.flyerFull.y - this.flyerFull.height / 2,
      this.flyerFull.width,
      this.flyerFull.height
    );

    if (!Phaser.Geom.Rectangle.Contains(flyerRect, position.x, position.y)) {
      stampable.destroy();
      return false;
    }

    stampable.setPosition(position.x, position.y);
    this.add(stampable);

    this.flyer.layout.push({
      ...itemInfo,
      x: position.x,
      y: position.y,
      angle: stampable.angle
    });

    return true;
  }

  clear() {
    this.removeBetween(1, this.length, true);
    this.flyer.layout = [];
  }

  load() {
    if (this.length > 1) {
      this.removeBetween(1, this.length);
    }

    this.flyer.layout.forEach((item) => {
      if (item.type === 'requirement') {
        const text = this.scene.make.text({
          x: item.x, y: item.y,
          angle: item.angle,
          text: item.value,
          style: {
            fontFamily: 'monospace',
            fontSize: 24,
            color: '#000'
          }
        }).setStroke('#000', 2).setOrigin(0.5);
        this.add(text);
      } else if (item.type === 'sticker') {
        const sticker = this.scene.make.image({
          x: item.x, y: item.y,  key: 'icons', frame: item.frame,
        });
        this.add(sticker);
      }
    });
  }
}