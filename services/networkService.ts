import { joinRoom } from 'trystero';
import { Player, ChatMessage } from '../types';

// Use a unique room ID. 
const ROOM_ID = 'christmas_world_2024_lobby_v2'; // Changed version to avoid stale peers from previous tests

interface MovePayload {
  x: number;
  y: number;
  id: string;
  name: string;
  avatar: string;
  score: number;
}

interface ChatPayload {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface ScorePayload {
  id: string;
  score: number;
}

export class NetworkService {
  private room: any;
  private sendMoveAction: any;
  private sendChatAction: any;
  private sendScoreAction: any;

  public onPlayerMoved: ((player: Player) => void) | null = null;
  public onPlayerLeft: ((playerId: string) => void) | null = null;
  public onChatMessage: ((msg: ChatMessage) => void) | null = null;
  public onScoreUpdate: ((playerId: string, newScore: number) => void) | null = null;
  public onPeerJoined: ((peerId: string) => void) | null = null; // New callback

  constructor() {
    this.room = joinRoom({ appId: 'christmas-hunt-game' }, ROOM_ID);

    const [sendMove, getMove] = this.room.makeAction('move');
    const [sendChat, getChat] = this.room.makeAction('chat');
    const [sendScore, getScore] = this.room.makeAction('score');

    this.sendMoveAction = sendMove;
    this.sendChatAction = sendChat;
    this.sendScoreAction = sendScore;

    this.room.onPeerJoin((peerId: string) => {
      console.log(`Peer ${peerId} joined`);
      // Notify App so it can broadcast my position to the new guy
      if (this.onPeerJoined) this.onPeerJoined(peerId);
    });

    this.room.onPeerLeave((peerId: string) => {
      console.log(`Peer ${peerId} left`);
      if (this.onPlayerLeft) this.onPlayerLeft(peerId);
    });

    getMove((data: MovePayload, peerId: string) => {
      const player: Player = {
        id: peerId, 
        name: data.name,
        avatar: data.avatar,
        score: data.score,
        isCurrentUser: false,
        x: data.x,
        y: data.y,
      };
      if (this.onPlayerMoved) this.onPlayerMoved(player);
    });

    getChat((data: ChatPayload, peerId: string) => {
      if (this.onChatMessage) this.onChatMessage(data);
    });

    getScore((data: ScorePayload, peerId: string) => {
      if (this.onScoreUpdate) this.onScoreUpdate(peerId, data.score);
    });
  }

  public broadcastMove(player: Player) {
    const payload: MovePayload = {
      x: player.x,
      y: player.y,
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      score: player.score
    };
    this.sendMoveAction(payload);
  }

  public broadcastChat(msg: ChatMessage) {
    this.sendChatAction(msg);
  }

  public broadcastScore(playerId: string, score: number) {
    this.sendScoreAction({ id: playerId, score });
  }

  public getMyId(): string {
    return this.room.selfId;
  }
}