import Phaser from 'phaser';

export class MapObject {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public hp: number;
  public objectType: string;
  public isIndestructible: boolean;
  public isDead: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    hp: number,
    rotation: number = 0,
  ) {
    this.objectType = type;
    this.hp = hp;
    this.isIndestructible = hp === -999;

    // Determine the texture frame
    let frame = type;

    this.sprite = scene.physics.add.staticSprite(x, y, 'spritesheet-raw', frame);
    this.sprite.setOrigin(0, 0);

    if (rotation !== 0) {
      this.sprite.setAngle(rotation);
    }

    // Set physics body size based on sprite
    this.sprite.refreshBody();
    this.sprite.setDepth(5);

    // Store reference to this object on the sprite
    this.sprite.setData('mapObject', this);

    // Play siren animation for police vehicles
    if (type === 'police_car_0') {
      this.sprite.play('police_car_siren');
    } else if (type === 'pcsp_car_0') {
      this.sprite.play('pcsp_car_siren');
    } else if (type === 'swat_car_0') {
      this.sprite.play('swat_car_siren');
    }
  }

  takeDamage(amount: number): boolean {
    if (this.isIndestructible || this.isDead) return false;

    this.hp -= amount;
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  private die(): void {
    this.isDead = true;

    // Vehicle explosion
    if (this.objectType.includes('car')) {
      this.sprite.play('car_explode');
      this.sprite.once('animationcomplete', () => {
        this.sprite.setAlpha(0.5);
      });
    } else {
      // Drum cans etc just disappear
      this.sprite.setAlpha(0.3);
    }

    // Disable physics body
    this.sprite.body!.enable = false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
