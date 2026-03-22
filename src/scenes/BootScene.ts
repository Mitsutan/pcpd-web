import Phaser from 'phaser';
import { SCENE_BOOT, SCENE_TITLE, SPRITESHEET_KEY } from '../constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_BOOT });
  }

  preload(): void {
    // Progress bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30);

    const loadingText = this.add.text(width / 2, height / 2 - 30, 'NOW LOADING...', {
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 - 10, 310 * value, 20);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load sprite sheet as a plain image for manual frame extraction
    this.load.image('spritesheet-raw', 'assets/sprites/pcpd-spritesheet.png');
  }

  create(): void {
    this.createSpriteFrames();
    this.createAnimations();
    this.scene.start(SCENE_TITLE);
  }

  private createSpriteFrames(): void {
    const texture = this.textures.get('spritesheet-raw');

    // Player frames (SPDEF 0-5, 26-28, 34)
    texture.add('player_0', 0, 0, 0, 16, 16);
    texture.add('player_1', 0, 16, 0, 16, 16);
    texture.add('player_2', 0, 32, 0, 16, 16);
    texture.add('player_3', 0, 48, 0, 16, 16);
    texture.add('player_4', 0, 64, 0, 16, 16);
    texture.add('player_5', 0, 80, 0, 16, 16);
    texture.add('player_26', 0, 96, 0, 16, 16);
    texture.add('player_27', 0, 112, 0, 16, 16);
    texture.add('player_28', 0, 128, 0, 16, 16);
    texture.add('player_34', 0, 144, 16, 16, 16);

    // PCSP police frames (SPDEF 51-58)
    for (let i = 0; i < 8; i++) {
      texture.add(`pcsp_${51 + i}`, 0, 16 + i * 16, 16, 16, 16);
    }

    // SWAT frames (SPDEF 61-68)
    for (let i = 0; i < 8; i++) {
      texture.add(`swat_${61 + i}`, 0, 16 + i * 16, 32, 16, 16);
    }

    // Enemy frames (SPDEF 111-119)
    for (let i = 0; i < 9; i++) {
      texture.add(`enemy_${111 + i}`, 0, 144 + i * 16, 0, 16, 16);
    }

    // Enemy death frames (SPDEF 35-38)
    texture.add('enemy_death_0', 0, 160, 16, 16, 16);
    texture.add('enemy_death_1', 0, 176, 16, 16, 16);
    texture.add('enemy_death_2', 0, 192, 16, 16, 16);
    texture.add('enemy_death_3', 0, 208, 16, 16, 16);

    // Handgun frames (SPDEF 10-13, 19)
    texture.add('handgun_0', 0, 0, 48, 16, 16);
    texture.add('handgun_1', 0, 16, 48, 16, 16);
    texture.add('handgun_2', 0, 32, 48, 16, 16);
    texture.add('handgun_3', 0, 48, 48, 16, 16);
    texture.add('handgun_fire', 0, 64, 48, 32, 16);

    // Rifle frames (SPDEF 20-23, 29)
    texture.add('rifle_0', 0, 0, 64, 16, 16);
    texture.add('rifle_1', 0, 16, 64, 16, 16);
    texture.add('rifle_2', 0, 32, 64, 16, 16);
    texture.add('rifle_3', 0, 48, 64, 16, 16);
    texture.add('rifle_fire', 0, 64, 64, 32, 16);

    // Sniper frames (SPDEF 30-33, 39)
    texture.add('sniper_0', 0, 0, 80, 16, 16);
    texture.add('sniper_1', 0, 16, 80, 16, 16);
    texture.add('sniper_2', 0, 32, 80, 16, 16);
    texture.add('sniper_3', 0, 48, 80, 16, 16);
    texture.add('sniper_fire', 0, 64, 80, 32, 16);

    // Baton frames (SPDEF 40-43, 49)
    texture.add('baton_0', 0, 0, 96, 16, 16);
    texture.add('baton_1', 0, 16, 96, 16, 16);
    texture.add('baton_2', 0, 32, 96, 16, 16);
    texture.add('baton_3', 0, 48, 96, 16, 16);
    texture.add('baton_fire', 0, 64, 96, 32, 16);

    // Bullet (SPDEF 96: 395,0 1x1)
    texture.add('bullet', 0, 395, 0, 1, 1);

    // Effects (SPDEF 14-16)
    texture.add('effect_0', 0, 304, 0, 8, 8);
    texture.add('effect_1', 0, 312, 0, 8, 8);
    texture.add('effect_2', 0, 304, 8, 8, 8);

    // Wall sprites (SPDEF 100, 104, 108-110)
    texture.add('wall_16', 0, 0, 256, 16, 16);
    texture.add('wall_16b', 0, 16, 256, 16, 16);
    texture.add('wall_16c', 0, 0, 272, 16, 16);
    texture.add('wall_32', 0, 0, 272, 32, 32);
    texture.add('wall_48', 0, 0, 272, 48, 48);

    // Police cars (SPDEF 120: 0,132 48x24)
    texture.add('police_car_0', 0, 0, 132, 48, 24);
    texture.add('police_car_1', 0, 48, 132, 48, 24);
    texture.add('police_car_2', 0, 96, 132, 48, 24);

    // PCSP cars (SPDEF 130: 240,132 48x24)
    texture.add('pcsp_car_0', 0, 240, 132, 48, 24);
    texture.add('pcsp_car_1', 0, 288, 132, 48, 24);
    texture.add('pcsp_car_2', 0, 336, 132, 48, 24);

    // SWAT cars (SPDEF 140: 240,162 56x28)
    texture.add('swat_car_0', 0, 240, 162, 56, 28);
    texture.add('swat_car_1', 0, 296, 162, 56, 28);
    texture.add('swat_car_2', 0, 352, 162, 56, 28);

    // Red cars (SPDEF 150: 0,164 48x24)
    texture.add('red_car', 0, 0, 164, 48, 24);

    // White cars (SPDEF 160: 0,196 48x24)
    texture.add('white_car', 0, 0, 196, 48, 24);

    // Containers (SPDEF 135-138)
    texture.add('container_0', 0, 0, 224, 64, 32);
    texture.add('container_1', 0, 64, 224, 64, 32);

    // Drum cans (SPDEF 134, 139)
    texture.add('drumcan_0', 0, 32, 256, 16, 16);
    texture.add('drumcan_1', 0, 48, 256, 16, 16);

    // Car destruction frames (SPDEF 200-203)
    texture.add('car_broken_0', 0, 48, 164, 48, 24);
    texture.add('car_broken_1', 0, 96, 164, 48, 24);
    texture.add('car_broken_2', 0, 144, 164, 48, 24);
    texture.add('car_broken_3', 0, 192, 164, 48, 24);

    // UI elements
    texture.add('weapon_bg', 0, 384, 1, 128, 15);
    texture.add('hp_bar', 0, 412, 16, 100, 1);
    texture.add('damage_overlay', 0, 304, 16, 32, 32);

    // Scope / sight (SPDEF 4091: 448,64 64x64)
    texture.add('scope', 0, 448, 64, 64, 64);

    // Collision probe (SPDEF 25: 0,16 5x5) - tiny hitbox
    texture.add('hitbox', 0, 0, 16, 5, 5);

    // PCPD Logo (SPDEF 4093: 80,344 168x168)
    texture.add('logo_pcpd', 0, 80, 344, 168, 168);

    // Title Logo (SPDEF 4095: 248,352 264x160)
    texture.add('logo_title', 0, 248, 352, 264, 160);

    // Incident report (SPDEF 4090: 336,17 176x31)
    texture.add('incident_report', 0, 336, 17, 176, 31);

    // You are down (SPDEF 4089: 96,48 288x32)
    texture.add('you_are_down', 0, 96, 48, 288, 32);

    // Ready labels (SPDEF 4088, 4087)
    texture.add('ready_upper', 0, 96, 80, 128, 12);
    texture.add('ready_lower', 0, 96, 93, 128, 19);

    // Clipboard (SPDEF 4086: 384,192 128x160)
    texture.add('clipboard', 0, 384, 192, 128, 160);

    // Transceiver (SPDEF 4000: 0,350 80x162)
    texture.add('transceiver', 0, 0, 350, 80, 162);

    // Small ammo sprite (SPDEF 50: 10,425 1x1)
    texture.add('ammo_pickup', 0, 10, 425, 1, 1);

    // Weapon line (SPDEF 9: 496,0 16x1)
    texture.add('weapon_line', 0, 496, 0, 16, 1);
  }

  private createAnimations(): void {
    // Player walk animation
    this.anims.create({
      key: 'player_walk',
      frames: [
        { key: 'spritesheet-raw', frame: 'player_1' },
        { key: 'spritesheet-raw', frame: 'player_2' },
        { key: 'spritesheet-raw', frame: 'player_3' },
        { key: 'spritesheet-raw', frame: 'player_4' },
        { key: 'spritesheet-raw', frame: 'player_5' },
      ],
      frameRate: 10,
      repeat: -1,
    });

    // Player idle (player_3 is the neutral standing frame)
    this.anims.create({
      key: 'player_idle',
      frames: [{ key: 'spritesheet-raw', frame: 'player_3' }],
      frameRate: 1,
    });

    // Enemy walk animation
    this.anims.create({
      key: 'enemy_walk',
      frames: [
        { key: 'spritesheet-raw', frame: 'enemy_111' },
        { key: 'spritesheet-raw', frame: 'enemy_112' },
        { key: 'spritesheet-raw', frame: 'enemy_113' },
        { key: 'spritesheet-raw', frame: 'enemy_114' },
        { key: 'spritesheet-raw', frame: 'enemy_115' },
      ],
      frameRate: 10,
      repeat: -1,
    });

    // Enemy idle animation (use middle frame of walk cycle)
    this.anims.create({
      key: 'enemy_idle',
      frames: [{ key: 'spritesheet-raw', frame: 'enemy_113' }],
      frameRate: 1,
    });

    // Enemy death animation (SPDEF 35-38: arrest/surrender)
    this.anims.create({
      key: 'enemy_death',
      frames: [
        { key: 'spritesheet-raw', frame: 'enemy_death_0' },
        { key: 'spritesheet-raw', frame: 'enemy_death_1' },
        { key: 'spritesheet-raw', frame: 'enemy_death_2' },
        { key: 'spritesheet-raw', frame: 'enemy_death_3' },
      ],
      frameRate: 8,
      repeat: 0,
    });

    // Enemy kill animation (SPDEF 117-119)
    this.anims.create({
      key: 'enemy_kill',
      frames: [
        { key: 'spritesheet-raw', frame: 'enemy_117' },
        { key: 'spritesheet-raw', frame: 'enemy_118' },
        { key: 'spritesheet-raw', frame: 'enemy_119' },
      ],
      frameRate: 8,
      repeat: 0,
    });

    // Car explosion animation
    this.anims.create({
      key: 'car_explode',
      frames: [
        { key: 'spritesheet-raw', frame: 'car_broken_0' },
        { key: 'spritesheet-raw', frame: 'car_broken_1' },
        { key: 'spritesheet-raw', frame: 'car_broken_2' },
        { key: 'spritesheet-raw', frame: 'car_broken_3' },
      ],
      frameRate: 6,
      repeat: 0,
    });

    // PCSP walk animation
    this.anims.create({
      key: 'pcsp_walk',
      frames: [
        { key: 'spritesheet-raw', frame: 'pcsp_51' },
        { key: 'spritesheet-raw', frame: 'pcsp_52' },
        { key: 'spritesheet-raw', frame: 'pcsp_53' },
        { key: 'spritesheet-raw', frame: 'pcsp_54' },
        { key: 'spritesheet-raw', frame: 'pcsp_55' },
      ],
      frameRate: 10,
      repeat: -1,
    });

    // PCSP idle animation (use middle frame of walk cycle)
    this.anims.create({
      key: 'pcsp_idle',
      frames: [{ key: 'spritesheet-raw', frame: 'pcsp_53' }],
      frameRate: 1,
    });

    // PCSP death animation (SPDEF 56-58)
    this.anims.create({
      key: 'pcsp_death',
      frames: [
        { key: 'spritesheet-raw', frame: 'pcsp_56' },
        { key: 'spritesheet-raw', frame: 'pcsp_57' },
        { key: 'spritesheet-raw', frame: 'pcsp_58' },
      ],
      frameRate: 8,
      repeat: 0,
    });

    // SWAT walk animation
    this.anims.create({
      key: 'swat_walk',
      frames: [
        { key: 'spritesheet-raw', frame: 'swat_61' },
        { key: 'spritesheet-raw', frame: 'swat_62' },
        { key: 'spritesheet-raw', frame: 'swat_63' },
        { key: 'spritesheet-raw', frame: 'swat_64' },
        { key: 'spritesheet-raw', frame: 'swat_65' },
      ],
      frameRate: 10,
      repeat: -1,
    });

    // SWAT idle animation (use middle frame of walk cycle)
    this.anims.create({
      key: 'swat_idle',
      frames: [{ key: 'spritesheet-raw', frame: 'swat_63' }],
      frameRate: 1,
    });

    // SWAT death animation (SPDEF 66-68)
    this.anims.create({
      key: 'swat_death',
      frames: [
        { key: 'spritesheet-raw', frame: 'swat_66' },
        { key: 'spritesheet-raw', frame: 'swat_67' },
        { key: 'spritesheet-raw', frame: 'swat_68' },
      ],
      frameRate: 8,
      repeat: 0,
    });

    // PCPD / Player death animation (SPDEF 26-28)
    this.anims.create({
      key: 'player_death',
      frames: [
        { key: 'spritesheet-raw', frame: 'player_26' },
        { key: 'spritesheet-raw', frame: 'player_27' },
        { key: 'spritesheet-raw', frame: 'player_28' },
      ],
      frameRate: 8,
      repeat: 0,
    });

    // Police car siren animation (SPDEF 120→124→254)
    this.anims.create({
      key: 'police_car_siren',
      frames: [
        { key: 'spritesheet-raw', frame: 'police_car_0' },
        { key: 'spritesheet-raw', frame: 'police_car_1' },
        { key: 'spritesheet-raw', frame: 'police_car_2' },
      ],
      frameRate: 12,
      repeat: -1,
    });

    // PCSP car siren animation
    this.anims.create({
      key: 'pcsp_car_siren',
      frames: [
        { key: 'spritesheet-raw', frame: 'pcsp_car_0' },
        { key: 'spritesheet-raw', frame: 'pcsp_car_1' },
        { key: 'spritesheet-raw', frame: 'pcsp_car_2' },
      ],
      frameRate: 12,
      repeat: -1,
    });

    // SWAT car siren animation
    this.anims.create({
      key: 'swat_car_siren',
      frames: [
        { key: 'spritesheet-raw', frame: 'swat_car_0' },
        { key: 'spritesheet-raw', frame: 'swat_car_1' },
        { key: 'spritesheet-raw', frame: 'swat_car_2' },
      ],
      frameRate: 12,
      repeat: -1,
    });

    // Bullet hit effect animation (SPDEF 15→16)
    this.anims.create({
      key: 'bullet_hit',
      frames: [
        { key: 'spritesheet-raw', frame: 'effect_1' },
        { key: 'spritesheet-raw', frame: 'effect_2' },
      ],
      frameRate: 12,
      repeat: 0,
    });

    // Weapon muzzle flash animations
    // Handgun muzzle flash (SPDEF 10→11→12→13→10)
    this.anims.create({
      key: 'handgun_flash',
      frames: [
        { key: 'spritesheet-raw', frame: 'handgun_0' },
        { key: 'spritesheet-raw', frame: 'handgun_1' },
        { key: 'spritesheet-raw', frame: 'handgun_2' },
        { key: 'spritesheet-raw', frame: 'handgun_3' },
        { key: 'spritesheet-raw', frame: 'handgun_0' },
      ],
      frameRate: 20,
      repeat: 0,
    });

    // Rifle muzzle flash (SPDEF 20→21→22→23→20)
    this.anims.create({
      key: 'rifle_flash',
      frames: [
        { key: 'spritesheet-raw', frame: 'rifle_0' },
        { key: 'spritesheet-raw', frame: 'rifle_1' },
        { key: 'spritesheet-raw', frame: 'rifle_2' },
        { key: 'spritesheet-raw', frame: 'rifle_3' },
        { key: 'spritesheet-raw', frame: 'rifle_0' },
      ],
      frameRate: 20,
      repeat: 0,
    });

    // Sniper muzzle flash (SPDEF 30→31→32→33→30)
    this.anims.create({
      key: 'sniper_flash',
      frames: [
        { key: 'spritesheet-raw', frame: 'sniper_0' },
        { key: 'spritesheet-raw', frame: 'sniper_1' },
        { key: 'spritesheet-raw', frame: 'sniper_2' },
        { key: 'spritesheet-raw', frame: 'sniper_3' },
        { key: 'spritesheet-raw', frame: 'sniper_0' },
      ],
      frameRate: 20,
      repeat: 0,
    });

    // Baton swing (SPDEF 40→41→42→43→40)
    this.anims.create({
      key: 'baton_swing',
      frames: [
        { key: 'spritesheet-raw', frame: 'baton_0' },
        { key: 'spritesheet-raw', frame: 'baton_1' },
        { key: 'spritesheet-raw', frame: 'baton_2' },
        { key: 'spritesheet-raw', frame: 'baton_3' },
        { key: 'spritesheet-raw', frame: 'baton_0' },
      ],
      frameRate: 20,
      repeat: 0,
    });
  }
}
