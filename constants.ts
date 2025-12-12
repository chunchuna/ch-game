import { ZoneId, ZoneData, MiniGameType, EasterEgg } from './types';

export const INITIAL_LEADERBOARD = [
  { id: 'p2', name: 'ElfTwinkle', score: 8500, isCurrentUser: false, avatar: '🧝' },
  { id: 'p3', name: 'RudolphRacer', score: 6200, isCurrentUser: false, avatar: '🦌' },
  { id: 'p4', name: 'FrostyFan', score: 4500, isCurrentUser: false, avatar: '⛄' },
  { id: 'p5', name: 'MrsClausCookie', score: 2100, isCurrentUser: false, avatar: '👵' },
];

export const ZONES: Record<ZoneId, ZoneData> = {
  [ZoneId.TOWN_SQUARE]: {
    id: ZoneId.TOWN_SQUARE,
    name: "North Pole Square",
    description: "The bustling heart of the village. A giant tree sparkles in the center.",
    backgroundUrl: "https://picsum.photos/id/604/1200/800", // Snow/mountains
    interactables: [
      { id: 'portal_forest', x: 80, y: 50, label: 'To Forest', icon: '🌲', type: 'PORTAL', targetZone: ZoneId.MYSTIC_FOREST },
      { id: 'portal_lake', x: 20, y: 60, label: 'To Lake', icon: '❄️', type: 'PORTAL', targetZone: ZoneId.FROZEN_LAKE },
      { id: 'portal_workshop', x: 50, y: 20, label: 'To Workshop', icon: '🏠', type: 'PORTAL', targetZone: ZoneId.SANTA_WORKSHOP },
      { id: 'game_trivia_1', x: 45, y: 60, label: 'Wise Owl', icon: '🦉', type: 'GAME', gameType: MiniGameType.TRIVIA },
    ]
  },
  [ZoneId.FROZEN_LAKE]: {
    id: ZoneId.FROZEN_LAKE,
    name: "Crystal Lake",
    description: "A slippery sheet of ice reflecting the aurora above.",
    backgroundUrl: "https://picsum.photos/id/1036/1200/800", // Winter nature
    interactables: [
      { id: 'portal_square', x: 90, y: 80, label: 'Back to Town', icon: '🏘️', type: 'PORTAL', targetZone: ZoneId.TOWN_SQUARE },
      { id: 'game_clicker_1', x: 30, y: 40, label: 'Speedy Skater', icon: '⛸️', type: 'GAME', gameType: MiniGameType.CLICKER },
    ]
  },
  [ZoneId.MYSTIC_FOREST]: {
    id: ZoneId.MYSTIC_FOREST,
    name: "Whispering Pines",
    description: "Ancient trees guard secrets in the deep snow.",
    backgroundUrl: "https://picsum.photos/id/1029/1200/800", // Forest park
    interactables: [
      { id: 'portal_square', x: 10, y: 80, label: 'Back to Town', icon: '🏘️', type: 'PORTAL', targetZone: ZoneId.TOWN_SQUARE },
      { id: 'game_trivia_2', x: 70, y: 30, label: 'Old Snowman', icon: '☃️', type: 'GAME', gameType: MiniGameType.TRIVIA },
    ]
  },
  [ZoneId.SANTA_WORKSHOP]: {
    id: ZoneId.SANTA_WORKSHOP,
    name: "Santa's Workshop",
    description: "The warm, noisy factory where magic happens.",
    backgroundUrl: "https://picsum.photos/id/401/1200/800", // Indoors/warm tone
    interactables: [
      { id: 'portal_square', x: 50, y: 90, label: 'Exit to Town', icon: '🚪', type: 'PORTAL', targetZone: ZoneId.TOWN_SQUARE },
      { id: 'game_clicker_2', x: 20, y: 50, label: 'Wrap Master', icon: '🎁', type: 'GAME', gameType: MiniGameType.CLICKER },
    ]
  }
};

export const HIDDEN_EGGS: EasterEgg[] = [
  { id: 'egg_1', zoneId: ZoneId.TOWN_SQUARE, x: 12, y: 15, found: false },
  { id: 'egg_2', zoneId: ZoneId.SANTA_WORKSHOP, x: 88, y: 25, found: false },
  { id: 'egg_3', zoneId: ZoneId.MYSTIC_FOREST, x: 5, y: 90, found: false },
  { id: 'egg_4', zoneId: ZoneId.FROZEN_LAKE, x: 60, y: 10, found: false },
];