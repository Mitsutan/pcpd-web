import Phaser from 'phaser';
import {
  SCENE_SCORE, SCENE_TITLE, SCENE_GAME,
  GAME_WIDTH, TOTAL_HEIGHT, GRADES,
} from '../constants';

interface ScoreData {
  chapter: number;
  score: number;
  hitRate: number;
  deathCount: number;
  arrestCount: number;
  playerHp: number;
  elapsed: number;
  shotsFired: number;
  shotsHit: number;
  pickedUpAmmo: boolean;
  calledBackup: boolean;
}

export class ScoreScene extends Phaser.Scene {
  private scoreData!: ScoreData;

  constructor() {
    super({ key: SCENE_SCORE });
  }

  init(data: ScoreData): void {
    this.scoreData = data;
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    const d = this.scoreData;

    // Calculate final score (matching original formula)
    const hitRate = d.shotsFired > 0 ? d.shotsHit / d.shotsFired : 0;
    const finalScore = d.score
      + Math.floor(hitRate * 500)
      - (d.deathCount * 10)
      + d.playerHp * 50
      - Math.floor(d.elapsed / 100)
      + d.arrestCount * 800;

    // Determine grade
    let grade = 'F';
    for (const g of GRADES) {
      if (finalScore >= g.minScore) {
        grade = g.grade;
        break;
      }
    }

    const font: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
      resolution: 2,
    };

    // Header
    this.add.text(GAME_WIDTH / 2, 20, 'MISSION COMPLETE', {
      ...font,
      fontSize: '16px',
      color: '#88ff88',
    }).setOrigin(0.5);

    // Incident report style
    this.add.text(GAME_WIDTH / 2, 50, '-- 事件報告書 --', {
      ...font,
      fontSize: '11px',
      color: '#ffff88',
    }).setOrigin(0.5);

    // Stats
    const startY = 80;
    const lineH = 18;
    const lines = [
      `基本スコア:        ${d.score}`,
      `命中率:            ${Math.floor(hitRate * 100)}% (${d.shotsHit}/${d.shotsFired})`,
      `命中ボーナス:      +${Math.floor(hitRate * 500)}`,
      `殺害数:            ${d.deathCount} (-${d.deathCount * 10})`,
      `逮捕数:            ${d.arrestCount} (+${d.arrestCount * 800})`,
      `残HP:              ${d.playerHp} (+${d.playerHp * 50})`,
      `経過時間:          ${Math.floor(d.elapsed / 1000)}秒 (-${Math.floor(d.elapsed / 100)})`,
      ``,
      `最終スコア:        ${finalScore}`,
    ];

    for (let i = 0; i < lines.length; i++) {
      this.add.text(60, startY + i * lineH, lines[i], font);
    }

    // Grade
    const gradeColors: Record<string, string> = {
      S: '#ffff00', A: '#88ff88', B: '#88ccff',
      C: '#ffffff', D: '#ffaa88', E: '#ff8888', F: '#ff4444',
    };
    this.add.text(GAME_WIDTH - 60, startY + 2 * lineH, grade, {
      ...font,
      fontSize: '48px',
      color: gradeColors[grade] || '#ffffff',
    }).setOrigin(0.5);

    // Save high score
    this.saveScore(d.chapter, finalScore);

    // Check achievements
    this.checkAchievements(d, hitRate);

    // Navigation
    this.add.text(GAME_WIDTH / 2, TOTAL_HEIGHT - 20, 'ENTER: タイトルへ', {
      ...font,
      fontSize: '10px',
      color: '#888888',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start(SCENE_TITLE);
    });
  }

  private saveScore(chapter: number, score: number): void {
    try {
      const raw = localStorage.getItem('pcpd_save');
      const save = raw ? JSON.parse(raw) : {
        chapterUnlocks: [true, false, false, false],
        chapterScores: [0, 0, 0, 0],
        exWeaponUnlock: false,
        achievements: [false, false, false, false, false, false, false],
      };

      // Unlock next chapter
      if (chapter < 4) {
        save.chapterUnlocks[chapter] = true;
      }

      // Update high score
      const idx = chapter - 1;
      if (score > save.chapterScores[idx]) {
        save.chapterScores[idx] = score;
      }

      localStorage.setItem('pcpd_save', JSON.stringify(save));
    } catch {
      // localStorage unavailable
    }
  }

  private checkAchievements(d: ScoreData, hitRate: number): void {
    try {
      const raw = localStorage.getItem('pcpd_save');
      if (!raw) return;
      const save = JSON.parse(raw);

      // Achievement checks (matching original indices 20-25)
      if (hitRate >= 1.0 && d.shotsFired > 0) save.achievements[0] = true; // 100% hit rate
      if (d.playerHp >= 100) save.achievements[1] = true;                  // No damage
      if (!d.pickedUpAmmo) save.achievements[2] = true;                    // No ammo pickup
      if (!d.calledBackup) save.achievements[3] = true;                    // No backup
      if (d.shotsFired === 0) save.achievements[4] = true;                // No shots fired
      if (d.deathCount === 0) save.achievements[5] = true;                // Zero casualties

      // Meta achievement: all others unlocked
      if (save.achievements.slice(0, 6).every((a: boolean) => a)) {
        save.achievements[6] = true;
      }

      localStorage.setItem('pcpd_save', JSON.stringify(save));
    } catch {
      // localStorage unavailable
    }
  }
}
