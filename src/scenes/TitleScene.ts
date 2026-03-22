import Phaser from 'phaser';
import { SCENE_TITLE, SCENE_GAME, SCENE_HUD, GAME_WIDTH, GAME_HEIGHT, TOTAL_HEIGHT } from '../constants';

export class TitleScene extends Phaser.Scene {
  private selectedChapter: number = 0;
  private maxUnlockedChapter: number = 0;
  private cursorText!: Phaser.GameObjects.Text;
  private chapterTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: SCENE_TITLE });
  }

  create(): void {
    // Load save data
    this.loadSaveData();

    // Background
    this.cameras.main.setBackgroundColor('#000000');

    // Title logo
    const logo = this.add.sprite(GAME_WIDTH / 2, 80, 'spritesheet-raw', 'logo_pcpd');
    logo.setScale(0.5);

    // Title text
    this.add.text(GAME_WIDTH / 2, 150, 'PCPD - Code 3', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      resolution: 2,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 170, 'Petit City Police Department', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#aaaaaa',
      resolution: 2,
    }).setOrigin(0.5);

    // Version
    this.add.text(GAME_WIDTH - 10, TOTAL_HEIGHT - 10, 'v1.2 Browser Port', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#555555',
      resolution: 2,
    }).setOrigin(1, 1);

    // Chapter select
    const chapters = ['Chapter 1: 宝石店強盗', 'Chapter 2: 銀行強盗', 'Chapter 3: アジト急襲', 'Chapter 4: 最終追跡'];

    const startY = 200;
    for (let i = 0; i < chapters.length; i++) {
      const color = i <= this.maxUnlockedChapter ? '#ffffff' : '#555555';
      const text = this.add.text(GAME_WIDTH / 2, startY + i * 22, chapters[i], {
        fontFamily: 'monospace',
        fontSize: '11px',
        color,
        resolution: 2,
      }).setOrigin(0.5);
      this.chapterTexts.push(text);
    }

    // Cursor indicator
    this.cursorText = this.add.text(
      GAME_WIDTH / 2 - 120,
      startY + this.selectedChapter * 22,
      '▶',
      { fontFamily: 'monospace', fontSize: '11px', color: '#ffff00', resolution: 2 },
    ).setOrigin(0.5);

    // Controls hint
    this.add.text(GAME_WIDTH / 2, TOTAL_HEIGHT - 30, 'W/S: 選択  ENTER: 決定', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#888888',
      resolution: 2,
    }).setOrigin(0.5);

    // Warning text
    this.add.text(GAME_WIDTH / 2, TOTAL_HEIGHT - 15, 'このゲームには流血等の表現が含まれています', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ff4444',
      resolution: 2,
    }).setOrigin(0.5);

    // Input
    const kb = this.input.keyboard!;
    kb.on('keydown-W', () => this.moveSelection(-1));
    kb.on('keydown-UP', () => this.moveSelection(-1));
    kb.on('keydown-S', () => this.moveSelection(1));
    kb.on('keydown-DOWN', () => this.moveSelection(1));
    kb.on('keydown-ENTER', () => this.startChapter());
    kb.on('keydown-SPACE', () => this.startChapter());
  }

  private moveSelection(dir: number): void {
    this.selectedChapter = Phaser.Math.Clamp(
      this.selectedChapter + dir,
      0,
      Math.min(3, this.maxUnlockedChapter),
    );
    this.cursorText.setY(200 + this.selectedChapter * 22);
  }

  private startChapter(): void {
    if (this.selectedChapter > this.maxUnlockedChapter) return;

    this.scene.start(SCENE_GAME, { chapter: this.selectedChapter + 1 });
  }

  private loadSaveData(): void {
    try {
      const raw = localStorage.getItem('pcpd_save');
      if (raw) {
        const data = JSON.parse(raw);
        // Find highest unlocked chapter
        this.maxUnlockedChapter = 0;
        for (let i = 0; i < 4; i++) {
          if (data.chapterUnlocks?.[i]) {
            this.maxUnlockedChapter = i;
          }
        }
      }
    } catch {
      // Default: only chapter 1 unlocked
      this.maxUnlockedChapter = 0;
    }
  }
}
