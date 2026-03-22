import Phaser from 'phaser';

export interface InputState {
  moveX: number;       // -1 to 1
  moveY: number;       // -1 to 1
  aimAngle: number;    // radians
  shoot: boolean;      // fire button held
  shootJustDown: boolean; // fire button just pressed this frame
  dash: boolean;       // sprint held
  reload: boolean;     // reload held
  sightToggle: boolean; // sight mode just toggled
  weaponNext: boolean; // next weapon
  weaponPrev: boolean; // prev weapon
  backupSelect: boolean; // cycle backup unit
  backupCall: boolean;   // call backup
}

export class InputManager {
  private scene: Phaser.Scene;
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    SHIFT: Phaser.Input.Keyboard.Key;
    R: Phaser.Input.Keyboard.Key;
    Q: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    F: Phaser.Input.Keyboard.Key;
    TAB: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    ONE: Phaser.Input.Keyboard.Key;
    TWO: Phaser.Input.Keyboard.Key;
    THREE: Phaser.Input.Keyboard.Key;
  };
  private sightActive = false;
  private prevRightClick = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createKeys();
  }

  private createKeys(): void {
    const kb = this.scene.input.keyboard!;
    this.keys = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SHIFT: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      R: kb.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      Q: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      E: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      F: kb.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      TAB: kb.addKey(Phaser.Input.Keyboard.KeyCodes.TAB),
      SPACE: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ONE: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: kb.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: kb.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    };

    // Prevent Tab and Space from triggering browser defaults (focus switch, scroll)
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab' || (e.key === ' ' && e.target === document.body)) {
        e.preventDefault();
      }
    });

    // Disable context menu for right-click sight toggle
    this.scene.game.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  getState(): InputState {
    let moveX = 0;
    let moveY = 0;

    if (this.keys.A.isDown) moveX -= 1;
    if (this.keys.D.isDown) moveX += 1;
    if (this.keys.W.isDown) moveY -= 1;
    if (this.keys.S.isDown) moveY += 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= len;
      moveY /= len;
    }

    // Aim angle from player (screen center) to mouse pointer
    const pointer = this.scene.input.activePointer;
    const cam = this.scene.cameras.main;
    const aimAngle = Phaser.Math.Angle.Between(
      cam.worldView.centerX,
      cam.worldView.centerY,
      pointer.worldX,
      pointer.worldY,
    );

    // Right-click toggles sight mode
    const rightDown = pointer.rightButtonDown();
    let sightToggle = false;
    if (rightDown && !this.prevRightClick) {
      this.sightActive = !this.sightActive;
      sightToggle = true;
    }
    this.prevRightClick = rightDown;

    const shoot = pointer.leftButtonDown() || this.keys.SPACE.isDown;
    const shootJustDown = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
      (pointer.leftButtonDown() && pointer.getDuration() < 50);

    // Weapon switch by number keys
    let weaponNext = Phaser.Input.Keyboard.JustDown(this.keys.E);
    let weaponPrev = Phaser.Input.Keyboard.JustDown(this.keys.Q);

    return {
      moveX,
      moveY,
      aimAngle,
      shoot,
      shootJustDown,
      dash: this.keys.SHIFT.isDown,
      reload: this.keys.R.isDown,
      sightToggle,
      weaponNext,
      weaponPrev,
      backupSelect: Phaser.Input.Keyboard.JustDown(this.keys.TAB),
      backupCall: Phaser.Input.Keyboard.JustDown(this.keys.F),
    };
  }

  isSightActive(): boolean {
    return this.sightActive;
  }

  setSightActive(active: boolean): void {
    this.sightActive = active;
  }

  getWeaponNumberKey(): number | null {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) return 0;
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) return 1;
    if (Phaser.Input.Keyboard.JustDown(this.keys.THREE)) return 2;
    return null;
  }
}
