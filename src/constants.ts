// PCPD - Code 3: Game Constants

// Screen dimensions
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 240;
export const HUD_HEIGHT = 80;
export const TOTAL_HEIGHT = GAME_HEIGHT + HUD_HEIGHT;

// World dimensions (32x32 tiles of 16px each = 512x512)
export const TILE_SIZE = 16;
export const MAP_COLS = 32;
export const MAP_ROWS = 32;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

// Player
export const PLAYER_MAX_HP = 100;
export const PLAYER_START_AMMO = 30;
export const PLAYER_BASE_SPEED = 2;
export const PLAYER_DASH_MULTIPLIER = 2;
export const PLAYER_SIGHT_SPEED_MULTIPLIER = 0.4;

// Bullet pool sizes
export const PLAYER_BULLET_POOL_SIZE = 30;
export const ALLY_BULLET_POOL_SIZE = 50;
export const ENEMY_BULLET_POOL_SIZE = 100;

// Bullet travel duration (frames at 60fps)
export const BULLET_TRAVEL_FRAMES = 30;

// Backup system
export const BACKUP_COOLDOWN_FRAMES = 1000;

// Scene keys
export const SCENE_BOOT = 'BootScene';
export const SCENE_TITLE = 'TitleScene';
export const SCENE_GAME = 'GameScene';
export const SCENE_HUD = 'HUDScene';
export const SCENE_CUTSCENE = 'CutsceneScene';
export const SCENE_GAMEOVER = 'GameOverScene';
export const SCENE_SCORE = 'ScoreScene';
export const SCENE_ACHIEVEMENT = 'AchievementScene';

// Asset keys
export const ATLAS_KEY = 'pcpd';
export const SPRITESHEET_KEY = 'pcpd-sheet';

// Colors
export const COLOR_HP_GREEN = 0x00ff00;
export const COLOR_HP_YELLOW = 0xffff00;
export const COLOR_HP_RED = 0xff0000;

// Score grades
export const GRADES = [
  { grade: 'S', minScore: 10000 },
  { grade: 'A', minScore: 8001 },
  { grade: 'B', minScore: 5001 },
  { grade: 'C', minScore: 2001 },
  { grade: 'D', minScore: 1 },
  { grade: 'E', minScore: -999 },
  { grade: 'F', minScore: -Infinity },
] as const;
