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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isCurrentUser: boolean;
  avatar: string;
  // Position
  x: number;
  y: number;
  // Movement
  vx?: number;
  vy?: number;
  // Chat
  currentMessage?: string;
  messageTimer?: number; // Time until bubble disappears
}

export interface Interactable {
  id: string;
  x: number; // World X
  y: number; // World Y
  label: string;
  icon: string;
  type: 'GAME' | 'NPC' | 'PORTAL';
  gameType?: MiniGameType;
  targetZone?: ZoneId;
  message?: string;
  range: number; // Interaction radius
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
  width: number;
  height: number;
  backgroundPattern: string; // CSS background/color
  interactables: Interactable[];
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}