const HUMAN_WALK_DURATION = 3000;

class StreetViewScene extends Phaser.Scene {
  constructor() {
    super('StreetView');
  }

  create(config) {
    if (config.flyer) {
      this.flyer = config.flyer;
    } else {
      this.flyer = this.flyers.flyers[0];
    }

    this.add.image(400, 500, 'street');

    const pole = this.add.image(480, 495, 'pole');
    pole.setOrigin(0.5, 1);
    pole.depth = 480;

    //const flyer = this.add.image(495, 300, 'flyer_pole');
    const flyer = this.make.image({
      x: 0, y: 0, key: 'flyer_pole'}, false);
    const flyerBounds = flyer.getBounds();

    this.layoutContainer = this.add.container(495, 300);
    this.layoutContainer.depth = 481;
    const hitRect = new Phaser.Geom.Rectangle(-flyerBounds.width / 2, -flyerBounds.height / 2, flyerBounds.width, flyerBounds.height);
    this.layoutContainer.add(flyer);
    this.layoutContainer.setInteractive({
      useHandCursor: true,
      draggable: true,
      hitArea: hitRect,
      hitAreaCallback: Phaser.Geom.Rectangle.Contains
    });

    this.helperUp = this.make.image({ x: -15, y: -100, key: 'icons', frame: 24 }, false).setInteractive({ useHandCursor: true });
    this.helperDown = this.make.image({ x: -15, y: 100, key: 'icons', frame: 32 }, false).setInteractive({ useHandCursor: true });
    this.layoutContainer.add([this.helperUp, this.helperDown]);

    this.helperUp.on('pointerup', (pointer) => {
      this.tweens.add({
        targets: this.layoutContainer,
        y: this.clampLayout(this.layoutContainer.y - 50),
        duration: 250,
      });
    });

    this.helperDown.on('pointerup', (pointer) => {
      this.tweens.add({
        targets: this.layoutContainer,
        y: this.clampLayout(this.layoutContainer.y + 50),
        duration: 250,
      });
    });

    this.helperUpTween = this.tweens.add({
      targets: this.helperUp,
      y: '-=15',
      duration: 400,
      yoyo: true,
      repeat: -1
    });

    this.helperDownTween = this.tweens.add({
      targets: this.helperDown,
      y: '+=15',
      duration: 400,
      yoyo: true,
      repeat: -1
    });

    this.confirm = this.make.image({
      x: 75, y: 0, key: 'icons', frame: 7
    }, false);
    this.confirm.setInteractive({ useHandCursor: true });
    this.layoutContainer.add(this.confirm);

    this.layoutContainer.on('drag', (pointer, dragX, dragY) => {
      const clampedDragY = this.clampLayout(dragY);
      this.layoutContainer.y = clampedDragY;
    });

    this.confirm.on('pointerup', (pointer) => {
      this.startSimulation();
    });


    /*
    const pauser = this.add.image(755, 50, 'icons', 26);
    pauser.setInteractive({ useHandCursor: true });
    pauser.on('pointerup', (pointer) => {
      this.tweens.paused = !this.tweens.paused;
      console.log('Humans: ',
        this.children.getChildren().filter((child) => child.heightOffset).map((child) => child.heightOffset),
        this.heightOffset());
    });*/

    this.engagementLabel = this.add.text(10, 20, 'Engagement: ', {
      fontFamily: 'monospace',
      fontSize: 24,
      color: '#000'
    }).setStroke('#000', 2).setOrigin(0).setAlpha(0);

    this.engagement = {
      max: this.flyer.region.properties.population,
      level: 0
    };
    this.engagementGauge = this.add.graphics({ x: 185, y: 15 }).setAlpha(0);
    this.updateEngagement();
    this.overGauge = this.add.text(400, 35, '+0', {
      fontFamily: 'monospace',
      fontSize: 24,
      color: '#FFF'
    }).setStroke('#FFF', 2).setOrigin(1, 0.5).setAlpha(0);

    this.backButton = new IconButton(this, 45, 45, 43);
    this.backButton.on('click', (pointer) => {
      this.scene.start('FlyerDesigner', { flyer: this.flyer });
    });
    this.add.existing(this.backButton);

    this.helpText = new HelpPopup(this, 768, 50,
      `Now it's time to deploy your flyer! Vertical placement is key to engagement, \
so pick a good spot based on what you know of the area's average height. Drag \
the flyer to the spot on the pole you want, hit the check to deploy it, and \
watch the engagement gauge when people walk by it. You need to get full \
engagement to get the payout, and any extra is bonus!`);

    if (!localStorage.getItem('flyerPower.gotHelpText.streetView')) {
      this.helpText.open();
      localStorage.setItem('flyerPower.gotHelpText.streetView', 1);
    }


    if (!this.registry.get('music_disabled')) {
      this.sound.play('music3', { loop: true });
      this.events.on('shutdown', () => {
        this.sound.stopByKey('music3');
      });
    }

    this.checkForHumans = false;

    this.input.on('pointerdown', (pointer) => console.log('Click location: ', pointer.downX, pointer.downY, pointer, this.flyer));
  }

  update() {
    if (!this.simulationRunning) {
      return;
    }
    if (this.checkForHumans && this.humanWait <= 0) {
      this.finalScore();
      this.sound.stopByKey('fx');
      this.simulationRunning = false;
    }
  }

  updateEngagement() {
    const percent = this.engagement.level > this.engagement.max ? 1 : this.engagement.level / this.engagement.max;
    const barWidth = 220 * percent;
    this.engagementGauge.clear();
    this.engagementGauge.lineStyle(8, 0x000000, 1.0);
    this.engagementGauge.fillStyle(0x000000, 1.0);
    this.engagementGauge.fillRoundedRect(0, 0, barWidth, 40, 6);
    this.engagementGauge.strokeRoundedRect(0, 0, 220, 40, 6);
    if (this.engagement.level > this.engagement.max) {
      this.overGauge.setVisible(true);
      this.overGauge.setAlpha(0);
      this.tweens.add({
        targets: this.overGauge,
        alpha: 1,
        duration: 200,
        ease: 'Cubic.Out'
      })
      this.overGauge.setText('+ ' + (this.engagement.level - this.engagement.max));
    }
  }

  startSimulation() {
    this.disableHelpers();
    this.simulationRunning = true;
    this.flyer.heightOffset = this.heightOffset();
    this.flyer.judge();
    this.time.addEvent({
      delay: 300, //2000 / this.flyer.region.population,
      repeat: this.flyer.region.properties.population || 5,
      callback: () => {
        this.addHuman();
      }
    });
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.checkForHumans = true;
        this.sound.playAudioSprite('fx', 'steps');
      }
    });

    this.tweens.add({
      targets: this.backButton,
      alpha: 0,
      duration: 200,
      onComplete: () => this.backButton.disableInteractive()
    });
    this.tweens.add({
      targets: [this.engagementGauge, this.engagementLabel],
      alpha: 1,
      duration: 200
    });

    this.humanWait = 0;
  }

  addHuman() {
    const y = Phaser.Math.RND.between(430, 550);
    const side = Phaser.Math.RND.between(0, 1);
    let x = -100;
    if (side === 1) {
      x = 900;
    }
    const human = new Human(this, x, y, this.flyer.region);
    const tween = this.tweens.add({
      targets: human,
      x: side === 1 ? -100 : 900,
      duration: HUMAN_WALK_DURATION,
      ease: 'Sine.InOut',
      onUpdate: (tween, target, key, current, previous, params) => {
        if (!target.didJudge && Math.abs(current - this.layoutContainer.x) < 20) {
          const engagement = target.judgeFlyer(this.flyer);
          this.engagement.level += engagement;
          this.updateEngagement();
        }
      },
      onComplete: () => {
        human.destroy()
        this.humanWait--;
      }
    });
    human.scaleX = side === 0 ? 1.5 : -1.5;
    human.scaleY = 1.5;
    human.depth = y;
    this.add.existing(human);

    this.humanWait++;
  }

  disableHelpers() {
    this.helperDown.disableInteractive();
    this.helperDown.setVisible(false);
    this.helperDownTween.complete();
    this.helperUp.disableInteractive();
    this.helperUp.setVisible(false);
    this.helperUpTween.complete();
    this.confirm.disableInteractive();
    this.confirm.setVisible(false);
    this.layoutContainer.disableInteractive();
  }

  clampLayout(layoutY) {
    return Phaser.Math.Clamp(layoutY, 160, 400);
  }

  heightOffset() {
    const center = (400 - 160) / 2;
    return (2 - (this.layoutContainer.y - 160) / center) * 0.5 + 0.5;
  }

  finalScore() {
    const overlay = this.add.image(400, 300, 'help').setDepth(1000);
    overlay.setInteractive({ useHandCursor: true });

    this.flyer.complete = true;

    const judgement = this.engagement.level >= this.engagement.max;
    const bonus = Math.max(0, this.engagement.level - this.engagement.max);

    this.flyer.failed = !judgement;

    const engagementLabel = this.generateText(400, 60, 'Engagement', 40).setDepth(1001);
    const judgementLabel = this.generateText(400, 110, judgement ? 'Success' : 'Failed', 36).setDepth(1001);

    if (bonus) {
      this.generateText(400, 170, 'Bonus: ' + (bonus * 10), 32).setDepth(1001);;
    }

    if (this.flyer.complaints.length > 0) {
      this.generateText(400, 220, 'Complaints: ', 28).setDepth(1001);
      const uniqueComplaints = this.flyer.complaints.reduce((unique, complaint) => {
        if (!unique[complaint]) {
          unique[complaint] = 0;
        }
        unique[complaint] += 1;
        return unique;
      }, {});
      Object.entries(uniqueComplaints).forEach(([complaint, count], i) => {
        this.generateText(400, 260 + i * 30, `${complaint}: ${count} times`, 24).setDepth(1001);
      })
    }

    if (judgement) {
      let currentMoney = this.registry.get('money') || 0;
      currentMoney += this.flyer.payout + bonus * 10;
      this.registry.set('money', currentMoney);
    }

    const close = this.generateText(
      400, 530,
      'Click to return to the office', 32).setDepth(1001);

    overlay.on('pointerup', () => {
      this.scene.start('Office');
    });
  }

  generateText(x, y, text, fontSize = 24) {
    return this.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize,
      color: '#000',
    }).setOrigin(0.5).setStroke('#000', 2);
  }
}