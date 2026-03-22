import Phaser from 'phaser';
import { EnemyTypeStats, EnemyTypeId } from '../types';
import { TILE_SIZE } from '../constants';

export class Enemy {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public weaponSprite: Phaser.GameObjects.Sprite;
  public hp: number;
  public maxHp: number;
  public typeId: EnemyTypeId;
  public fireRate: number;
  public fireRange: number;
  public patrolAxis: 'vertical' | 'horizontal';
  public isDead: boolean = false;
  public isArrested: boolean = false;
  public ammoPickedUp: boolean = false;

  private scene: Phaser.Scene;
  private isPatrolling: boolean = false;
  private patrolTimer: number = 0;
  private patrolDirection: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, stats: EnemyTypeStats) {
    this.scene = scene;
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.typeId = stats.typeId;
    this.fireRate = stats.fireRate;
    this.fireRange = stats.fireRange;
    this.patrolAxis = stats.patrolAxis;

    // Use the boss sprite if it's a boss
    const frame = stats.typeId === 99 ? 'enemy_116' : 'enemy_111';

    this.sprite = scene.physics.add.sprite(x, y, 'spritesheet-raw', frame);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(8);
    this.sprite.setData('enemy', this);

    // Weapon sprite
    this.weaponSprite = scene.add.sprite(x, y, 'spritesheet-raw', 'handgun_0');
    this.weaponSprite.setOrigin(0.5, 1);
    this.weaponSprite.setDepth(9);

    this.sprite.play('enemy_walk');
  }

  update(
    playerX: number,
    playerY: number,
    allies: Array<{ sprite: Phaser.Physics.Arcade.Sprite; isDead: boolean }>,
    fireBulletCallback: (x: number, y: number, angle: number) => void,
  ): void {
    if (this.isDead || this.isArrested) return;

    // Find nearest target (player or ally)
    let nearestDist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, playerX, playerY);
    let targetX = playerX;
    let targetY = playerY;

    for (const ally of allies) {
      if (ally.isDead) continue;
      const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, ally.sprite.x, ally.sprite.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        targetX = ally.sprite.x;
        targetY = ally.sprite.y;
      }
    }

    // Face target
    const angle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, targetX, targetY);
    this.sprite.setRotation(angle + Math.PI / 2);
    this.weaponSprite.setPosition(this.sprite.x, this.sprite.y);
    this.weaponSprite.setRotation(angle + Math.PI / 2);

    // Fire if in range
    if (nearestDist <= 100 && Phaser.Math.Between(0, this.fireRate - 1) === 0) {
      fireBulletCallback(this.sprite.x, this.sprite.y, angle);
      // Play muzzle flash
      this.weaponSprite.play('handgun_flash');
    }

    // Patrol movement
    if (!this.isPatrolling && Phaser.Math.Between(0, 249) === 0) {
      this.startPatrol();
    }

    if (this.isPatrolling) {
      this.patrolTimer--;
      const speed = 1;
      if (this.patrolAxis === 'vertical') {
        this.sprite.y += speed * this.patrolDirection;
      } else {
        this.sprite.x += speed * this.patrolDirection;
      }

      if (this.patrolTimer <= 0) {
        this.isPatrolling = false;
        this.patrolDirection *= -1;
      }
    }
  }

  private startPatrol(): void {
    this.isPatrolling = true;
    this.patrolTimer = TILE_SIZE;
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

  arrest(): void {
    this.isArrested = true;
    this.isDead = true;
    this.sprite.play('enemy_death');
    this.weaponSprite.setVisible(false);
    this.sprite.body!.enable = false;
  }

  private die(): void {
    this.isDead = true;
    this.weaponSprite.setVisible(false);
    this.sprite.body!.enable = false;

    this.sprite.play('enemy_kill');
  }

  destroy(): void {
    this.sprite.destroy();
    this.weaponSprite.destroy();
  }
}
