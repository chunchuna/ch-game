export enum ZoneId {
  TOWN_SQUARE = 'TOWN_SQUARE',
  FROZEN_LAKE = 'FROZEN_LAKE',
  SANTA_WORKSHOP = 'SANTA_WORKSHOP',
  MYSTIC_FOREST = 'MYSTIC_FOREST'
}

export enum MiniGameType {
  TRIVIA = 'TRIVIA',
  CLICKER = 'CLICKER',
  MEMORY = 'MEMORY'
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isCurrentUser: boolean;
  avatar: string;
}

export interface Interactable {
  id: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  label: string;
  icon: string;
  type: 'GAME' | 'NPC' | 'PORTAL';
  gameType?: MiniGameType;
  targetZone?: ZoneId;
  message?: string;
}

export interface EasterEgg {
  id: string;
  zoneId: ZoneId;
  x: number;
  y: number;
  found: boolean;
}

export interface ZoneData {
  id: ZoneId;
  name: string;
  description: string;
  backgroundUrl: string;
  interactables: Interactable[];
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}