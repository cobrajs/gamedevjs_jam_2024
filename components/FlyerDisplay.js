class FlyerDisplay extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height, filter, rows = 1) {
    super(scene, x, y);

    this.width = width;
    this.height = height;

    //this.phone.setInteractive();

    this.flyers = scene.registry.get('flyers');

    this.filter = filter;
    this.rows = rows;

    scene.add.existing(this);
  }

  updateFlyers() {
    this.removeAll(true);

    this.flyers.flyers
      .filter((flyer) => {
        if (!this.filter) {
          return true;
        }
        if (this.filter.complete === true) {
          return flyer.complete;
        } else if (this.filter.complete === false) {
          return !flyer.complete;
        }
        return true;
      })
      .forEach((flyer) => {
        const flyerContainer = this.scene.make.container({ x: 0, y: 0 }, false);
        const newFlyer = this.scene.make.image({ x: 0, y: 0, 
          key: Phaser.Utils.Array.GetRandom(['flyer_1', 'flyer_2', 'flyer_3']) }, false)
          .setData('id', flyer.id);
        newFlyer.setInteractive({ useHandCursor: true });
        newFlyer.on('pointerdown', () => {
          if (!flyer.complete) {
            this.scene.scene.start('FlyerDesigner', { flyer });
          } else {
            this.showFlyer(flyer);
          }
        });
        flyerContainer.add(newFlyer);
        flyerContainer.width = newFlyer.width;
        flyerContainer.height = newFlyer.height;
        if (flyer.layout?.length > 0 && !flyer.complete) {
          flyerContainer.add(this.scene.make.image({
            x: 0,
            y: 0,
            key: 'flyer_filler',
            frame: Phaser.Math.RND.between(0, 2)
          }, false));
        } else if (flyer.complete) {
          flyerContainer.add(this.scene.make.image({
            x: 0,
            y: 0,
            key: 'icons',
            frame: flyer.failed ? 2 : 7
          }, false));
        }
        this.add(flyerContainer);
      });

    const width = Math.ceil(this.length / this.rows);
    Phaser.Actions.GridAlign(this.list, {
      cellWidth: this.width / width,
      cellHeight: this.height / this.rows,
      width,
      height: this.rows
    });
  }

  showFlyer(flyer) {
    const canvas = new FlyerCanvas(this.scene, 400, 300, flyer);

    canvas.on('clicked', () => canvas.destroy());
  }
}