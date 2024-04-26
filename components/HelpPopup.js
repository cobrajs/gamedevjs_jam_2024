class HelpPopup extends IconButton {
  constructor(scene, x, y, helpText) {
    super(scene, x, y, 47, true);

    this.helpText = helpText;

    scene.add.existing(this);
  }

  open() {
    this.click();
  }

  click() {
    this.emit('open');
    const help = this.scene.add.image(400, 300, 'help').setDepth(1000);
    help.setInteractive({ useHandCursor: true });

    const speech = this.scene.add.text(
      400, 250,
      this.helpText, {
      fontFamily: 'monospace',
      fontSize: 24,
      color: '#000',
      align: 'center',
      wordWrap: { width: 700 }
    }).setOrigin(0.5).setStroke('#000', 2).setDepth(1001);
    const bounds = speech.getBounds();

    const close = this.scene.add.text(
      400, 530,
      'Click to close', {
      fontFamily: 'monospace',
      fontSize: 32,
      color: '#000',
    }).setOrigin(0.5).setStroke('#000', 2).setDepth(1001);

    help.on('pointerup', (pointer) => {
      help.destroy();
      speech.destroy();
      close.destroy();
      this.emit('close');
    });
}
}