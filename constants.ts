import { ZoneId, ZoneData, MiniGameType, EasterEgg } from './types';

// Initial dummy players with positions
export const INITIAL_LEADERBOARD = [
  { id: 'p2', name: 'ElfTwinkle', score: 8500, isCurrentUser: false, avatar: '🧝', x: 400, y: 300 },
  { id: 'p3', name: 'RudolphRacer', score: 6200, isCurrentUser: false, avatar: '🦌', x: 600, y: 500 },
  { id: 'p4', name: 'FrostyFan', score: 4500, isCurrentUser: false, avatar: '⛄', x: 200, y: 800 },
  { id: 'p5', name: 'MrsClausCookie', score: 2100, isCurrentUser: false, avatar: '👵', x: 800, y: 200 },
];

export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 2000;

export const ZONES: Record<ZoneId, ZoneData> = {
  [ZoneId.TOWN_SQUARE]: {
    id: ZoneId.TOWN_SQUARE,
    name: "North Pole Hall",
    description: "The Grand Lobby. Meet friends and find games!",
    width: 2000,
    height: 2000,
    backgroundPattern: 'radial-gradient(circle, #1e293b 0%, #0f172a 100%)', 
    interactables: [
      { id: 'game_trivia_1', x: 400, y: 400, label: 'Wise Owl Trivia', icon: '🦉', type: 'GAME', gameType: MiniGameType.TRIVIA, range: 100 },
      { id: 'game_clicker_1', x: 1200, y: 600, label: 'Speedy Skater', icon: '⛸️', type: 'GAME', gameType: MiniGameType.CLICKER, range: 100 },
      { id: 'npc_santa', x: 1000, y: 150, label: 'Santa', icon: '🎅', type: 'NPC', message: "Ho Ho Ho! Find the hidden eggs!", range: 120 },
      { id: 'portal_forest', x: 1800, y: 1000, label: 'Mystic Forest', icon: '🌲', type: 'PORTAL', targetZone: ZoneId.MYSTIC_FOREST, range: 100 },
    ]
  },
  // Simplified other zones for this demo, focusing on the main hall movement
  [ZoneId.FROZEN_LAKE]: {
    id: ZoneId.FROZEN_LAKE,
    name: "Frozen Lake",
    description: "Slippery ice!",
    width: 1500,
    height: 1500,
    backgroundPattern: 'linear-gradient(to bottom, #bae6fd, #7dd3fc)',
    interactables: [
      { id: 'portal_square', x: 100, y: 750, label: 'Back to Hall', icon: '🏠', type: 'PORTAL', targetZone: ZoneId.TOWN_SQUARE, range: 100 }
    ]
  },
  [ZoneId.MYSTIC_FOREST]: {
    id: ZoneId.MYSTIC_FOREST,
    name: "Mystic Forest",
    description: "Dark and mysterious.",
    width: 1500,
    height: 1500,
    backgroundPattern: 'repeating-linear-gradient(45deg, #064e3b 0px, #065f46 40px)',
    interactables: [
      { id: 'portal_square', x: 100, y: 750, label: 'Back to Hall', icon: '🏠', type: 'PORTAL', targetZone: ZoneId.TOWN_SQUARE, range: 100 },
      { id: 'game_trivia_2', x: 800, y: 500, label: 'Ancient Snowman', icon: '☃️', type: 'GAME', gameType: MiniGameType.TRIVIA, range: 100 },
    ]
  },
  [ZoneId.SANTA_WORKSHOP]: {
    id: ZoneId.SANTA_WORKSHOP,
    name: "Workshop",
    description: "Toys everywhere!",
    width: 1200,
    height: 1200,
    backgroundPattern: 'linear-gradient(to bottom, #7f1d1d, #450a0a)',
    interactables: [
      { id: 'portal_square', x: 600, y: 1100, label: 'Exit', icon: '🚪', type: 'PORTAL', targetZone: ZoneId.TOWN_SQUARE, range: 100 }
    ]
  }
};

export const HIDDEN_EGGS: EasterEgg[] = [
  { id: 'egg_1', zoneId: ZoneId.TOWN_SQUARE, x: 250, y: 250, found: false },
  { id: 'egg_2', zoneId: ZoneId.TOWN_SQUARE, x: 1600, y: 1400, found: false },
  { id: 'egg_3', zoneId: ZoneId.MYSTIC_FOREST, x: 500, y: 500, found: false },
];