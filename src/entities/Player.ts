import Phaser from 'phaser';
import { PLAYER_MAX_HP, PLAYER_START_AMMO, PLAYER_BASE_SPEED, PLAYER_DASH_MULTIPLIER, PLAYER_SIGHT_SPEED_MULTIPLIER } from '../constants';
import { WEAPONS } from '../data/weapons';
import { WeaponStats } from '../types';

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public weaponSprite: Phaser.GameObjects.Sprite;

  public hp: number = PLAYER_MAX_HP;
  public reserveAmmo: number = PLAYER_START_AMMO;
  public currentWeaponIndex: number = 0;
  public magazine: number[] = [];
  public isReloading: boolean = false;
  public reloadProgress: number = 0;
  public sightMode: boolean = false;
  public facingAngle: number = 0;

  // Stats tracking
  public shotsFired: number = 0;
  public shotsHit: number = 0;
  public pickedUpAmmo: boolean = false;
  public calledBackup: boolean = false;

  private scene: Phaser.Scene;
  private lastFireTime: number = 0;
  private fireHeld: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    // Create player sprite
    this.sprite = scene.physics.add.sprite(x, y, 'spritesheet-raw', 'player_0');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(10);
    this.sprite.setCollideWorldBounds(true);

    // Create weapon sprite (attached to player)
    this.weaponSprite = scene.add.sprite(x, y, 'spritesheet-raw', 'handgun_0');
    this.weaponSprite.setOrigin(0.5, 1);
    this.weaponSprite.setDepth(11);

    // Initialize magazine for each weapon
    for (let i = 0; i < WEAPONS.length; i++) {
      this.magazine[i] = i === 0 ? WEAPONS[0].magazineSize : -1;
    }
  }

  get weapon(): WeaponStats {
    return WEAPONS[this.currentWeaponIndex];
  }

  get currentAmmo(): number {
    return this.magazine[this.currentWeaponIndex];
  }

  set currentAmmo(val: number) {
    this.magazine[this.currentWeaponIndex] = val;
  }

  get isAlive(): boolean {
    return this.hp > 0;
  }

  update(
    moveX: number,
    moveY: number,
    aimAngle: number,
    dash: boolean,
    sight: boolean,
  ): void {
    if (!this.isAlive) return;

    this.sightMode = sight;
    this.facingAngle = aimAngle;

    // Calculate speed with modifiers
    let speed = PLAYER_BASE_SPEED;
    if (dash && !sight) speed *= PLAYER_DASH_MULTIPLIER;
    if (sight) speed *= PLAYER_SIGHT_SPEED_MULTIPLIER;
    speed *= this.weapon.speedModifier;

    // Apply movement
    const vx = moveX * speed * 60; // Convert to px/sec for Phaser physics
    const vy = moveY * speed * 60;
    this.sprite.setVelocity(vx, vy);

    // Rotate player to face mouse
    this.sprite.setRotation(aimAngle + Math.PI / 2);

    // Update weapon sprite position and rotation
    this.weaponSprite.setPosition(this.sprite.x, this.sprite.y);
    this.weaponSprite.setRotation(aimAngle + Math.PI / 2);

    // Play walk/idle animation
    if (moveX !== 0 || moveY !== 0) {
      if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim?.key !== 'player_walk') {
        this.sprite.play('player_walk');
      }
    } else {
      this.sprite.play('player_idle', true);
    }

    // Update reload progress
    if (this.isReloading) {
      this.reloadProgress++;
      if (this.reloadProgress >= this.weapon.reloadTime) {
        this.finishReload();
      }
    }
  }

  canFire(shootPressed: boolean, shootHeld: boolean): boolean {
    if (!this.isAlive || this.isReloading) return false;
    if (this.currentAmmo <= 0) return false;

    const now = this.scene.time.now;
    const fireInterval = this.weapon.fireMode === 'auto' ? 100 : 250;

    if (this.weapon.fireMode === 'semi') {
      // Semi-auto: fire on press only
      if (!shootPressed) return false;
      if (now - this.lastFireTime < fireInterval) return false;
    } else {
      // Auto: fire while held
      if (!shootHeld) return false;
      if (now - this.lastFireTime < fireInterval) return false;
    }

    return true;
  }

  fire(): void {
    this.currentAmmo--;
    this.shotsFired++;
    this.lastFireTime = this.scene.time.now;

    // Play muzzle flash animation
    const flashAnims = ['handgun_flash', 'rifle_flash', 'sniper_flash', 'baton_swing'];
    const animKey = flashAnims[this.currentWeaponIndex] || 'handgun_flash';
    this.weaponSprite.play(animKey);
  }

  startReload(): void {
    if (this.isReloading) return;
    if (this.reserveAmmo <= 0) return;
    if (this.currentAmmo >= this.weapon.magazineSize) return;

    this.isReloading = true;
    this.reloadProgress = 0;
  }

  private finishReload(): void {
    const needed = this.weapon.magazineSize - this.currentAmmo;
    const toLoad = Math.min(needed, this.reserveAmmo);
    this.currentAmmo += toLoad;
    this.reserveAmmo -= toLoad;
    this.isReloading = false;
    this.reloadProgress = 0;
  }

  switchWeapon(index: number): void {
    if (index < 0 || index >= WEAPONS.length) return;
    if (index === this.currentWeaponIndex) return;

    this.isReloading = false;
    this.reloadProgress = 0;
    this.currentWeaponIndex = index;

    // Auto-load magazine if weapon has never been loaded (-1)
    if (this.magazine[index] === -1) {
      const toLoad = Math.min(WEAPONS[index].magazineSize, this.reserveAmmo);
      this.magazine[index] = toLoad;
      this.reserveAmmo -= toLoad;
    }

    // Update weapon sprite frame
    this.updateWeaponSprite();
  }

  private updateWeaponSprite(): void {
    const prefixes = ['handgun', 'rifle', 'sniper', 'baton'];
    const prefix = prefixes[this.currentWeaponIndex] || 'handgun';
    this.weaponSprite.setFrame(`${prefix}_0`);
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  destroy(): void {
    this.sprite.destroy();
    this.weaponSprite.destroy();
  }
}
