import React, { useState, useEffect, useRef } from 'react';
import { ZONES, HIDDEN_EGGS, WORLD_WIDTH, WORLD_HEIGHT } from './constants';
import { ZoneId, Player, Interactable, MiniGameType, EasterEgg, ChatMessage } from './types';
import { GameWorld } from './components/GameWorld';
import { Leaderboard } from './components/Leaderboard';
import { MiniGameModal } from './components/MiniGameModal';
import { ChatInterface } from './components/ChatInterface';
import { judgeMiniGame } from './services/geminiService';
import { NetworkService } from './services/networkService';

export const App: React.FC = () => {
  const networkRef = useRef<NetworkService | null>(null);
  const playerRef = useRef<Player | null>(null); // Ref to access latest player state in callbacks

  // Player State
  const [player, setPlayer] = useState<Player>({
    id: 'init', 
    name: 'Elf_' + Math.floor(Math.random() * 900 + 100),
    score: 0,
    isCurrentUser: true,
    avatar: ['🎅', '🧝', '🦌', '⛄', '🤶'][Math.floor(Math.random() * 5)],
    x: WORLD_WIDTH / 2 + (Math.random() * 100 - 50), // Randomize start slightly
    y: WORLD_HEIGHT / 2 + (Math.random() * 100 - 50)
  });

  // Keep ref synced for network callbacks
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const [currentZoneId, setCurrentZoneId] = useState<ZoneId>(ZoneId.TOWN_SQUARE);
  const [easterEggs, setEasterEggs] = useState<EasterEgg[]>(HIDDEN_EGGS);
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameType | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // --- Initialize Network ---
  useEffect(() => {
    const net = new NetworkService();
    networkRef.current = net;

    // 1. Set my real ID
    setPlayer(p => ({ ...p, id: net.getMyId() }));

    // 2. Announce myself immediately (give it a second for connection to stabilize)
    setTimeout(() => {
       if (playerRef.current) net.broadcastMove(playerRef.current);
    }, 1000);

    // Listeners
    net.onPlayerMoved = (remotePlayer) => {
      setOtherPlayers(prev => {
        const idx = prev.findIndex(p => p.id === remotePlayer.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { 
            ...updated[idx], 
            x: remotePlayer.x, 
            y: remotePlayer.y, 
            score: remotePlayer.score, 
            name: remotePlayer.name, 
            avatar: remotePlayer.avatar 
          };
          return updated;
        } else {
          return [...prev, remotePlayer];
        }
      });
    };

    net.onPeerJoined = (peerId) => {
      // Someone new joined! Send them MY info so they can see me.
      if (playerRef.current) {
        console.log("New peer joined, sending my state...");
        net.broadcastMove(playerRef.current);
      }
      showNotification("A new player has entered!");
    };

    net.onPlayerLeft = (peerId) => {
      setOtherPlayers(prev => prev.filter(p => p.id !== peerId));
    };

    net.onChatMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      setOtherPlayers(prev => prev.map(p => {
        if (p.id === msg.senderId) {
          return { ...p, currentMessage: msg.text, messageTimer: Date.now() + 5000 };
        }
        return p;
      }));
    };

    net.onScoreUpdate = (peerId, newScore) => {
      setOtherPlayers(prev => prev.map(p => {
         if (p.id === peerId) return { ...p, score: newScore };
         return p;
      }));
    };

    return () => {
      // Cleanup
    };
  }, []);

  // --- Broadcast My Movement ---
  const lastBroadcastRef = useRef(0);

  const handlePlayerMove = (x: number, y: number) => {
    setPlayer(prev => {
      const updated = { ...prev, x, y };
      
      const now = Date.now();
      // Broadcast every 50ms max
      if (networkRef.current && now - lastBroadcastRef.current > 50) {
        networkRef.current.broadcastMove(updated);
        lastBroadcastRef.current = now;
      }
      return updated;
    });
  };

  // --- Chat Bubble Timer Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (player.messageTimer && now > player.messageTimer) {
        setPlayer(p => ({ ...p, currentMessage: undefined, messageTimer: undefined }));
      }
      setOtherPlayers(prev => prev.map(p => {
        if (p.messageTimer && now > p.messageTimer) {
          return { ...p, currentMessage: undefined, messageTimer: undefined };
        }
        return p;
      }));
    }, 500);
    return () => clearInterval(interval);
  }, [player.messageTimer]);

  const handleInteract = (target: Interactable) => {
    if (target.type === 'PORTAL' && target.targetZone) {
      setCurrentZoneId(target.targetZone);
      handlePlayerMove(WORLD_WIDTH/2, WORLD_HEIGHT/2);
      showNotification(`Entered ${target.label}`);
    } else if (target.type === 'GAME' && target.gameType) {
      setActiveMiniGame(target.gameType);
    } else if (target.type === 'NPC') {
      showNotification(target.message || "Hello!");
    }
  };

  const handleSendMessage = (text: string) => {
    setPlayer(p => ({ ...p, currentMessage: text, messageTimer: Date.now() + 5000 }));
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      senderId: player.id,
      senderName: player.name,
      text: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);
    if (networkRef.current) networkRef.current.broadcastChat(msg);
    if (text.toLowerCase().includes("christmas")) judgeMiniGame(text);
  };

  const handleMiniGameWin = (points: number) => {
    setPlayer(prev => {
      const newScore = prev.score + points;
      if (networkRef.current) {
        networkRef.current.broadcastScore(prev.id, newScore);
        networkRef.current.broadcastMove({ ...prev, score: newScore });
      }
      return { ...prev, score: newScore };
    });
    showNotification(`Mini-Game Won! +${points} Points!`);
    setTimeout(() => setActiveMiniGame(null), 2500);
  };

  const handleFoundEgg = (eggId: string) => {
    setEasterEggs(prev => prev.map(egg => egg.id === eggId ? { ...egg, found: true } : egg));
    setPlayer(prev => {
      const newScore = prev.score + 10000;
      if (networkRef.current) networkRef.current.broadcastScore(prev.id, newScore);
      return { ...prev, score: newScore };
    });
    showNotification("🌟 SECRET FOUND! +10,000 POINTS! 🌟");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative font-sans">
      <GameWorld 
        zone={ZONES[currentZoneId]}
        player={player}
        otherPlayers={otherPlayers}
        hiddenEggs={easterEggs}
        onMovePlayer={handlePlayerMove}
        onInteract={handleInteract}
        onFoundEgg={handleFoundEgg}
        onChatBubbleExpire={() => {}}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
           <Leaderboard players={[player, ...otherPlayers]} />
        </div>
        <div className="pointer-events-auto">
          <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
        </div>
        {notification && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[60] animate-bounce pointer-events-auto">
            <div className="bg-yellow-500 text-black font-bold px-8 py-4 rounded-full shadow-lg border-4 border-white text-lg">
              {notification}
            </div>
          </div>
        )}
        <div className="absolute bottom-4 right-4 z-50 text-white bg-black/50 p-4 rounded-xl backdrop-blur-md border border-white/20 pointer-events-auto">
           <div className="text-xs text-gray-400">YOUR SCORE</div>
           <div className="text-4xl font-mono text-yellow-400 font-bold">{player.score.toLocaleString()}</div>
           <div className="text-xs text-right mt-2 text-blue-300">{ZONES[currentZoneId].name}</div>
           <div className="text-[10px] text-gray-500 text-right mt-1">POS: {Math.round(player.x)}, {Math.round(player.y)}</div>
           <div className="text-[10px] text-green-400 text-right mt-1">ONLINE: {otherPlayers.length + 1}</div>
        </div>
        <div className="absolute top-4 right-4 text-white/50 text-xs text-right hidden md:block">
           Use <span className="font-bold text-white">WASD</span> to Move<br/>
           Press <span className="font-bold text-white">ENTER</span> to Chat<br/>
           MULTIPLAYER ACTIVE <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </div>
      </div>
      {activeMiniGame && (
        <MiniGameModal
          type={activeMiniGame}
          isOpen={true}
          onClose={() => setActiveMiniGame(null)}
          onWin={handleMiniGameWin}
        />
      )}
    </div>
  );
};