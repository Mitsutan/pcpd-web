import Phaser from 'phaser';
import { AllyTypeStats } from '../types';
import { TILE_SIZE } from '../constants';

export class Ally {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public weaponSprite: Phaser.GameObjects.Sprite;
  public hp: number;
  public maxHp: number;
  public typeId: string;
  public fireRate: number;
  public fireRange: number;
  public isDead: boolean = false;

  private scene: Phaser.Scene;
  private isMoving: boolean = false;
  private moveTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, stats: AllyTypeStats) {
    this.scene = scene;
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.typeId = stats.typeId;
    this.fireRate = stats.fireRate;
    this.fireRange = stats.fireRange;

    // Choose animation based on type
    let frame: string;
    let walkAnim: string;
    if (stats.typeId === 'PCSP') {
      frame = 'pcsp_51';
      walkAnim = 'pcsp_walk';
    } else if (stats.typeId === 'SWAT') {
      frame = 'swat_61';
      walkAnim = 'swat_walk';
    } else {
      frame = 'player_1'; // PCPD uses same sprites as player (player_0 is armless base)
      walkAnim = 'player_walk';
    }

    this.sprite = scene.physics.add.sprite(x, y, 'spritesheet-raw', frame);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(8);
    this.sprite.setData('ally', this);

    // Weapon sprite
    const weaponFrame = stats.weaponSpriteBase === 20 ? 'rifle_0' : 'handgun_0';
    this.weaponSprite = scene.add.sprite(x, y, 'spritesheet-raw', weaponFrame);
    this.weaponSprite.setOrigin(0.5, 1);
    this.weaponSprite.setDepth(9);

    this.sprite.play(walkAnim);
  }

  update(
    enemies: Array<{ sprite: Phaser.Physics.Arcade.Sprite; isDead: boolean }>,
    fireBulletCallback: (x: number, y: number, angle: number) => void,
  ): void {
    if (this.isDead) return;

    // Find nearest living enemy
    let nearestDist = Infinity;
    let nearestEnemy: { sprite: Phaser.Physics.Arcade.Sprite; isDead: boolean } | null = null;

    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, enemy.sprite.x, enemy.sprite.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestEnemy = enemy;
      }
    }

    if (!nearestEnemy) return;

    // Face nearest enemy
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      nearestEnemy.sprite.x, nearestEnemy.sprite.y,
    );
    this.sprite.setRotation(angle + Math.PI / 2);
    this.weaponSprite.setPosition(this.sprite.x, this.sprite.y);
    this.weaponSprite.setRotation(angle + Math.PI / 2);

    // Fire if in range
    const firePixelRange = this.fireRange * 15 + 75;
    if (nearestDist <= firePixelRange && Phaser.Math.Between(0, this.fireRate - 1) === 0) {
      fireBulletCallback(this.sprite.x, this.sprite.y, angle);
      // Play muzzle flash (all allies use handgun)
      this.weaponSprite.play('handgun_flash');
    }

    // Move toward enemy (1/20 chance when idle)
    if (!this.isMoving && nearestDist >= 50 && Phaser.Math.Between(0, 19) <= 1) {
      this.moveToward(nearestEnemy.sprite.x, nearestEnemy.sprite.y);
    }

    if (this.isMoving) {
      this.moveTimer--;
      if (this.moveTimer <= 0) {
        this.isMoving = false;
        this.sprite.setVelocity(0, 0);
      }
    }
  }

  private moveToward(targetX: number, targetY: number): void {
    this.isMoving = true;
    this.moveTimer = TILE_SIZE;

    const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, targetX, targetY);
    const speed = 60;
    this.sprite.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
    );
  }

  takeDamage(amount: number): boolean {
    if (this.isDead) return false;

    this.hp -= amount;
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  private die(): void {
    this.isDead = true;
    this.weaponSprite.setVisible(false);
    this.sprite.body!.enable = false;

    // Play type-specific death animation
    if (this.typeId === 'PCSP') {
      this.sprite.play('pcsp_death');
    } else if (this.typeId === 'SWAT') {
      this.sprite.play('swat_death');
    } else {
      this.sprite.play('player_death');
    }
  }

  destroy(): void {
    this.sprite.destroy();
    this.weaponSprite.destroy();
  }
}
