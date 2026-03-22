// CQC (Close Quarters Combat) System
// Original: 4 random direction presses within a time limit based on enemy HP
// Timer = 130 - enemy HP frames. Failure = player instant death.
// Browser: arrow keys replaced with WASD directions for consistency

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

export type CQCDirection = 'W' | 'A' | 'S' | 'D';

const DIRECTION_LABELS: Record<CQCDirection, string> = {
  W: '↑',
  A: '←',
  S: '↓',
  D: '→',
};

const DIRECTION_KEYS: CQCDirection[] = ['W', 'A', 'S', 'D'];

export interface CQCResult {
  success: boolean;
}

export class CQCSystem {
  private scene: Phaser.Scene;
  private active: boolean = false;
  private sequence: CQCDirection[] = [];
  private currentIndex: number = 0;
  private timerDuration: number = 0; // ms
  private timerStarted: number = 0;

  // Visual elements
  private overlay!: Phaser.GameObjects.Rectangle;
  private promptText!: Phaser.GameObjects.Text;
  private sequenceText!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Graphics;
  private resultCallback: ((result: CQCResult) => void) | null = null;

  // Key listeners
  private keyListeners: Array<{ key: string; handler: () => void }> = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  get isActive(): boolean {
    return this.active;
  }

  /** Start a CQC encounter. Timer is shorter for higher-HP enemies. */
  start(enemyHp: number, callback: (result: CQCResult) => void): void {
    if (this.active) return;
    this.active = true;
    this.resultCallback = callback;

    // Generate 4 random directions
    this.sequence = [];
    for (let i = 0; i < 4; i++) {
      this.sequence.push(DIRECTION_KEYS[Math.floor(Math.random() * 4)]);
    }
    this.currentIndex = 0;

    // Timer: 130 - enemyHP frames, converted to ms (at 60fps)
    // Clamp to reasonable range: minimum 500ms, maximum 2500ms
    const timerFrames = Math.max(30, 130 - enemyHp);
    this.timerDuration = (timerFrames / 60) * 1000;
    this.timerStarted = this.scene.time.now;

    // Create UI
    this.createUI();

    // Set up key listeners
    this.setupKeys();
  }

  private createUI(): void {
    // Dark overlay
    this.overlay = this.scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0x000000, 0.7,
    );
    this.overlay.setScrollFactor(0);
    this.overlay.setDepth(300);

    // "PUSH!!!" prompt
    this.promptText = this.scene.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40,
      'PUSH!!!',
      {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ff4444',
        resolution: 2,
      },
    );
    this.promptText.setOrigin(0.5);
    this.promptText.setScrollFactor(0);
    this.promptText.setDepth(301);

    // Sequence display
    this.sequenceText = this.scene.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      this.getSequenceDisplay(),
      {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#ffffff',
        resolution: 2,
      },
    );
    this.sequenceText.setOrigin(0.5);
    this.sequenceText.setScrollFactor(0);
    this.sequenceText.setDepth(301);

    // Timer bar
    this.timerBar = this.scene.add.graphics();
    this.timerBar.setScrollFactor(0);
    this.timerBar.setDepth(301);
  }

  private getSequenceDisplay(): string {
    return this.sequence
      .slice(this.currentIndex)
      .map(d => DIRECTION_LABELS[d])
      .join(' ');
  }

  private setupKeys(): void {
    const kb = this.scene.input.keyboard!;

    for (const dir of DIRECTION_KEYS) {
      const keyCode = Phaser.Input.Keyboard.KeyCodes[dir];
      const key = kb.addKey(keyCode, false);
      const handler = () => this.onKeyPress(dir);
      key.on('down', handler);
      this.keyListeners.push({ key: dir, handler });
    }
  }

  private onKeyPress(pressed: CQCDirection): void {
    if (!this.active) return;

    if (pressed === this.sequence[this.currentIndex]) {
      // Correct press
      this.currentIndex++;
      this.sequenceText.setText(this.getSequenceDisplay());

      if (this.currentIndex >= this.sequence.length) {
        // Success!
        this.end(true);
      }
    }
    // Wrong press: no penalty (matching original — only time running out kills you)
  }

  update(): void {
    if (!this.active) return;

    const elapsed = this.scene.time.now - this.timerStarted;
    const ratio = 1 - (elapsed / this.timerDuration);

    // Draw timer bar
    this.timerBar.clear();
    const barWidth = 200;
    const barHeight = 10;
    const barX = GAME_WIDTH / 2 - barWidth / 2;
    const barY = GAME_HEIGHT / 2 + 30;

    // Background
    this.timerBar.fillStyle(0x333333, 1);
    this.timerBar.fillRect(barX, barY, barWidth, barHeight);

    // Fill
    const fillColor = ratio > 0.3 ? 0x00ff00 : 0xff0000;
    this.timerBar.fillStyle(fillColor, 1);
    this.timerBar.fillRect(barX, barY, barWidth * Math.max(0, ratio), barHeight);

    // Time's up
    if (elapsed >= this.timerDuration) {
      this.end(false);
    }
  }

  private end(success: boolean): void {
    this.active = false;

    // Clean up UI
    this.overlay?.destroy();
    this.promptText?.destroy();
    this.sequenceText?.destroy();
    this.timerBar?.destroy();

    // Remove key listeners
    const kb = this.scene.input.keyboard!;
    for (const listener of this.keyListeners) {
      const keyCode = Phaser.Input.Keyboard.KeyCodes[listener.key as keyof typeof Phaser.Input.Keyboard.KeyCodes];
      const key = kb.keys[keyCode];
      if (key) {
        key.off('down', listener.handler);
      }
    }
    this.keyListeners = [];

    // Notify result
    if (this.resultCallback) {
      this.resultCallback({ success });
    }
  }

  destroy(): void {
    if (this.active) {
      this.end(false);
    }
  }
}
