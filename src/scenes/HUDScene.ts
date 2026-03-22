import Phaser from 'phaser';
import {
  SCENE_HUD, GAME_WIDTH, GAME_HEIGHT, HUD_HEIGHT, TOTAL_HEIGHT,
  PLAYER_MAX_HP, COLOR_HP_GREEN, COLOR_HP_YELLOW, COLOR_HP_RED,
} from '../constants';
import { GameScene } from './GameScene';

export class HUDScene extends Phaser.Scene {
  private gameScene!: GameScene;

  // HUD elements
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private radioText!: Phaser.GameObjects.Text;
  private backupText!: Phaser.GameObjects.Text;
  private reloadBar!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: SCENE_HUD });
  }

  init(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;
  }

  create(): void {
    // HUD background
    const bg = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT + HUD_HEIGHT / 2,
      GAME_WIDTH, HUD_HEIGHT,
      0x1a1a2e,
      0.95,
    );
    bg.setDepth(0);

    // Separator line
    const line = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT,
      GAME_WIDTH, 2,
      0x444444,
    );
    line.setDepth(1);

    const hudY = GAME_HEIGHT + 5;
    const fontConfig: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#ffffff',
      resolution: 2,
    };

    // Left panel: Radio log
    this.add.text(5, hudY, '📻 RADIO', {
      ...fontConfig,
      fontSize: '8px',
      color: '#88aaff',
    });
    this.radioText = this.add.text(5, hudY + 12, '', {
      ...fontConfig,
      fontSize: '8px',
      color: '#aaaaaa',
      wordWrap: { width: 140 },
    });

    // Center: HP bar
    const hpBarX = 155;
    this.add.text(hpBarX, hudY, 'HP', {
      ...fontConfig,
      fontSize: '8px',
      color: '#88ff88',
    });
    this.hpBar = this.add.graphics();
    this.hpText = this.add.text(hpBarX + 105, hudY + 12, '100/100', {
      ...fontConfig,
      fontSize: '9px',
    });

    // Reload bar
    this.reloadBar = this.add.graphics();

    // Score
    this.scoreText = this.add.text(hpBarX, hudY + 35, 'SCORE: 0', {
      ...fontConfig,
      fontSize: '10px',
      color: '#ffff88',
    });

    // Right panel: Weapon info
    const wpnX = 300;
    this.weaponText = this.add.text(wpnX, hudY, 'Block17', {
      ...fontConfig,
      fontSize: '10px',
      color: '#ffcc88',
    });
    this.ammoText = this.add.text(wpnX, hudY + 14, '残弾数: 11/11 | 30', {
      ...fontConfig,
      fontSize: '9px',
    });

    // Backup unit info
    this.backupText = this.add.text(wpnX, hudY + 35, 'BACKUP: PCPD', {
      ...fontConfig,
      fontSize: '8px',
      color: '#88ccff',
    });

    // Controls hint at bottom
    this.add.text(5, TOTAL_HEIGHT - 12, 'WASD:移動 Shift:走 R:装填 Q/E:武器 Tab:援護選択 F:応援要請', {
      ...fontConfig,
      fontSize: '7px',
      color: '#555555',
    });
  }

  update(): void {
    if (!this.gameScene || !this.gameScene.player) return;

    const player = this.gameScene.player;
    const hp = player.hp;
    const maxHp = PLAYER_MAX_HP;

    // Update HP bar
    this.hpBar.clear();
    const hpBarX = 155;
    const hpBarY = GAME_HEIGHT + 17;
    const hpBarWidth = 100;
    const hpBarHeight = 8;

    // Background
    this.hpBar.fillStyle(0x333333, 1);
    this.hpBar.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    // Health portion
    const hpRatio = hp / maxHp;
    let hpColor = COLOR_HP_GREEN;
    if (hp <= 20) hpColor = COLOR_HP_RED;
    else if (hp <= 40) hpColor = COLOR_HP_YELLOW;

    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRect(hpBarX, hpBarY, hpBarWidth * hpRatio, hpBarHeight);

    // Border
    this.hpBar.lineStyle(1, 0xffffff, 0.5);
    this.hpBar.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);

    this.hpText.setText(`${hp}/${maxHp}`);

    // Update reload bar
    this.reloadBar.clear();
    if (player.isReloading) {
      const progress = player.reloadProgress / player.weapon.reloadTime;
      const reloadBarY = hpBarY + 12;
      this.reloadBar.fillStyle(0x333333, 1);
      this.reloadBar.fillRect(hpBarX, reloadBarY, hpBarWidth, 4);
      this.reloadBar.fillStyle(0x88ccff, 1);
      this.reloadBar.fillRect(hpBarX, reloadBarY, hpBarWidth * progress, 4);
    }

    // Update score
    this.scoreText.setText(`SCORE: ${this.gameScene.score}`);

    // Update weapon info
    this.weaponText.setText(player.weapon.name);
    const mag = player.currentAmmo;
    const magMax = player.weapon.magazineSize;
    const reserve = player.reserveAmmo;
    this.ammoText.setText(`残弾数: ${mag}/${magMax} | ${reserve}`);

    // Update backup info
    const unitNames = ['PCPD', 'PCSP', 'SWAT'];
    const costs = [100, 200, 500];
    const idx = this.gameScene.selectedBackupUnit;
    this.backupText.setText(`BACKUP: ${unitNames[idx]} (-${costs[idx]}pts)`);

    // Update radio log
    if (this.gameScene.radioSystem) {
      const log = this.gameScene.radioSystem.getLog();
      // Show last 5 lines that fit in the HUD space
      const displayLines = log.slice(-5);
      this.radioText.setText(displayLines.join('\n'));
    }
  }
}
