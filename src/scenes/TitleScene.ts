import Phaser from 'phaser';
import { SCENE_TITLE, SCENE_GAME, SCENE_ACHIEVEMENT, GAME_WIDTH, TOTAL_HEIGHT } from '../constants';

const CHAPTER_BRIEFINGS = [
  '時は1999年、ここ「Petit City」では犯罪が急激に増加。\n'
  + 'PCPDでは警察官の数が圧倒的に不足していた。\n'
  + '警察官「マイケル・デッカート」は宝石店強盗の\n'
  + '通報を受け、現場に急行するのであった...',

  '犯人グループの一部を取り逃してしまったPCPD。\n'
  + '事後捜査に切り替えて現場付近を巡回していると\n'
  + '銀行強盗に遭遇する。無事に制圧することが\n'
  + 'できるのか。',

  '逮捕した犯人グループのメンバーを問い詰め、\n'
  + 'ボス通称「Juggernaut」の居場所が判明した。\n'
  + '彼を逮捕できれば町の治安は大幅に改善する\n'
  + 'はずだ。PCPDは全部隊を確保に向かわせた。',

  'これまでの事件はPCPDの戦力を減らし、注意を\n'
  + 'そらすことが目的だったのだ。急いで追跡に\n'
  + '向かう。最後に勝つのははたして...',
];

export class TitleScene extends Phaser.Scene {
  private selectedChapter: number = 0;
  private maxUnlockedChapter: number = 0;
  private chapterScores: number[] = [0, 0, 0, 0];
  private cursorText!: Phaser.GameObjects.Text;
  private chapterTexts: Phaser.GameObjects.Text[] = [];
  private briefingText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_TITLE });
  }

  create(): void {
    this.chapterTexts = [];
    this.loadSaveData();

    this.cameras.main.setBackgroundColor('#000000');

    const font: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'SmileBASIC, monospace',
      fontSize: '10px',
      color: '#ffffff',
      resolution: 5,
    };

    // Title
    this.add.text(GAME_WIDTH / 2, 20, 'PCPD - Code 3', {
      ...font,
      fontSize: '16px',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 38, 'Petit City Police Department', {
      ...font,
      fontSize: '8px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Chapter select
    const chapters = [
      'CHAPTER 1: 宝石店強盗',
      'CHAPTER 2: 銀行強盗',
      'CHAPTER 3: アジト急襲',
      'CHAPTER 4: 最終追跡',
    ];

    const startY = 60;
    for (let i = 0; i < chapters.length; i++) {
      const unlocked = i <= this.maxUnlockedChapter;
      const label = unlocked ? chapters[i] : chapters[i] + ' [未開放]';
      const color = unlocked ? '#ffffff' : '#555555';
      const text = this.add.text(40, startY + i * 18, label, {
        ...font,
        fontSize: '10px',
        color,
      });
      this.chapterTexts.push(text);
    }

    // Cursor
    this.cursorText = this.add.text(
      25, startY + this.selectedChapter * 18,
      '', { ...font, color: '#ffff00' },
    );

    // High score display
    this.scoreText = this.add.text(GAME_WIDTH - 20, startY, '', {
      ...font,
      fontSize: '9px',
      color: '#ffff88',
      align: 'right',
    }).setOrigin(1, 0);
    this.updateScoreDisplay();

    // Briefing area
    this.add.text(20, 142, '── BRIEFING ──', {
      ...font,
      fontSize: '8px',
      color: '#668888',
    });

    this.briefingText = this.add.text(20, 155, '', {
      ...font,
      fontSize: '8px',
      color: '#888888',
      lineSpacing: 2,
    });
    this.updateBriefing();

    // Bottom navigation
    this.add.text(GAME_WIDTH / 2, TOTAL_HEIGHT - 42, 'W/S: 選択  ENTER: 決定  B: 実績', {
      ...font,
      fontSize: '8px',
      color: '#888888',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, TOTAL_HEIGHT - 28, 'このゲームには流血等の表現が含まれています', {
      ...font,
      fontSize: '7px',
      color: '#ff4444',
    }).setOrigin(0.5);

    // Version
    this.add.text(GAME_WIDTH - 5, TOTAL_HEIGHT - 5, 'v1.2 Browser Port', {
      ...font,
      fontSize: '7px',
      color: '#444444',
    }).setOrigin(1, 1);

    // Input
    const kb = this.input.keyboard!;
    kb.on('keydown-W', () => this.moveSelection(-1));
    kb.on('keydown-UP', () => this.moveSelection(-1));
    kb.on('keydown-S', () => this.moveSelection(1));
    kb.on('keydown-DOWN', () => this.moveSelection(1));
    kb.on('keydown-ENTER', () => this.startChapter());
    kb.on('keydown-SPACE', () => this.startChapter());
    kb.on('keydown-B', () => this.scene.start(SCENE_ACHIEVEMENT));
  }

  private moveSelection(dir: number): void {
    this.selectedChapter = Phaser.Math.Clamp(
      this.selectedChapter + dir,
      0,
      Math.min(3, this.maxUnlockedChapter),
    );
    this.cursorText.setY(60 + this.selectedChapter * 18);
    this.updateBriefing();
    this.updateScoreDisplay();
  }

  private updateBriefing(): void {
    if (this.selectedChapter <= this.maxUnlockedChapter) {
      this.briefingText.setText(CHAPTER_BRIEFINGS[this.selectedChapter]);
    } else {
      this.briefingText.setText('未開放');
    }
  }

  private updateScoreDisplay(): void {
    const lines: string[] = [];
    for (let i = 0; i < 4; i++) {
      if (i <= this.maxUnlockedChapter) {
        const score = this.chapterScores[i];
        lines.push(score > 0 ? `SCORE: ${score}` : '---');
      } else {
        lines.push('');
      }
    }
    this.scoreText.setText(lines.join('\n'));
    // Set line spacing to match chapter list
    this.scoreText.setLineSpacing(8);
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
        this.maxUnlockedChapter = 0;
        for (let i = 0; i < 4; i++) {
          if (data.chapterUnlocks?.[i]) {
            this.maxUnlockedChapter = i;
          }
        }
        if (data.chapterScores) {
          this.chapterScores = data.chapterScores;
        }
      }
    } catch {
      this.maxUnlockedChapter = 0;
    }
  }
}
