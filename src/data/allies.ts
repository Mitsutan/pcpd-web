import { AllyTypeStats } from '../types';

export const ALLY_TYPES: Record<string, AllyTypeStats> = {
  PCPD: {
    typeId: 'PCPD',
    hp: 10,
    fireRate: 90,
    fireRange: 5,
    weaponSpriteBase: 10,
    scoreCost: -100,
    spawnCount: 1,
    spriteBase: 1,
  },
  PCSP: {
    typeId: 'PCSP',
    hp: 20,
    fireRate: 50,
    fireRange: 10,
    weaponSpriteBase: 20,
    scoreCost: -200,
    spawnCount: 2,
    spriteBase: 51,
  },
  SWAT: {
    typeId: 'SWAT',
    hp: 50,
    fireRate: 5,
    fireRange: 10,
    weaponSpriteBase: 20,
    scoreCost: -500,
    spawnCount: 3,
    spriteBase: 61,
  },
};

export function getAllyStats(mapChar: string): AllyTypeStats | null {
  switch (mapChar) {
    case 'L': return ALLY_TYPES.PCPD;
    case 'S': return ALLY_TYPES.PCSP;
    case 'W': return ALLY_TYPES.SWAT;
    default: return null;
  }
}
