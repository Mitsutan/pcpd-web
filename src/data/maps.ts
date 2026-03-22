import { MapDefinition } from '../types';

// Map data converted from SmileBASIC @MAP_1 through @MAP_5
// Characters: ' ' = empty, '0'-'6' = enemies, 'L'/'S'/'W' = allies
// Non-printable special characters from SmileBASIC are replaced with
// readable tokens for map objects. We use a simplified encoding here.
// Objects will be manually placed based on the original map layouts.

// Object character mapping (from original source lines 660-709):
// Various special SmileBASIC characters mapped to objects.
// Since the original uses non-standard character codes, we define
// object placements directly in a separate objects array.

export interface MapObjectPlacement {
  type: string;
  x: number;  // tile column
  y: number;  // tile row
  rotation?: number; // degrees
  hp: number;
}

export interface ParsedMap {
  startX: number;
  startY: number;
  bgmKey: string;
  name: string;
  enemies: Array<{ type: string; x: number; y: number }>;
  allies: Array<{ type: string; x: number; y: number }>;
  objects: MapObjectPlacement[];
}

// Simplified map grids - enemies and allies extracted from the original DATA
// The special characters for walls/cars/etc are handled separately

const MAP_1_ENEMIES = [
  { type: '2', x: 15, y: 2 },
  { type: '1', x: 10, y: 3 },
  { type: '1', x: 20, y: 5 },
  { type: '1', x: 23, y: 5 },
  { type: '1', x: 22, y: 9 },
  { type: '1', x: 14, y: 11 },
  { type: '2', x: 18, y: 16 },
  { type: '2', x: 11, y: 18 },
  { type: '2', x: 20, y: 19 },
  { type: '2', x: 23, y: 21 },
];

const MAP_1_ALLIES = [
  { type: 'L', x: 3, y: 7 },
  { type: 'L', x: 2, y: 14 },
  { type: 'L', x: 0, y: 22 },
];

const MAP_2_ENEMIES = [
  { type: '2', x: 12, y: 0 },
  { type: '1', x: 9, y: 2 },
  { type: '1', x: 11, y: 2 },
  { type: '3', x: 16, y: 2 },
  { type: '1', x: 22, y: 5 },
  { type: '2', x: 14, y: 7 },
  { type: '3', x: 22, y: 8 },
  { type: '4', x: 23, y: 11 },
  { type: '2', x: 14, y: 12 },
  { type: '3', x: 17, y: 14 },
  { type: '1', x: 14, y: 15 },
  { type: '2', x: 14, y: 17 },
  { type: '4', x: 23, y: 17 },
  { type: '3', x: 20, y: 20 },
  { type: '2', x: 14, y: 22 },
  { type: '1', x: 23, y: 23 },
  { type: '3', x: 20, y: 26 },
  { type: '1', x: 15, y: 28 },
  { type: '1', x: 17, y: 28 },
  { type: '2', x: 14, y: 31 },
];

const MAP_2_ALLIES = [
  { type: 'W', x: 1, y: 3 },
  { type: 'W', x: 1, y: 5 },
  { type: 'L', x: 1, y: 9 },
  { type: 'L', x: 1, y: 11 },
  { type: 'L', x: 1, y: 14 },
  { type: 'L', x: 1, y: 16 },
  { type: 'S', x: 1, y: 18 },
  { type: 'S', x: 1, y: 20 },
];

const MAP_3_ENEMIES = [
  { type: '4', x: 6, y: 0 },
  { type: '4', x: 9, y: 0 },
  { type: '4', x: 14, y: 0 },
  { type: '3', x: 10, y: 4 },
  { type: '3', x: 18, y: 7 },
  { type: '3', x: 14, y: 12 },
  { type: '3', x: 27, y: 12 },
  { type: '3', x: 20, y: 14 },
  { type: '3', x: 15, y: 15 },
  { type: '3', x: 14, y: 18 },
  { type: '3', x: 21, y: 18 },
  { type: '3', x: 27, y: 20 },
  { type: '3', x: 18, y: 21 },
  { type: '3', x: 24, y: 22 },
  { type: '4', x: 6, y: 25 },
  { type: '4', x: 9, y: 25 },
  { type: '4', x: 19, y: 25 },
  { type: '4', x: 11, y: 29 },
  { type: '4', x: 6, y: 31 },
  { type: '4', x: 14, y: 31 },
];

const MAP_3_ALLIES = [
  { type: 'L', x: 10, y: 10 },
  { type: 'L', x: 14, y: 10 },
  { type: 'W', x: 3, y: 12 },
  { type: 'W', x: 7, y: 13 },
  { type: 'S', x: 9, y: 15 },
  { type: 'L', x: 13, y: 15 },
  { type: 'L', x: 15, y: 16 },
  { type: 'L', x: 9, y: 17 },
  { type: 'S', x: 9, y: 19 },
  { type: 'L', x: 10, y: 21 },
  { type: 'L', x: 14, y: 21 },
];

const MAP_4_ENEMIES = [
  { type: '5', x: 0, y: 3 },
  { type: '5', x: 18, y: 4 },
  { type: '3', x: 7, y: 5 },
  { type: '5', x: 24, y: 4 },
  { type: '5', x: 12, y: 9 },
  { type: '3', x: 14, y: 9 },
  { type: '3', x: 22, y: 9 },
  { type: '5', x: 29, y: 10 },
  { type: '6', x: 11, y: 13 },
  { type: '6', x: 20, y: 13 },
  { type: '5', x: 11, y: 17 },
  { type: '3', x: 13, y: 17 },
  { type: '3', x: 22, y: 19 },
  { type: '6', x: 14, y: 20 },
  { type: '3', x: 17, y: 20 },
  { type: '5', x: 25, y: 21 },
  { type: '4', x: 12, y: 23 },
  { type: '6', x: 19, y: 23 },
  { type: '5', x: 6, y: 27 },
  { type: '3', x: 8, y: 27 },
  { type: '6', x: 14, y: 27 },
  { type: '5', x: 28, y: 27 },
  { type: '5', x: 16, y: 28 },
  { type: '5', x: 24, y: 30 },
  { type: '6', x: 5, y: 30 },
  { type: '4', x: 1, y: 31 },
];

const MAP_4_ALLIES = [
  { type: 'L', x: 1, y: 5 },
  { type: 'L', x: 4, y: 5 },
  { type: 'L', x: 1, y: 11 },
  { type: 'L', x: 1, y: 15 },
  { type: 'L', x: 1, y: 17 },
  { type: 'S', x: 1, y: 19 },
  { type: 'S', x: 1, y: 21 },
  { type: 'W', x: 1, y: 23 },
  { type: 'W', x: 1, y: 26 },
];

const MAP_5_ENEMIES = [
  { type: '0', x: 25, y: 15 },
];

const MAP_5_ALLIES: Array<{ type: string; x: number; y: number }> = [];

// Simple wall/barrier placements for each map
// In a full implementation, these would be extracted from the special characters
// For now, we add some representative barriers

function createMapBorders(): MapObjectPlacement[] {
  const objects: MapObjectPlacement[] = [];
  // Top and bottom borders
  for (let x = 0; x < 32; x++) {
    objects.push({ type: 'wall_16', x, y: -1, hp: -999 });
    objects.push({ type: 'wall_16', x, y: 32, hp: -999 });
  }
  // Left and right borders
  for (let y = 0; y < 32; y++) {
    objects.push({ type: 'wall_16', x: -1, y, hp: -999 });
    objects.push({ type: 'wall_16', x: 32, y, hp: -999 });
  }
  return objects;
}

export const MAPS: Record<number, ParsedMap> = {
  1: {
    startX: 8,
    startY: -168,
    bgmKey: 'bgm_chap1',
    name: '宝石店強盗及びそれに伴う郡コンテナ置場での銃撃事件',
    enemies: MAP_1_ENEMIES,
    allies: MAP_1_ALLIES,
    objects: [
      ...createMapBorders(),
      // Some representative objects for chapter 1
      { type: 'container_0', x: 5, y: 4, hp: -999 },
      { type: 'container_0', x: 5, y: 8, hp: -999 },
      { type: 'container_0', x: 5, y: 12, hp: -999 },
      { type: 'container_1', x: 12, y: 6, hp: -999 },
      { type: 'container_1', x: 18, y: 10, hp: -999 },
      { type: 'drumcan_0', x: 8, y: 5, hp: 50 },
      { type: 'drumcan_0', x: 20, y: 8, hp: 50 },
      { type: 'police_car_0', x: 2, y: 20, hp: 1000 },
      { type: 'red_car', x: 15, y: 15, hp: 800 },
    ],
  },
  2: {
    startX: 24,
    startY: -120,
    bgmKey: 'bgm_chap2',
    name: '銀行強盗事件',
    enemies: MAP_2_ENEMIES,
    allies: MAP_2_ALLIES,
    objects: [
      ...createMapBorders(),
      { type: 'wall_32', x: 4, y: 2, hp: -999 },
      { type: 'wall_32', x: 4, y: 6, hp: -999 },
      { type: 'wall_32', x: 4, y: 10, hp: -999 },
      { type: 'wall_32', x: 4, y: 14, hp: -999 },
      { type: 'wall_32', x: 10, y: 4, hp: -999 },
      { type: 'wall_32', x: 10, y: 8, hp: -999 },
      { type: 'wall_32', x: 10, y: 12, hp: -999 },
      { type: 'police_car_0', x: 1, y: 1, hp: 1000 },
      { type: 'white_car', x: 20, y: 3, hp: 800 },
    ],
  },
  3: {
    startX: 72,
    startY: -296,
    bgmKey: 'bgm_chap3',
    name: '犯罪グループ壊滅作戦',
    enemies: MAP_3_ENEMIES,
    allies: MAP_3_ALLIES,
    objects: [
      ...createMapBorders(),
      { type: 'container_0', x: 3, y: 2, hp: -999 },
      { type: 'container_0', x: 3, y: 6, hp: -999 },
      { type: 'container_1', x: 8, y: 3, hp: -999 },
      { type: 'container_1', x: 18, y: 5, hp: -999 },
      { type: 'container_0', x: 3, y: 16, hp: -999 },
      { type: 'container_0', x: 22, y: 8, hp: -999 },
      { type: 'drumcan_0', x: 12, y: 7, hp: 50 },
      { type: 'drumcan_0', x: 20, y: 16, hp: 50 },
      { type: 'police_car_0', x: 5, y: 24, hp: 1000 },
    ],
  },
  4: {
    startX: 120,
    startY: -216,
    bgmKey: 'bgm_chap4',
    name: '「Good Guys」リーダー確保作戦',
    enemies: MAP_4_ENEMIES,
    allies: MAP_4_ALLIES,
    objects: [
      ...createMapBorders(),
      { type: 'wall_32', x: 6, y: 2, hp: -999 },
      { type: 'wall_32', x: 14, y: 2, hp: -999 },
      { type: 'wall_32', x: 6, y: 8, hp: -999 },
      { type: 'wall_32', x: 14, y: 8, hp: -999 },
      { type: 'wall_32', x: 6, y: 14, hp: -999 },
      { type: 'wall_32', x: 14, y: 14, hp: -999 },
      { type: 'wall_32', x: 6, y: 20, hp: -999 },
      { type: 'wall_32', x: 14, y: 20, hp: -999 },
      { type: 'drumcan_0', x: 10, y: 5, hp: 50 },
      { type: 'drumcan_0', x: 18, y: 12, hp: 50 },
      { type: 'drumcan_0', x: 22, y: 18, hp: 50 },
      { type: 'red_car', x: 3, y: 10, hp: 800 },
      { type: 'white_car', x: 20, y: 25, hp: 800 },
    ],
  },
  5: {
    startX: 296,
    startY: -248,
    bgmKey: 'bgm_chap4',
    name: 'MAP_5',
    enemies: MAP_5_ENEMIES,
    allies: MAP_5_ALLIES,
    objects: [
      ...createMapBorders(),
      { type: 'wall_32', x: 8, y: 5, hp: -999 },
      { type: 'wall_32', x: 8, y: 20, hp: -999 },
      { type: 'wall_32', x: 22, y: 5, hp: -999 },
      { type: 'wall_32', x: 22, y: 20, hp: -999 },
    ],
  },
};
