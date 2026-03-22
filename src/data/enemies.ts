import { EnemyTypeStats } from '../types';

export const ENEMY_TYPES: EnemyTypeStats[] = [
  { typeId: 1, hp: 10, fireRate: 80, fireRange: 5, patrolAxis: 'vertical', spriteBase: 111 },
  { typeId: 2, hp: 10, fireRate: 80, fireRange: 5, patrolAxis: 'horizontal', spriteBase: 111 },
  { typeId: 3, hp: 20, fireRate: 60, fireRange: 10, patrolAxis: 'vertical', spriteBase: 111 },
  { typeId: 4, hp: 20, fireRate: 60, fireRange: 10, patrolAxis: 'horizontal', spriteBase: 111 },
  { typeId: 8, hp: 50, fireRate: 50, fireRange: 10, patrolAxis: 'vertical', spriteBase: 111 },
  { typeId: 9, hp: 50, fireRate: 50, fireRange: 10, patrolAxis: 'horizontal', spriteBase: 111 },
  { typeId: 99, hp: 1, fireRate: 80, fireRange: 5, patrolAxis: 'vertical', spriteBase: 116 },
];

export function getEnemyStats(mapChar: string): EnemyTypeStats | null {
  switch (mapChar) {
    case '0': return ENEMY_TYPES.find(e => e.typeId === 99)!;
    case '1': return ENEMY_TYPES.find(e => e.typeId === 1)!;
    case '2': return ENEMY_TYPES.find(e => e.typeId === 2)!;
    case '3': return ENEMY_TYPES.find(e => e.typeId === 3)!;
    case '4': return ENEMY_TYPES.find(e => e.typeId === 4)!;
    case '5': return ENEMY_TYPES.find(e => e.typeId === 8)!;
    case '6': return ENEMY_TYPES.find(e => e.typeId === 9)!;
    default: return null;
  }
}
