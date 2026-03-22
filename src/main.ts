import Phaser from 'phaser';
import { GAME_WIDTH, TOTAL_HEIGHT } from './constants';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { HUDScene } from './scenes/HUDScene';
import { GameOverScene } from './scenes/GameOverScene';
import { ScoreScene } from './scenes/ScoreScene';
import { CutsceneScene } from './scenes/CutsceneScene';
import { AchievementScene } from './scenes/AchievementScene';

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
  scene: [BootScene, TitleScene, GameScene, HUDScene, CutsceneScene, GameOverScene, ScoreScene, AchievementScene],
};

new Phaser.Game(config);
