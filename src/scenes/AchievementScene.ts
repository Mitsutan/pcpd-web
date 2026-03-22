import Phaser from 'phaser';
import { SCENE_ACHIEVEMENT, SCENE_TITLE, GAME_WIDTH, TOTAL_HEIGHT } from '../constants';

interface AchievementDef {
  index: number;
  name: string;
  description: string;
}

const ACHIEVEMENTS: AchievementDef[] = [
  { index: 0, name: '税金節約', description: '命中率100%' },
  { index: 1, name: '豪運の持ち主', description: '一度も被弾せずにCode 4' },
  { index: 2, name: '現場保存', description: '敵が落とした弾を拾わずにCode 4' },
  { index: 3, name: '無謀な英雄', description: '一度も応援要請をせずにCode 4' },
  { index: 4, name: '平和主義者', description: '一度も発砲せずにCode 4' },
  { index: 5, name: '最善の結果', description: '1名も死者をださずにCode 4' },
];

const SECRET_ACHIEVEMENT = {
  index: 6,
  name: 'THANK YOU!',
  description:
    'このメッセージが表示されるほどに私のゲームを遊んでくださり、' +
    '本当にありがとうございます!',
};

export class AchievementScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_ACHIEVEMENT });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#200000');

    const font: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
      resolution: 2,
    };

    this.add.text(GAME_WIDTH / 2, 20, 'ACHIEVEMENT', {
      ...font,
      fontSize: '16px',
      color: '#ff8888',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 38, '──────────────────────────', {
      ...font,
      fontSize: '8px',
      color: '#666666',
    }).setOrigin(0.5);

    // Load save data
    let achievements: boolean[] = [false, false, false, false, false, false, false];
    try {
      const raw = localStorage.getItem('pcpd_save');
      if (raw) {
        const save = JSON.parse(raw);
        if (save.achievements) {
          achievements = save.achievements;
        }
      }
    } catch { /* ignore */ }

    // Check secret achievement unlock
    if (!achievements[6] && achievements.slice(0, 6).every(a => a)) {
      achievements[6] = true;
      try {
        const raw = localStorage.getItem('pcpd_save');
        if (raw) {
          const save = JSON.parse(raw);
          save.achievements[6] = true;
          localStorage.setItem('pcpd_save', JSON.stringify(save));
        }
      } catch { /* ignore */ }
    }

    const startY = 55;
    const lineH = 28;

    for (let i = 0; i < ACHIEVEMENTS.length; i++) {
      const a = ACHIEVEMENTS[i];
      const unlocked = achievements[a.index];

      if (unlocked) {
        this.add.text(30, startY + i * lineH, `[${a.name}]`, {
          ...font,
          color: '#ffff88',
        });
        this.add.text(30, startY + i * lineH + 13, a.description, {
          ...font,
          fontSize: '8px',
          color: '#aaaaaa',
        });
      } else {
        this.add.text(30, startY + i * lineH, '[ ??? ]', {
          ...font,
          color: '#444444',
        });
        this.add.text(30, startY + i * lineH + 13, '未解放', {
          ...font,
          fontSize: '8px',
          color: '#333333',
        });
      }
    }

    // Secret achievement
    const secretY = startY + ACHIEVEMENTS.length * lineH + 5;
    if (achievements[6]) {
      this.add.text(30, secretY, `[${SECRET_ACHIEVEMENT.name}]`, {
        ...font,
        color: '#ff88ff',
      });
      this.add.text(30, secretY + 13, SECRET_ACHIEVEMENT.description, {
        ...font,
        fontSize: '8px',
        color: '#ccaacc',
        wordWrap: { width: 340 },
      });
    } else {
      this.add.text(30, secretY, '[ ??? ]', {
        ...font,
        color: '#444444',
      });
    }

    // Navigation
    this.add.text(GAME_WIDTH / 2, TOTAL_HEIGHT - 15, 'ESC: 戻る', {
      ...font,
      fontSize: '9px',
      color: '#888888',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start(SCENE_TITLE);
    });
  }
}
