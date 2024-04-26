class OfficeScene extends Phaser.Scene {
  constructor() {
    super('Office');
  }

  create() {
    this.flyers = this.registry.get('flyers');

    this.money = this.registry.get('money');
    this.spentMoney = 0;

    this.moneyDisplay = this.add.text(10, 10, 'Money: $' + this.money, {
      fontFamily: 'monospace',
      fontSize: 28,
      color: '#000'
    }).setOrigin(0, 0.5).setStroke('#000', 2);
    this.moneyDisplay.setOrigin(0);

    this.flyerWallDisplay = new FlyerDisplay(this, 20, 80, 400, 300, { complete: true }, 2);
    this.flyerWallDisplay.updateFlyers();

    this.desk = this.add.image(450, 490, 'desk');

    this.phone = new Phone(this, 620, 360);
    this.phone.setHandlePoint(750, 135);

    this.phone.on('answerphone', () => {
      console.log('answered phone');
      this.showSpeech();
    });

    this.talkBubble = this.add.image(352, 192, 'talk_bubble');
    this.talkBubble.visible = false;
    this.talkBubble.setAlpha(0);
    this.talkBubble.setInteractive({ useHandCursor: true });

    this.talkBubble.on('pointerup', () => {
      this.captureCurrentFlyer();

      this.phone.hangUp();
    });

    // 410 x 280
    this.speech = this.add.text(
      this.talkBubble.x - (this.talkBubble.width / 2) + 58 + 205, 
      this.talkBubble.y - (this.talkBubble.height / 2) + 30 + 140,
      'This is some speech', {
      fontFamily: 'monospace',
      fontSize: 20,
      color: '#000',
      align: 'center',
      wordWrap: { width: 430 }
    });
    this.speech.setOrigin(0.5);
    this.speech.setStroke('#000', 2);
    this.speech.visible = false;
    this.speech.setAlpha(0);

    this.flyerDisplay = new FlyerDisplay(this, 130, 400, 430, 155, { complete: false });

    // Need to figure out how to get what text is clicked and also 
    //  how to underline/highlight specific text... eventually
  
    this.cursors = this.input.keyboard.createCursorKeys();

    this.time.addEvent({
      delay: Phaser.Math.RND.between(2000, 4000),
      callback: () => this.phoneRing()
    });

    this.flyerDisplay.updateFlyers();

    if (!this.registry.get('music_disabled')) {
      this.sound.play('music2', { loop: true });
      this.events.on('shutdown', () => {
        this.sound.stopByKey('music2');
      });
    }

    this.helpText = new HelpPopup(this, 727, 61, 
      `When the phone rings, pick it up by clicking on it! \
A popup will tell you about the flyer, and pay attention \
to where they are located for hints about how to design and place it. \
The properties of each area are constant, so you may need to play a \
few times to learn what to expect! Good luck!`);
    this.add.existing(this.helpText);

    this.helpText.on('open', () => {
      this.time.paused = true;
    });
    this.helpText.on('close', () => {
      this.time.paused = false;
    });

    if (!localStorage.getItem('flyerPower.gotHelpText.office')) {
      this.helpText.open();
      localStorage.setItem('flyerPower.gotHelpText.office', 1);
    }
  }

  update() {
  }

  showSpeech() {
    this.currentFlyer = this.flyers.createFlyer();
    let currentMoney = this.registry.get('money') || 0;
    currentMoney += this.currentFlyer.payout;
    this.registry.set('money', currentMoney);

    this.speech.setText(this.currentFlyer.getRequest());
    let failsafe = 10;
    while (--failsafe > 0) {
      const bounds = this.speech.getBounds();
      const fontSize = parseInt(this.speech.style.fontSize);
      if (bounds.height > 280) {
        this.speech.style.setFontSize(fontSize - 2);
      } else if (bounds.height < 280 - 20) {
        this.speech.style.setFontSize(fontSize + 2);
      } else {
        break;
      }
    }
    this.speech.visible = true;
    this.talkBubble.visible = true;
    this.tweens.add({
      targets: [this.speech, this.talkBubble],
      alpha: 1,
      duration: 200,
    });
    this.tweens.add({
      targets: this.helpText,
      alpha: 0,
      duration: 200,
      onComplete: () => this.helpText.setVisible(false)
    });
  }

  hideSpeech() {
    this.tweens.add({
      targets: [this.speech, this.talkBubble],
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.speech.visible = false;
        this.talkBubble.visible = false;
      }
    });

    this.helpText.setVisible(true);
    this.tweens.add({
      targets: this.helpText,
      alpha: 1,
      duration: 200,
    });
  }

  captureCurrentFlyer() {
    this.currentFlyer.captured = true;
    this.currentFlyer = undefined;

    this.hideSpeech();

    this.flyerDisplay.updateFlyers();
  }

  phoneRing() {
    this.phone.setRinging();
    this.sound.playAudioSprite('fx', 'phone', { volume: 0.7 });
  }
}