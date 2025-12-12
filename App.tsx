import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { ZONES, HIDDEN_EGGS, INITIAL_LEADERBOARD } from './constants';
import { ZoneId, Player, Interactable, MiniGameType, EasterEgg, ChatMessage } from './types';
import { GameWorld } from './components/GameWorld';
import { Leaderboard } from './components/Leaderboard';
import { MiniGameModal } from './components/MiniGameModal';
import { ChatInterface } from './components/ChatInterface';
import { judgeMiniGame } from './services/geminiService';

const App: React.FC = () => {
  // Player State
  const [player, setPlayer] = useState<Player>({
    id: 'p1',
    name: 'SnowExplorer',
    score: 0,
    isCurrentUser: true,
    avatar: '🎅',
    x: 1000,
    y: 1000
  });

  // World State
  const [currentZoneId, setCurrentZoneId] = useState<ZoneId>(ZoneId.TOWN_SQUARE);
  const [easterEggs, setEasterEggs] = useState<EasterEgg[]>(HIDDEN_EGGS);
  
  // Fake Multiplayer State
  const [otherPlayers, setOtherPlayers] = useState<Player[]>(INITIAL_LEADERBOARD);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Game UI State
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameType | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // --- Bot Simulation Logic ---
  useEffect(() => {
    const interval = setInterval(() => {
      setOtherPlayers(prev => prev.map(p => {
        // 1. Move Randomly
        let dx = (Math.random() - 0.5) * 20;
        let dy = (Math.random() - 0.5) * 20;
        
        // Keep within bounds roughly
        let newX = Math.max(100, Math.min(1900, p.x + dx));
        let newY = Math.max(100, Math.min(1900, p.y + dy));

        // 2. Chat Simulation (1% chance per tick)
        let newMsg = p.currentMessage;
        let newTimer = p.messageTimer;

        if (Math.random() < 0.01 && !p.currentMessage) {
           const phrases = ["Merry Christmas!", "Where is the egg?", "Nice moves!", "Need coffee...", "Anyone found the secret?"];
           const text = phrases[Math.floor(Math.random() * phrases.length)];
           newMsg = text;
           newTimer = Date.now() + 4000;
           
           // Add to global chat log
           const chatMsg: ChatMessage = {
             id: Math.random().toString(),
             senderId: p.id,
             senderName: p.name,
             text: text,
             timestamp: Date.now()
           };
           setMessages(msgs => [...msgs, chatMsg]);
        }

        // 3. Clear expired messages
        if (newTimer && Date.now() > newTimer) {
           newMsg = undefined;
           newTimer = undefined;
        }

        return { ...p, x: newX, y: newY, currentMessage: newMsg, messageTimer: newTimer };
      }));
    }, 100); // Update bots 10 times a second

    return () => clearInterval(interval);
  }, []);

  // --- Local Player Logic ---

  // Chat Bubble Timer for Local Player
  useEffect(() => {
    if (player.currentMessage && player.messageTimer && Date.now() > player.messageTimer) {
      setPlayer(p => ({ ...p, currentMessage: undefined, messageTimer: undefined }));
    }
    const timer = setInterval(() => {
       if (player.currentMessage && player.messageTimer && Date.now() > player.messageTimer) {
         setPlayer(p => ({ ...p, currentMessage: undefined, messageTimer: undefined }));
       }
    }, 500);
    return () => clearInterval(timer);
  }, [player.messageTimer]);

  const handlePlayerMove = (x: number, y: number) => {
    setPlayer(prev => ({ ...prev, x, y }));
  };

  const handleInteract = (target: Interactable) => {
    if (target.type === 'PORTAL' && target.targetZone) {
      setCurrentZoneId(target.targetZone);
      // Reset position slightly for effect (center of new zone for now)
      setPlayer(p => ({ ...p, x: 1000, y: 1000 }));
      showNotification(`Entered ${target.label}`);
    } else if (target.type === 'GAME' && target.gameType) {
      setActiveMiniGame(target.gameType);
    } else if (target.type === 'NPC') {
      showNotification(target.message || "Hello!");
    }
  };

  const handleSendMessage = (text: string) => {
    // 1. Add bubble to player
    setPlayer(p => ({ ...p, currentMessage: text, messageTimer: Date.now() + 5000 }));
    
    // 2. Add to chat log
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: player.id,
      senderName: player.name,
      text: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, msg]);

    // 3. Fun: Gemini Judge reaction to chat keywords? (Optional easter egg)
    if (text.toLowerCase().includes("christmas")) {
      judgeMiniGame(text).then(response => {
        // Maybe NPC responds?
      });
    }
  };

  const handleMiniGameWin = (points: number) => {
    setPlayer(prev => ({ ...prev, score: prev.score + points }));
    showNotification(`Mini-Game Won! +${points} Points!`);
    setTimeout(() => {
       setActiveMiniGame(null);
    }, 2500);
  };

  const handleFoundEgg = (eggId: string) => {
    setEasterEggs(prev => prev.map(egg => egg.id === eggId ? { ...egg, found: true } : egg));
    setPlayer(prev => ({ ...prev, score: prev.score + 10000 }));
    showNotification("🌟 SECRET FOUND! +10,000 POINTS! 🌟");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative font-sans">
      
      {/* Game World (Canvas/DOM) */}
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

      {/* UI Overlay Layer */}
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

        {/* Stats Corner */}
        <div className="absolute bottom-4 right-4 z-50 text-white bg-black/50 p-4 rounded-xl backdrop-blur-md border border-white/20 pointer-events-auto">
           <div className="text-xs text-gray-400">YOUR SCORE</div>
           <div className="text-4xl font-mono text-yellow-400 font-bold">{player.score.toLocaleString()}</div>
           <div className="text-xs text-right mt-2 text-blue-300">{ZONES[currentZoneId].name}</div>
           <div className="text-[10px] text-gray-500 text-right mt-1">POS: {Math.round(player.x)}, {Math.round(player.y)}</div>
        </div>

        {/* Controls Hint */}
        <div className="absolute top-4 right-4 text-white/50 text-xs text-right hidden md:block">
           Use <span className="font-bold text-white">WASD</span> to Move<br/>
           Press <span className="font-bold text-white">ENTER</span> to Chat<br/>
           Press <span className="font-bold text-white">E</span> to Interact
        </div>
      </div>

      {/* Modals (Outside the camera transform) */}
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

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}