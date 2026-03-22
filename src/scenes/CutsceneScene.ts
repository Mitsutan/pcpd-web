import Phaser from 'phaser';
import { SCENE_CUTSCENE, SCENE_GAME, SCENE_TITLE, GAME_WIDTH, TOTAL_HEIGHT } from '../constants';

interface CutsceneCommand {
  type: 'text' | 'wait' | 'fade' | 'clear';
  text?: string;
  duration?: number;
  color?: string;
}

export class CutsceneScene extends Phaser.Scene {
  private commands: CutsceneCommand[] = [];
  private commandIndex: number = 0;
  private textObject!: Phaser.GameObjects.Text;
  private skipHeld: boolean = false;
  private targetScene: string = SCENE_TITLE;
  private targetData: Record<string, unknown> = {};

  constructor() {
    super({ key: SCENE_CUTSCENE });
  }

  init(data: {
    commands?: CutsceneCommand[];
    targetScene?: string;
    targetData?: Record<string, unknown>;
  }): void {
    this.commands = data.commands || [];
    this.commandIndex = 0;
    this.targetScene = data.targetScene || SCENE_TITLE;
    this.targetData = data.targetData || {};
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // Letterbox bars
    this.add.rectangle(GAME_WIDTH / 2, 15, GAME_WIDTH, 30, 0x000000).setDepth(100);
    this.add.rectangle(GAME_WIDTH / 2, TOTAL_HEIGHT - 15, GAME_WIDTH, 30, 0x000000).setDepth(100);

    // Text display area
    this.textObject = this.add.text(GAME_WIDTH / 2, TOTAL_HEIGHT - 50, '', {
      fontFamily: 'SmileBASIC, monospace',
      fontSize: '10px',
      color: '#ffffff',
      wordWrap: { width: 360 },
      align: 'center',
    }).setOrigin(0.5).setDepth(101);

    // Skip hint
    this.add.text(GAME_WIDTH - 10, 5, 'Hold SPACE to skip', {
      fontFamily: 'SmileBASIC, monospace',
      fontSize: '7px',
      color: '#555555',
    }).setOrigin(1, 0).setDepth(101);

    // Process commands
    this.processNextCommand();
  }

  update(): void {
    // Hold space to skip
    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (space?.isDown) {
      this.skipHeld = true;
      this.finishCutscene();
    }
  }

  private processNextCommand(): void {
    if (this.commandIndex >= this.commands.length) {
      this.finishCutscene();
      return;
    }

    const cmd = this.commands[this.commandIndex];
    this.commandIndex++;

    switch (cmd.type) {
      case 'text':
        this.typewriterText(cmd.text || '', () => {
          this.time.delayedCall(cmd.duration || 1500, () => this.processNextCommand());
        });
        break;
      case 'wait':
        this.time.delayedCall(cmd.duration || 1000, () => this.processNextCommand());
        break;
      case 'fade':
        this.cameras.main.fade(cmd.duration || 500, 0, 0, 0, false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
          if (progress >= 1) this.processNextCommand();
        });
        break;
      case 'clear':
        this.textObject.setText('');
        this.processNextCommand();
        break;
    }
  }

  private typewriterText(text: string, onComplete: () => void): void {
    this.textObject.setText('');
    let index = 0;

    const timer = this.time.addEvent({
      delay: 50,
      callback: () => {
        index++;
        this.textObject.setText(text.substring(0, index));
        if (index >= text.length) {
          timer.destroy();
          onComplete();
        }
      },
      loop: true,
    });
  }

  private finishCutscene(): void {
    this.scene.start(this.targetScene, this.targetData);
  }
}
