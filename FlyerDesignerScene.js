const PADDING = 20;
const NINESLICE_PADDING = 40;

class FlyerDesignerScene extends Phaser.Scene {
  constructor() {
    super('FlyerDesigner');
  }

  create(config) {
    this.flyers = this.registry.get('flyers');

    if (config.flyer) {
      this.flyer = config.flyer;
    } else {
      this.flyer = this.flyers.flyers[0];
    }

    this.flyerFull = new FlyerCanvas(this, 600, 200, this.flyer);
    this.flyerFull.on('clicked', () => {
      if (this.currentDraggable) {
        this.stamp(this.currentDraggable);
        this.setCurrentDraggable(null);

        this.sound.playAudioSprite('fx', 'place');
      }
    });

    this.money = this.registry.get('money');
    this.spentMoney = 0;

    const region = this.generateText(10, 10, 'Area: ' + this.flyer.region.name);
    region.setOrigin(0);
    this.add.existing(region);

    this.budget = this.generateText(260, 10, 'Budget: $' + this.money);
    this.budget.setOrigin(0);
    this.add.existing(this.budget);

    this.requirements = [];
    this.flyer.getRequirementsInfo().forEach((requirement, i) => {
      const text = this.generateText(220, 120 + i * 70, requirement.value);

      text.setInteractive({
        useHandCursor: true,
      });

      text.on('pointerdown', (pointer) => {
        if (this.currentDraggable) {
          return;
        }

        const copy = this.generateText(0, 0, requirement.value);
        copy.setData('info', {
          type: 'requirement',
          subType: requirement.type,
          value: requirement.value
        });
        const box = this.makeFloating(text.x, text.y, copy);

        box.on('drag', (e, dragX, dragY) => {
          box.setPosition(dragX, dragY);
        });

        this.children.bringToTop(box);

        this.setCurrentDraggable(box, true);

        this.sound.playAudioSprite('fx', 'sticker' + Phaser.Math.RND.between(1, 7));
      });

      this.add.existing(text);

      this.requirements.push(text);
    });


    this.stickers = [];
    const gridWidth = 4;
    const gridStartX = 25;
    const gridStartY = 65;
    STICKERS.forEach((stickerInfo, i) => {
      const sticker = this.add.image(
        gridStartX + 90 /2 + (i % gridWidth) * 90,
        gridStartY + 90 / 2 + Math.floor(i / gridWidth) * 82,
        'icons', stickerInfo.frame);
      this.stickers.push(sticker);

      sticker.setInteractive({
        useHandCursor: true,
      });

      sticker.on('pointerdown', (pointer) => {
        if (this.currentDraggable) {
          return;
        }

        const copy = this.make.image({
          x: 0, y: 0,  key: 'icons', frame: stickerInfo.frame,
        }, false);
        copy.setData('info', {
          type: 'sticker',
          ...stickerInfo
        });
        const box = this.makeFloating(sticker.x, sticker.y, copy);

        box.on('drag', (e, dragX, dragY) => {
          box.setPosition(dragX, dragY);
        });

        this.children.bringToTop(box);

        this.setCurrentDraggable(box, true);

        this.sound.playAudioSprite('fx', 'sticker' + Phaser.Math.RND.between(1, 7));
      });
    });


    this.tabSelector = this.add.image(5, 480, 'notes_selected')
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });
    const notesRect = new Phaser.Geom.Rectangle(this.tabSelector.x, this.tabSelector.y + 10, 164, 90);
    const stickersRect = new Phaser.Geom.Rectangle(this.tabSelector.x + notesRect.width, this.tabSelector.y + 10, 230, 90);
    this.tabSelector.on('pointerup', ({ downX, downY }) => {
      let changedPage = false;
      if (notesRect.contains(downX, downY)) {
        changedPage = this.showNotes();
      } else if (stickersRect.contains(downX, downY)) {
        changedPage = this.showStickers();
      }
      if (changedPage) {
        this.sound.playAudioSprite('fx', 'page');
      }
    });


    const buttonHeight = 450;
    const button2Height = 540;

    const rotateLeft = new IconButton(this, 476, buttonHeight, 0);
    rotateLeft.forDraggable = true;
    rotateLeft.on('click', () => {
      if (this.currentDraggable) {
        this.tweens.add({
          targets: this.currentDraggable,
          angle: '-=10',
          duration: 100
        });
      }
    });
    this.add.existing(rotateLeft);
    this.buttons = [rotateLeft];
    
    const rotateRight = new IconButton(this, 556, buttonHeight, 1);
    rotateRight.forDraggable = true;
    rotateRight.on('click', () => {
      if (this.currentDraggable) {
        this.tweens.add({
          targets: this.currentDraggable,
          angle: '+=10',
          duration: 100
        });
      }
    });
    this.add.existing(rotateRight);
    this.buttons.push(rotateRight);

    const cancel = new IconButton(this, 638, buttonHeight, 2);
    cancel.forDraggable = true;
    cancel.on('click', () => {
      if (this.currentDraggable) {
        this.currentDraggable.destroy();
        this.setCurrentDraggable(null);
      }
    });
    this.add.existing(cancel);
    this.buttons.push(cancel);

    const stamp = new IconButton(this, 724, buttonHeight, 3, false);
    stamp.forDraggable = true;
    stamp.on('click', () => {
      if (this.currentDraggable) {
        this.stamp(this.currentDraggable);
        this.setCurrentDraggable(null);

        this.sound.playAudioSprite('fx', 'place');
      }
    });
    this.add.existing(stamp);
    this.buttons.push(stamp);


    const clearFlyer = new IconButton(this, 476, button2Height, 8, false);
    clearFlyer.on('click', () => {
      this.flyerFull.clear();
      this.sound.playAudioSprite('fx', 'clear' + Phaser.Math.RND.between(1, 4));
      this.money += this.spentMoney;
      this.registry.set('money', this.money);
      this.updateBudget();
    });
    this.add.existing(clearFlyer);
    this.buttons.push(clearFlyer);

    const saveFlyer = new IconButton(this, 600, button2Height, 16);
    saveFlyer.on('click', () => {
      this.saveFlyer();
    });
    this.add.existing(saveFlyer);
    this.buttons.push(saveFlyer);

    const deployFlyer = new IconButton(this, 724, button2Height, 40);
    deployFlyer.on('click', () => {
      this.deployFlyer();
    });
    this.add.existing(deployFlyer);
    this.buttons.push(deployFlyer);


    this.showNotes(true);
    //this.showStickers(true);

    this.setCurrentDraggable(null);

    this.input.on('pointermove', (pointer) => {
      if (this.currentDraggable && this.currentDraggableSelected) {
        this.currentDraggable.setPosition(pointer.x, pointer.y);
      }
    });
    this.input.on('pointerup', (pointer) => {
      if (this.currentDraggableSelected) {
        this.currentDraggableSelected = false;
      }
    });

    this.helpText = new HelpPopup(this, 768, 50,
      `Welcome to the Flyer Designer! Click and drag notes and stickers and \
use the stamper (or click the canvas) to stamp them on the flyer. Once they are \
stamped they are stuck, so you'll need to clear the canvas. Make sure you have all the available \
notes somewhere on the flyer, and remember what people like in the area. \
Some areas like straight, centered text, while others like slanted text with \
lots of stickers. Also, make sure stickers are relevant, or don't! Some people like both. \
Experiment and see how your flyer engages with the public!`);

    if (!localStorage.getItem('flyerPower.gotHelpText.flyerDesigner')) {
      this.helpText.open();
      localStorage.setItem('flyerPower.gotHelpText.flyerDesigner', 1);
    }

    if (!this.registry.get('music_disabled')) {
      this.sound.play('music1', { loop: true });
      this.events.on('shutdown', () => {
        this.sound.stopByKey('music1');
      });
    }
  }

  generateText(x, y, text) {
    return this.make.text({
      add: false,
      x, y,
      text, 
      style: {
        fontFamily: 'monospace',
        fontSize: 24,
        color: '#000'
      }
    }).setStroke('#000', 2).setOrigin(0.5);
  }

  makeFloating(x, y, inner) {
    const bounds = inner.getBounds();
    const frame = this.make.nineslice({
      key: 'info_1',
      width: bounds.width + PADDING * 2,
      height: bounds.height + PADDING * 2,
      leftWidth: NINESLICE_PADDING,
      rightWidth: NINESLICE_PADDING,
      topHeight: NINESLICE_PADDING,
      bottomHeight: NINESLICE_PADDING
    });
    return this.add.container(x, y, [frame, inner])
      .setInteractive({
        draggable: true,
        useHandCursor: true,
        hitArea: new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains
      });
  }

  showNotes(force = false) {
    if (!force && this.tabSelector.texture.key === 'notes_selected') {
      return false;
    }

    this.requirements.forEach((requirement) => {
      requirement.setVisible(true);
      requirement.setInteractive();
    });
    this.stickers.forEach((sticker) => {
      sticker.setVisible(false);
      sticker.disableInteractive();
    });

    this.tabSelector.setTexture('notes_selected');
    return true;
  }

  showStickers(force = false) {
    if (!force && this.tabSelector.texture.key === 'stickers_selected') {
      return false;
    }

    this.requirements.forEach((requirement) => {
      requirement.setVisible(false);
      requirement.disableInteractive();
    });
    this.stickers.forEach((sticker) => {
      sticker.setVisible(true);
      sticker.setInteractive();
    });

    this.tabSelector.setTexture('stickers_selected');
    return true;
  }

  setCurrentDraggable(object, selected) {
    this.currentDraggable = object;

    if (selected !== undefined) {
      this.currentDraggableSelected = selected;
    }

    this.buttons.forEach((button) => {
      if (!button.forDraggable) {
        return;
      }
      if (!object) {
        button.disable();
      } else {
        button.enable();
      }
    });
  }

  stamp(stampable) {
    const innerStampable = stampable.last;
    innerStampable.setPosition(stampable.x, stampable.y);
    innerStampable.setAngle(stampable.angle);

    const stamped = this.flyerFull.stamp(innerStampable, innerStampable.getData('info'));

    stampable.destroy();

    this.money -= 10;
    this.spentMoney += 10;
    this.registry.set('money', this.money);
    this.updateBudget();

    if (!stamped) {
      return;
    }
  
    const stampX = stampable.x - this.flyerFull.x;
    const stampY = stampable.y - this.flyerFull.y;
    this.tweens.add({
      targets: this.flyerFull,
      scale: 0.9,
      angle: stampX > 2 || stampY < -2 ? Phaser.Math.RND.between(5, 15) : stampX < -2 || stampY > 2 ? Phaser.Math.RND.between(-15, -5) : 0,
      duration: 200,
      ease: 'Expo.Out',
      yoyo: true
    });

    this.flyer.judge();
  }

  updateBudget() {
    this.budget.setText('Budget: ' + this.money);
  }

  // Go back to the office scene and save the flyer on the desk
  saveFlyer() {
    this.scene.start('Office');
  }

  // Go to the street view to deploy the flyer
  deployFlyer() {
    this.scene.start('StreetView', { flyer: this.flyer });
  }

  update() {

  }
}