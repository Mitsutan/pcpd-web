import Phaser from 'phaser';
import {
  SCENE_GAME, SCENE_HUD, SCENE_GAMEOVER, SCENE_SCORE,
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT,
  PLAYER_BULLET_POOL_SIZE, ALLY_BULLET_POOL_SIZE, ENEMY_BULLET_POOL_SIZE,
  BACKUP_COOLDOWN_FRAMES,
} from '../constants';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Ally } from '../entities/Ally';
import { MapObject } from '../entities/MapObject';
import { InputManager } from '../systems/InputManager';
import { BulletPool } from '../systems/BulletPool';
import { CQCSystem } from '../systems/CQCSystem';
import { RadioSystem } from '../systems/RadioSystem';
import { MAPS, ParsedMap } from '../data/maps';
import { getEnemyStats } from '../data/enemies';
import { getAllyStats } from '../data/allies';

export class GameScene extends Phaser.Scene {
  // Entities
  public player!: Player;
  public enemies: Enemy[] = [];
  public allies: Ally[] = [];
  public mapObjects: MapObject[] = [];

  // Physics groups for group-vs-group overlap
  public enemyGroup!: Phaser.Physics.Arcade.Group;
  public allyGroup!: Phaser.Physics.Arcade.Group;

  // Systems
  private inputManager!: InputManager;
  public playerBullets!: BulletPool;
  public allyBullets!: BulletPool;
  public enemyBullets!: BulletPool;
  public cqcSystem!: CQCSystem;
  public radioSystem!: RadioSystem;

  // Map object physics group (for collision)
  public mapObjectGroup!: Phaser.Physics.Arcade.StaticGroup;

  // Game state
  public score: number = 0;
  public deathCount: number = 0;
  public arrestCount: number = 0;
  public startTime: number = 0;
  public chapterId: number = 1;
  private mapData!: ParsedMap;

  // Backup system
  public selectedBackupUnit: number = 0; // 0=PCPD, 1=PCSP, 2=SWAT
  private lastBackupTime: number = 0;

  // Damage flash overlay
  private damageOverlay!: Phaser.GameObjects.Rectangle;

  // Guards against duplicate game-end calls
  private gameEnding: boolean = false;

  // Track which enemies have already been CQC'd (prevent re-trigger)
  private cqcTarget: Enemy | null = null;

  // Sight mode overlay + laser
  private scopeOverlay!: Phaser.GameObjects.Graphics;
  private laserGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: SCENE_GAME });
  }

  init(data: { chapter?: number }): void {
    this.chapterId = data.chapter ?? 1;
  }

  create(): void {
    // Reset state
    this.enemies = [];
    this.allies = [];
    this.mapObjects = [];
    this.score = 0;
    this.deathCount = 0;
    this.arrestCount = 0;
    this.selectedBackupUnit = 0;
    this.lastBackupTime = 0;
    this.gameEnding = false;
    this.cqcTarget = null;

    // Load map data
    this.mapData = MAPS[this.chapterId];
    if (!this.mapData) {
      console.error(`Map ${this.chapterId} not found`);
      return;
    }

    // Set up world bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Set camera viewport (upper portion of screen)
    this.cameras.main.setViewport(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Draw a simple grid background as the map floor
    this.createBackground();

    // Static group for collision
    this.mapObjectGroup = this.physics.add.staticGroup();

    // Create physics groups for enemies and allies (for group-vs-group overlap)
    this.enemyGroup = this.physics.add.group({ allowGravity: false });
    this.allyGroup = this.physics.add.group({ allowGravity: false });

    // Create bullet pools
    this.playerBullets = new BulletPool(this, PLAYER_BULLET_POOL_SIZE);
    this.allyBullets = new BulletPool(this, ALLY_BULLET_POOL_SIZE);
    this.enemyBullets = new BulletPool(this, ENEMY_BULLET_POOL_SIZE);

    // Create systems
    this.cqcSystem = new CQCSystem(this);
    this.radioSystem = new RadioSystem();

    // Create player at map start position
    const playerStartX = WORLD_WIDTH / 2;
    const playerStartY = WORLD_HEIGHT / 2;
    this.player = new Player(this, playerStartX, playerStartY);

    // Camera follows player
    this.cameras.main.startFollow(this.player.sprite, true, 1, 1);

    // Create map objects
    this.placeMapObjects();

    // Create enemies
    this.placeEnemies();

    // Create allies
    this.placeAllies();

    // Set up collision
    this.setupCollisions();

    // Input manager
    this.inputManager = new InputManager(this);

    // Damage overlay (covers the gameplay viewport)
    this.damageOverlay = this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      GAME_WIDTH, GAME_HEIGHT,
      0xff0000,
      0,
    );
    this.damageOverlay.setScrollFactor(0);
    this.damageOverlay.setDepth(100);

    // Scope overlay for sight mode (FOV restriction, hidden by default)
    this.scopeOverlay = this.add.graphics();
    this.scopeOverlay.setScrollFactor(0);
    this.scopeOverlay.setDepth(99);
    this.scopeOverlay.setVisible(false);

    // Laser sight (weapon range indicator, always visible, drawn in world space)
    this.laserGraphics = this.add.graphics();
    this.laserGraphics.setDepth(7); // Below sprites but above floor

    // Launch HUD scene in parallel
    this.scene.launch(SCENE_HUD, { gameScene: this });

    // Record start time
    this.startTime = this.time.now;

    // Ready animation
    this.showReadyAnimation();
  }

  update(): void {
    // Update CQC system even when game is paused for QTE
    if (this.cqcSystem.isActive) {
      this.cqcSystem.update();
      return; // Freeze everything else during CQC
    }

    if (!this.player.isAlive || this.gameEnding) return;

    const input = this.inputManager.getState();

    // Compute aim angle: auto-aim at nearest enemy in sight mode, otherwise mouse
    let aimAngle = input.aimAngle;
    if (this.inputManager.isSightActive()) {
      const autoAimAngle = this.findNearestEnemyAngle();
      if (autoAimAngle !== null) {
        aimAngle = autoAimAngle;
      }
    }

    // Update scope overlay visibility
    this.scopeOverlay.setVisible(this.inputManager.isSightActive());
    if (this.inputManager.isSightActive()) {
      this.drawScopeOverlay(aimAngle);
    }

    // Always draw laser sight (weapon range indicator)
    this.drawLaser(aimAngle);

    // Handle weapon switch
    const weaponKey = this.inputManager.getWeaponNumberKey();
    if (weaponKey !== null) {
      this.player.switchWeapon(weaponKey);
    }
    if (input.weaponNext) {
      this.player.switchWeapon((this.player.currentWeaponIndex + 1) % 3);
    }
    if (input.weaponPrev) {
      this.player.switchWeapon((this.player.currentWeaponIndex + 2) % 3);
    }

    // Handle reload
    if (input.reload) {
      this.player.startReload();
    }

    // Handle shooting
    if (this.player.canFire(input.shootJustDown, input.shoot)) {
      this.firePlayerBullet();
    }

    // Handle backup
    if (input.backupSelect) {
      this.selectedBackupUnit = (this.selectedBackupUnit + 1) % 3;
    }
    if (input.backupCall) {
      this.callBackup();
    }

    // Update player
    this.player.update(
      input.moveX,
      input.moveY,
      aimAngle,
      input.dash,
      this.inputManager.isSightActive(),
    );

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(
        this.player.sprite.x,
        this.player.sprite.y,
        this.allies,
        (x, y, angle) => this.fireEnemyBullet(x, y, angle),
      );
    }

    // Update allies
    for (const ally of this.allies) {
      ally.update(
        this.enemies,
        (x, y, angle) => this.fireAllyBullet(x, y, angle),
      );
    }

    // Check ammo pickup: walk over dead enemies to collect ammo
    this.checkAmmoPickup();

    // Check victory condition: all enemies dead
    const allEnemiesDead = this.enemies.length > 0 && this.enemies.every(e => e.isDead);
    if (allEnemiesDead) {
      this.onVictory();
    }

    // Low HP screen effect
    if (this.player.hp <= 20 && this.player.hp > 0) {
      this.damageOverlay.setAlpha(0.15 + Math.sin(this.time.now / 200) * 0.1);
    }
  }

  private createBackground(): void {
    const graphics = this.add.graphics();
    graphics.setDepth(0);

    // Floor
    graphics.fillStyle(0x3a3a3a, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Grid lines
    graphics.lineStyle(1, 0x444444, 0.3);
    for (let x = 0; x <= WORLD_WIDTH; x += TILE_SIZE) {
      graphics.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += TILE_SIZE) {
      graphics.lineBetween(0, y, WORLD_WIDTH, y);
    }
  }

  private placeMapObjects(): void {
    for (const objDef of this.mapData.objects) {
      const x = objDef.x * TILE_SIZE;
      const y = objDef.y * TILE_SIZE;
      const mapObj = new MapObject(this, x, y, objDef.type, objDef.hp, objDef.rotation);
      this.mapObjects.push(mapObj);
      this.mapObjectGroup.add(mapObj.sprite);
    }
  }

  private placeEnemies(): void {
    for (const enemyDef of this.mapData.enemies) {
      const stats = getEnemyStats(enemyDef.type);
      if (!stats) continue;
      const x = enemyDef.x * TILE_SIZE + TILE_SIZE / 2;
      const y = enemyDef.y * TILE_SIZE + TILE_SIZE / 2;
      const enemy = new Enemy(this, x, y, stats);
      this.enemies.push(enemy);
      this.enemyGroup.add(enemy.sprite);
    }
  }

  private placeAllies(): void {
    for (const allyDef of this.mapData.allies) {
      const stats = getAllyStats(allyDef.type);
      if (!stats) continue;
      const x = allyDef.x * TILE_SIZE + TILE_SIZE / 2;
      const y = allyDef.y * TILE_SIZE + TILE_SIZE / 2;
      const ally = new Ally(this, x, y, stats);
      this.allies.push(ally);
      this.allyGroup.add(ally.sprite);
    }
  }

  private setupCollisions(): void {
    // Player vs map objects
    this.physics.add.collider(this.player.sprite, this.mapObjectGroup);

    // Allies vs map objects
    this.physics.add.collider(this.allyGroup, this.mapObjectGroup);

    // Allies vs allies (prevent overlap)
    this.physics.add.collider(this.allyGroup, this.allyGroup);

    // Enemies vs map objects
    this.physics.add.collider(this.enemyGroup, this.mapObjectGroup);

    // Enemies vs enemies (prevent overlap)
    this.physics.add.collider(this.enemyGroup, this.enemyGroup);

    // Player bullets vs enemies (group-vs-group)
    this.physics.add.overlap(
      this.playerBullets.group,
      this.enemyGroup,
      (_bulletSprite, _enemySprite) => {
        const bullet = _bulletSprite as Phaser.Physics.Arcade.Sprite;
        if (!bullet.active || !bullet.visible) return;

        // Immediately disable physics body to prevent multi-hit in same frame
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        if (!bulletBody.enable) return; // Already processed
        bulletBody.enable = false;

        const enemyObj = (_enemySprite as Phaser.Physics.Arcade.Sprite).getData('enemy') as Enemy;
        if (!enemyObj || enemyObj.isDead) return;

        const damage = bullet.getData('damage') as number;
        const killed = enemyObj.takeDamage(damage);
        this.player.shotsHit++;

        // Spawn blood effect
        this.spawnBulletHitEffect(bullet.x, bullet.y, true);

        if (killed) {
          this.deathCount++;
          this.score += 100;
          this.radioSystem.send('KILL');
        }

        this.playerBullets.deactivateBullet(bullet);
      },
    );

    // Player bullets vs allies (friendly fire)
    this.physics.add.overlap(
      this.playerBullets.group,
      this.allyGroup,
      (_bulletSprite, _allySprite) => {
        const bullet = _bulletSprite as Phaser.Physics.Arcade.Sprite;
        if (!bullet.active || !bullet.visible) return;

        // Immediately disable physics body to prevent multi-hit in same frame
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        if (!bulletBody.enable) return; // Already processed
        bulletBody.enable = false;

        const allyObj = (_allySprite as Phaser.Physics.Arcade.Sprite).getData('ally') as Ally;
        if (!allyObj || allyObj.isDead) return;

        const damage = bullet.getData('damage') as number;
        const killed = allyObj.takeDamage(damage);

        // Spawn blood effect
        this.spawnBulletHitEffect(bullet.x, bullet.y, true);

        this.radioSystem.forceSend('FF');

        if (killed) {
          this.radioSystem.send('DEAD');
        }

        this.playerBullets.deactivateBullet(bullet);
      },
    );

    // Player bullets vs map objects
    this.physics.add.overlap(
      this.playerBullets.group,
      this.mapObjectGroup,
      (_bulletSprite) => {
        const bullet = _bulletSprite as Phaser.Physics.Arcade.Sprite;
        if (!bullet.active || !bullet.visible) return;

        // Immediately disable physics body to prevent multi-hit in same frame
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        if (!bulletBody.enable) return; // Already processed
        bulletBody.enable = false;

        // Spawn spark effect
        this.spawnBulletHitEffect(bullet.x, bullet.y, false);

        this.playerBullets.deactivateBullet(bullet);
      },
    );

    // Enemy bullets vs player
    this.physics.add.overlap(
      this.enemyBullets.group,
      this.player.sprite,
      (_obj1, _obj2) => {
        // Determine which object is the bullet (Phaser may pass arguments in either order)
        const obj1 = _obj1 as Phaser.Physics.Arcade.Sprite;
        const obj2 = _obj2 as Phaser.Physics.Arcade.Sprite;
        const bullet = obj1.getData('isBullet') ? obj1 : obj2;

        if (!bullet.active || !bullet.visible) return;
        if (this.gameEnding) return;

        // Check if already processed this frame
        if (bullet.getData('bulletProcessed')) return;
        bullet.setData('bulletProcessed', true);

        // Immediately disable bullet's physics body to prevent multi-hit
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        bulletBody.enable = false;

        const damage = 2 + Math.floor(Math.random() * 5);
        this.player.takeDamage(damage);
        this.showDamageFlash();

        // Spawn blood effect
        this.spawnBulletHitEffect(bullet.x, bullet.y, true);

        if (!this.player.isAlive) {
          this.onPlayerDeath();
        }

        this.enemyBullets.deactivateBullet(bullet);
      },
    );

    // Enemy bullets vs map objects
    this.physics.add.overlap(
      this.enemyBullets.group,
      this.mapObjectGroup,
      (_bulletSprite) => {
        const bullet = _bulletSprite as Phaser.Physics.Arcade.Sprite;
        if (!bullet.active || !bullet.visible) return;

        // Immediately disable physics body to prevent multi-hit in same frame
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        if (!bulletBody.enable) return; // Already processed
        bulletBody.enable = false;

        // Spawn spark effect
        this.spawnBulletHitEffect(bullet.x, bullet.y, false);

        this.enemyBullets.deactivateBullet(bullet);
      },
    );

    // Ally bullets vs enemies (group-vs-group)
    this.physics.add.overlap(
      this.allyBullets.group,
      this.enemyGroup,
      (_bulletSprite, _enemySprite) => {
        const bullet = _bulletSprite as Phaser.Physics.Arcade.Sprite;
        if (!bullet.active || !bullet.visible) return;

        // Immediately disable physics body to prevent multi-hit in same frame
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        if (!bulletBody.enable) return; // Already processed
        bulletBody.enable = false;

        const enemyObj = (_enemySprite as Phaser.Physics.Arcade.Sprite).getData('enemy') as Enemy;
        if (!enemyObj || enemyObj.isDead) return;

        const damage = bullet.getData('damage') as number;
        const killed = enemyObj.takeDamage(damage);

        // Spawn blood effect
        this.spawnBulletHitEffect(bullet.x, bullet.y, true);

        if (killed) {
          this.deathCount++;
          this.score += 50;
          this.radioSystem.send('KILL');
        }

        this.allyBullets.deactivateBullet(bullet);
      },
    );

    // Ally bullets vs map objects
    this.physics.add.overlap(
      this.allyBullets.group,
      this.mapObjectGroup,
      (_bulletSprite) => {
        const bullet = _bulletSprite as Phaser.Physics.Arcade.Sprite;
        if (!bullet.active || !bullet.visible) return;

        // Immediately disable physics body to prevent multi-hit in same frame
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        if (!bulletBody.enable) return; // Already processed
        bulletBody.enable = false;

        // Spawn spark effect
        this.spawnBulletHitEffect(bullet.x, bullet.y, false);

        this.allyBullets.deactivateBullet(bullet);
      },
    );

    // Enemy bullets vs allies (group-vs-group)
    this.physics.add.overlap(
      this.enemyBullets.group,
      this.allyGroup,
      (_bulletSprite, _allySprite) => {
        const bullet = _bulletSprite as Phaser.Physics.Arcade.Sprite;
        if (!bullet.active || !bullet.visible) return;

        // Immediately disable physics body to prevent multi-hit in same frame
        const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
        if (!bulletBody.enable) return; // Already processed
        bulletBody.enable = false;

        const allyObj = (_allySprite as Phaser.Physics.Arcade.Sprite).getData('ally') as Ally;
        if (!allyObj || allyObj.isDead) return;

        const damage = bullet.getData('damage') as number;
        const killed = allyObj.takeDamage(damage);

        // Spawn blood effect
        this.spawnBulletHitEffect(bullet.x, bullet.y, true);

        this.radioSystem.send('DAMAGE');

        if (killed) {
          this.radioSystem.send('DEAD');
        }

        this.enemyBullets.deactivateBullet(bullet);
      },
    );

    // CQC: Player touching enemy (group-vs-sprite)
    this.physics.add.overlap(
      this.player.sprite,
      this.enemyGroup,
      (_playerSprite, _enemySprite) => {
        const enemyObj = (_enemySprite as Phaser.Physics.Arcade.Sprite).getData('enemy') as Enemy;
        if (!enemyObj || enemyObj.isDead || enemyObj.isArrested) return;
        if (this.cqcSystem.isActive) return;
        this.startCQC(enemyObj);
      },
    );
  }

  private firePlayerBullet(): void {
    const angle = this.player.facingAngle;
    const x = this.player.sprite.x + Math.cos(angle) * 12;
    const y = this.player.sprite.y + Math.sin(angle) * 12;

    this.playerBullets.fire(x, y, angle, this.player.weapon.range, this.player.weapon.damage);
    this.player.fire();
  }

  private fireEnemyBullet(x: number, y: number, angle: number): void {
    this.enemyBullets.fire(x, y, angle, 5, 3);
  }

  private fireAllyBullet(x: number, y: number, angle: number): void {
    this.allyBullets.fire(x, y, angle, 5, 4);
  }

  private spawnBulletHitEffect(x: number, y: number, isBloodEffect: boolean): void {
    // Create hit effect sprite (SPDEF 15→16 animation)
    const effect = this.add.sprite(x, y, 'spritesheet-raw', 'effect_1');
    effect.setDepth(100);
    effect.setScale(2);

    // Random rotation
    effect.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));

    // Set color: red for blood (enemy/ally hit), yellow for sparks (wall hit)
    if (isBloodEffect) {
      effect.setTint(0xff0000); // Red
    } else {
      effect.setTint(0xffff00); // Yellow
    }

    // Play hit animation
    effect.play('bullet_hit');

    // Destroy after animation completes
    effect.once('animationcomplete', () => {
      effect.destroy();
    });
  }

  private showDamageFlash(): void {
    this.damageOverlay.setAlpha(0.4);
    this.tweens.add({
      targets: this.damageOverlay,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
    });

    // Camera shake
    this.cameras.main.shake(100, 0.01);
  }

  private showReadyAnimation(): void {
    const readyText = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2,
      'READY',
      {
        fontFamily: 'SmileBASIC, monospace',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        resolution: 5,
      },
    );
    readyText.setOrigin(0.5);
    readyText.setScrollFactor(0);
    readyText.setDepth(200);

    this.tweens.add({
      targets: readyText,
      alpha: 0,
      duration: 2000,
      delay: 1000,
      onComplete: () => readyText.destroy(),
    });
  }

  /** Find the angle from player to the nearest living enemy. Returns null if no enemies alive. */
  private findNearestEnemyAngle(): number | null {
    let minDist = Infinity;
    let nearestEnemy: Enemy | null = null;

    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.sprite.x, this.player.sprite.y,
        enemy.sprite.x, enemy.sprite.y,
      );
      if (dist < minDist) {
        minDist = dist;
        nearestEnemy = enemy;
      }
    }

    if (!nearestEnemy) return null;

    return Phaser.Math.Angle.Between(
      this.player.sprite.x, this.player.sprite.y,
      nearestEnemy.sprite.x, nearestEnemy.sprite.y,
    );
  }

  /** Draw FOV restriction overlay: black everywhere except a view cone in aim direction. */
  private drawScopeOverlay(aimAngle: number): void {
    this.scopeOverlay.clear();

    // Player's actual screen position (shifts from center when camera hits world bounds)
    const cam = this.cameras.main;
    const cx = this.player.sprite.x - cam.worldView.x;
    const cy = this.player.sprite.y - cam.worldView.y;
    const radius = Math.max(GAME_WIDTH, GAME_HEIGHT);
    const halfFOV = Math.PI / 8; // 22.5° half-angle = 45° total FOV

    // Dark overlay covering everything OUTSIDE the view cone
    this.scopeOverlay.fillStyle(0x000000, 0.9);
    this.scopeOverlay.beginPath();
    this.scopeOverlay.moveTo(cx, cy);

    // Arc from one edge of the cone, going the LONG way around (the dark area)
    const coneEnd = aimAngle + halfFOV;
    const coneStart = aimAngle - halfFOV;

    // Draw the arc covering the non-visible area (from coneEnd back to coneStart, the long way)
    const steps = 32;
    const darkArcLength = Math.PI * 2 - halfFOV * 2;
    for (let i = 0; i <= steps; i++) {
      const a = coneEnd + (darkArcLength * i) / steps;
      this.scopeOverlay.lineTo(
        cx + Math.cos(a) * radius,
        cy + Math.sin(a) * radius,
      );
    }

    this.scopeOverlay.lineTo(cx, cy);
    this.scopeOverlay.closePath();
    this.scopeOverlay.fillPath();
  }

  /** Draw red laser line showing weapon range from player in aim direction. */
  private drawLaser(aimAngle: number): void {
    this.laserGraphics.clear();

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const rangePixels = this.player.weapon.range * 16;

    this.laserGraphics.lineStyle(1, 0xff0000, 0.6);
    this.laserGraphics.lineBetween(
      px + Math.cos(aimAngle) * 10,
      py + Math.sin(aimAngle) * 10,
      px + Math.cos(aimAngle) * rangePixels,
      py + Math.sin(aimAngle) * rangePixels,
    );
  }

  private startCQC(enemy: Enemy): void {
    if (this.cqcTarget === enemy) return; // Already CQC'd this enemy
    this.cqcTarget = enemy;

    // Stop player movement during CQC
    this.player.sprite.setVelocity(0, 0);

    this.cqcSystem.start(enemy.hp, (result) => {
      if (result.success) {
        // Arrest!
        enemy.arrest();
        this.arrestCount++;
        this.score += 800;
        this.radioSystem.forceSend('ARREST');
      } else {
        // Failed CQC: player takes heavy damage (original = instant death)
        this.player.takeDamage(this.player.hp);
        this.showDamageFlash();
        if (!this.player.isAlive) {
          this.onPlayerDeath();
        }
      }
      this.cqcTarget = null;
    });
  }

  /** Check if player is near a dead enemy to pick up ammo */
  private checkAmmoPickup(): void {
    for (const enemy of this.enemies) {
      if (!enemy.isDead || enemy.ammoPickedUp) continue;

      const dist = Phaser.Math.Distance.Between(
        this.player.sprite.x, this.player.sprite.y,
        enemy.sprite.x, enemy.sprite.y,
      );

      if (dist < 20) {
        enemy.ammoPickedUp = true;
        const ammoGain = Math.floor(Math.random() * 20);
        this.player.reserveAmmo += ammoGain;
        this.player.pickedUpAmmo = true;
        // Hide weapon sprite of dead enemy
        enemy.weaponSprite.setVisible(false);
      }
    }
  }

  private callBackup(): void {
    const now = this.time.now;
    // Cooldown: 1000 frames at 60fps ≈ 16.67 seconds
    if (now - this.lastBackupTime < (BACKUP_COOLDOWN_FRAMES / 60) * 1000) return;

    const costs = [100, 200, 500];

    if (this.score < costs[this.selectedBackupUnit]) return;

    this.score -= costs[this.selectedBackupUnit];
    this.lastBackupTime = now;
    this.player.calledBackup = true;

    const stats = getAllyStats(['L', 'S', 'W'][this.selectedBackupUnit]);
    if (!stats) return;

    // Spawn backup near the player
    const spawnCount = this.selectedBackupUnit + 1;
    for (let i = 0; i < spawnCount; i++) {
      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = 80 + Math.random() * 30;
      const ally = new Ally(
        this,
        this.player.sprite.x + offsetX,
        this.player.sprite.y + offsetY,
        stats,
      );
      this.allies.push(ally);
      this.allyGroup.add(ally.sprite);
    }

    this.radioSystem.forceSend('ARRIVE');
  }

  private onPlayerDeath(): void {
    if (this.gameEnding) return;
    this.gameEnding = true;

    // Play player death animation
    this.player.sprite.play('player_death');

    // Pause physics immediately to prevent further collision callbacks
    this.physics.world.pause();

    const chapter = this.chapterId;

    this.time.delayedCall(1500, () => {
      this.scene.stop(SCENE_HUD);
      this.scene.start(SCENE_GAMEOVER, { chapter });
    });
  }

  private onVictory(): void {
    if (this.gameEnding) return;
    this.gameEnding = true;

    // Pause physics immediately to prevent further collision callbacks
    this.physics.world.pause();

    // Capture all data now before the delayed call
    const resultData = {
      chapter: this.chapterId,
      score: this.score,
      hitRate: this.player.shotsFired > 0
        ? this.player.shotsHit / this.player.shotsFired
        : 0,
      deathCount: this.deathCount,
      arrestCount: this.arrestCount,
      playerHp: this.player.hp,
      elapsed: this.time.now - this.startTime,
      shotsFired: this.player.shotsFired,
      shotsHit: this.player.shotsHit,
      pickedUpAmmo: this.player.pickedUpAmmo,
      calledBackup: this.player.calledBackup,
    };

    this.time.delayedCall(2000, () => {
      this.scene.stop(SCENE_HUD);
      this.scene.start(SCENE_SCORE, resultData);
    });
  }
}
