import Phaser from 'phaser';
import { GAME_WIDTH, TOTAL_HEIGHT, SCENE_BOOT, SCENE_TITLE, SCENE_GAME, SCENE_HUD, SCENE_GAMEOVER, SCENE_SCORE, SCENE_CUTSCENE } from './constants';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { GameOverScene } from './scenes/GameOverScene';
import { ScoreScene } from './scenes/ScoreScene';
import { CutsceneScene } from './scenes/CutsceneScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: TOTAL_HEIGHT,
  parent: 'game-container',
  pixelArt: true,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, GameScene, HUDScene, CutsceneScene, GameOverScene, ScoreScene],
};

new Phaser.Game(config);
