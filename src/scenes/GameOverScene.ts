import Phaser from 'phaser';
import { SCENE_GAMEOVER, SCENE_TITLE, SCENE_GAME, GAME_WIDTH, TOTAL_HEIGHT } from '../constants';

const TIPS = [
  '射殺より逮捕のほうが高く評価される',
  '武器によって移動速度は変化する',
  'リロード中は移動速度が下がる',
  'バックアップを呼ぶとスコアが減少する',
  '右クリックで照準モードに切り替えられる',
  'Shiftキーでダッシュできる',
  '敵に近づくと近接逮捕（CQC）ができる',
];

export class GameOverScene extends Phaser.Scene {
  private chapterId: number = 1;

  constructor() {
    super({ key: SCENE_GAMEOVER });
  }

  init(data: { chapter?: number }): void {
    this.chapterId = data.chapter ?? 1;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // "YOU ARE DOWN" text
    this.add.text(GAME_WIDTH / 2, 80, 'YOU ARE DOWN', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 2,
      resolution: 2,
    }).setOrigin(0.5);

    // Random tip
    const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    this.add.text(GAME_WIDTH / 2, 140, 'TIPS:', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffff88',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 160, tip, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#cccccc',
      wordWrap: { width: 350 },
      align: 'center',
      resolution: 2,
    }).setOrigin(0.5);

    // Retry / Title options
    this.add.text(GAME_WIDTH / 2, 230, 'ENTER: リトライ    ESC: タイトルへ', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#888888',
      resolution: 2,
    }).setOrigin(0.5);

    const kb = this.input.keyboard!;
    kb.on('keydown-ENTER', () => {
      this.scene.start(SCENE_GAME, { chapter: this.chapterId });
    });
    kb.on('keydown-ESC', () => {
      this.scene.start(SCENE_TITLE);
    });
  }
}
