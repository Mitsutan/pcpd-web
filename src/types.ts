// PCPD - Code 3: Shared Type Definitions

export type FireMode = 'semi' | 'auto';

export interface WeaponStats {
  id: number;
  name: string;
  fireMode: FireMode;
  range: number;        // GUN_FLY
  damage: number;       // GUN_DAM
  magazineSize: number; // GUN_BULET
  reloadTime: number;   // GUN_RE (frames)
  speedModifier: number; // PR_DASH3
  spriteBase: number;   // SPDEF base index for weapon sprite
}

export type EnemyTypeId = 1 | 2 | 3 | 4 | 8 | 9 | 99;

export interface EnemyTypeStats {
  typeId: EnemyTypeId;
  hp: number;
  fireRate: number;     // SPVAR 3 (lower = faster, random 1/rate chance)
  fireRange: number;    // SPVAR 4
  patrolAxis: 'vertical' | 'horizontal';
  spriteBase: number;
}

export type AllyTypeId = 'PCPD' | 'PCSP' | 'SWAT';

export interface AllyTypeStats {
  typeId: AllyTypeId;
  hp: number;
  fireRate: number;
  fireRange: number;
  weaponSpriteBase: number;
  scoreCost: number;
  spawnCount: number;
  spriteBase: number;
}

export interface SaveData {
  chapterUnlocks: [boolean, boolean, boolean, boolean]; // ch1-4
  chapterScores: [number, number, number, number];
  exWeaponUnlock: boolean;
  achievements: boolean[]; // indices 0-6
}

export interface MapDefinition {
  id: number;
  startX: number;
  startY: number;
  bgmKey: string;
  name: string;
  grid: string[];
}

export type BulletOwner = 'player' | 'ally' | 'enemy';

export interface RadioMessage {
  category: string;
  messages: string[];
}

export interface ChapterInfo {
  id: number;
  mapId: number;
  title: string;
  description: string[];
}
