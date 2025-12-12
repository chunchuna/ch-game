import { ZoneId, ZoneData, MiniGameType, EasterEgg } from './types';

// No initial fake players anymore
export const INITIAL_LEADERBOARD = [];

// Smaller world size for a "Cozy Room" feel
export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 800;

export const ZONES: Record<ZoneId, ZoneData> = {
  [ZoneId.TOWN_SQUARE]: {
    id: ZoneId.TOWN_SQUARE,
    name: "Cozy Christmas Cabin",
    description: "Warm yourself by the fire and play with friends!",
    width: 1000,
    height: 800,
    backgroundPattern: 'repeating-linear-gradient(45deg, #2f1b1b 0px, #3f2b2b 20px)', 
    interactables: [
      { id: 'game_trivia_1', x: 200, y: 200, label: 'Trivia Fireplace', icon: '🔥', type: 'GAME', gameType: MiniGameType.TRIVIA, range: 80 },
      { id: 'game_clicker_1', x: 800, y: 200, label: 'Gift Wrapping', icon: '🎁', type: 'GAME', gameType: MiniGameType.CLICKER, range: 80 },
      { id: 'npc_santa', x: 500, y: 150, label: 'Santa', icon: '🎅', type: 'NPC', message: "Welcome! The highest score wins a real prize!", range: 100 },
      { id: 'portal_forest', x: 500, y: 700, label: 'Go Outside', icon: '🌲', type: 'PORTAL', targetZone: ZoneId.MYSTIC_FOREST, range: 80 },
    ]
  },
  [ZoneId.MYSTIC_FOREST]: {
    id: ZoneId.MYSTIC_FOREST,
    name: "Snowy Backyard",
    description: "Fresh snow and hidden secrets.",
    width: 1000,
    height: 800,
    backgroundPattern: 'radial-gradient(circle, #e0f2fe 0%, #0c4a6e 100%)',
    interactables: [
      { id: 'portal_square', x: 500, y: 100, label: 'Enter Cabin', icon: '🏠', type: 'PORTAL', targetZone: ZoneId.TOWN_SQUARE, range: 80 },
      { id: 'game_trivia_2', x: 800, y: 600, label: 'Snowman Riddle', icon: '☃️', type: 'GAME', gameType: MiniGameType.TRIVIA, range: 80 },
    ]
  },
  // Kept other zones but made them unreachable or simpler for now to focus on the experience
  [ZoneId.FROZEN_LAKE]: {
    id: ZoneId.FROZEN_LAKE,
    name: "Frozen Lake",
    description: "Slippery!",
    width: 1000,
    height: 800,
    backgroundPattern: 'linear-gradient(to bottom, #bae6fd, #7dd3fc)',
    interactables: [
      { id: 'portal_square', x: 500, y: 700, label: 'Back', icon: '🏠', type: 'PORTAL', targetZone: ZoneId.TOWN_SQUARE, range: 80 }
    ]
  },
  [ZoneId.SANTA_WORKSHOP]: {
    id: ZoneId.SANTA_WORKSHOP,
    name: "Workshop",
    description: "Toys everywhere!",
    width: 1000,
    height: 800,
    backgroundPattern: 'bg-red-900',
    interactables: [
      { id: 'portal_square', x: 500, y: 700, label: 'Exit', icon: '🚪', type: 'PORTAL', targetZone: ZoneId.TOWN_SQUARE, range: 80 }
    ]
  }
};

export const HIDDEN_EGGS: EasterEgg[] = [
  { id: 'egg_1', zoneId: ZoneId.TOWN_SQUARE, x: 100, y: 700, found: false },
  { id: 'egg_2', zoneId: ZoneId.TOWN_SQUARE, x: 900, y: 700, found: false },
  { id: 'egg_3', zoneId: ZoneId.MYSTIC_FOREST, x: 200, y: 400, found: false },
];