import Phaser from 'phaser';
import { BulletOwner } from '../types';

interface BulletData {
  sprite: Phaser.Physics.Arcade.Sprite;
  active: boolean;
}

export class BulletPool {
  private scene: Phaser.Scene;
  private bullets: BulletData[] = [];
  private currentIndex: number = 0;
  private poolSize: number;
  public group: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, poolSize: number) {
    this.scene = scene;
    this.poolSize = poolSize;
    this.group = scene.physics.add.group({
      allowGravity: false,
    });

    // Pre-create all bullet sprites
    for (let i = 0; i < poolSize; i++) {
      const bullet = scene.physics.add.sprite(-100, -100, 'spritesheet-raw', 'bullet');
      bullet.setOrigin(0.5, 0.5);
      bullet.setVisible(false);
      bullet.setActive(false);
      bullet.setScale(3); // Make bullet visible (original is 1x1 pixel)
      bullet.setDepth(7);

      // Explicitly set physics body size (setScale does NOT resize Arcade bodies)
      const body = bullet.body as Phaser.Physics.Arcade.Body;
      body.setSize(6, 6);
      body.setOffset(-2, -2);
      body.enable = false;

      this.group.add(bullet);
      this.bullets.push({ sprite: bullet, active: false });
    }
  }

  fire(x: number, y: number, angle: number, range: number, damage: number): Phaser.Physics.Arcade.Sprite {
    const bulletData = this.bullets[this.currentIndex];
    const sprite = bulletData.sprite;

    // Reset this bullet
    sprite.setPosition(x, y);
    sprite.setVisible(true);
    sprite.setActive(true);
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(x, y);
    body.setSize(6, 6);
    body.setOffset(-2, -2);
    sprite.setData('damage', damage);
    sprite.setData('isBullet', true); // Mark as bullet for collision detection
    sprite.setData('bulletProcessed', false); // Mark as not yet processed
    bulletData.active = true;

    // Calculate target position based on range
    const distance = range * 15; // Each range unit = 15 pixels
    const targetX = x + Math.cos(angle) * distance;
    const targetY = y + Math.sin(angle) * distance;

    // Calculate speed to cover distance in ~30 frames (0.5 seconds at 60fps)
    const speed = distance / 0.5;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    sprite.setVelocity(vx, vy);

    // Auto-deactivate after travel time (only if still active)
    this.scene.time.delayedCall(500, () => {
      // Check if this specific bullet sprite is still active before deactivating
      if (sprite.active && sprite.visible) {
        this.deactivateBullet(sprite);
      }
    });

    // Advance index (circular buffer)
    this.currentIndex = (this.currentIndex + 1) % this.poolSize;

    return sprite;
  }

  deactivateBullet(index: number): void;
  deactivateBullet(sprite: Phaser.Physics.Arcade.Sprite): void;
  deactivateBullet(arg: number | Phaser.Physics.Arcade.Sprite): void {
    let bulletData: BulletData | undefined;

    if (typeof arg === 'number') {
      bulletData = this.bullets[arg];
    } else {
      bulletData = this.bullets.find(b => b.sprite === arg);
    }

    if (!bulletData) return;

    bulletData.active = false;
    bulletData.sprite.setVisible(false);
    bulletData.sprite.setActive(false);
    bulletData.sprite.setVelocity(0, 0);
    bulletData.sprite.setPosition(-100, -100);
    (bulletData.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
  }

  destroy(): void {
    this.bullets.forEach(b => b.sprite.destroy());
    this.group.destroy(true);
  }
}
