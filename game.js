const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#fff',
  pixelArt: true,
  antialias: true,
  fps: {
    target: 10
  },
  scene: [Boot, Preloader, MainMenu, Settings, OfficeScene, FlyerDesignerScene, StreetViewScene],
});
