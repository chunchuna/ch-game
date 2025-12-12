import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ZONES, HIDDEN_EGGS, INITIAL_LEADERBOARD } from './constants';
import { ZoneId, Player, Interactable, MiniGameType, EasterEgg } from './types';
import { WorldZone } from './components/WorldZone';
import { Leaderboard } from './components/Leaderboard';
import { MiniGameModal } from './components/MiniGameModal';

const App: React.FC = () => {
  // Player State
  const [player, setPlayer] = useState<Player>({
    id: 'p1',
    name: 'SnowExplorer',
    score: 0,
    isCurrentUser: true,
    avatar: '🎅'
  });

  // World State
  const [currentZoneId, setCurrentZoneId] = useState<ZoneId>(ZoneId.TOWN_SQUARE);
  const [easterEggs, setEasterEggs] = useState<EasterEgg[]>(HIDDEN_EGGS);
  const [leaderboard, setLeaderboard] = useState<Player[]>([player, ...INITIAL_LEADERBOARD]);
  
  // Game UI State
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameType | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // --- Logic ---

  // Update leaderboard periodically to simulate other players
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard(prev => {
        return prev.map(p => {
          if (p.isCurrentUser) return p; // Don't auto-update user
          // Randomly add points to bots
          if (Math.random() > 0.7) {
            return { ...p, score: p.score + Math.floor(Math.random() * 50) };
          }
          return p;
        });
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync current user score to leaderboard
  useEffect(() => {
    setLeaderboard(prev => prev.map(p => p.isCurrentUser ? player : p));
  }, [player]);

  const handleInteract = (target: Interactable) => {
    if (target.type === 'PORTAL' && target.targetZone) {
      setCurrentZoneId(target.targetZone);
    } else if (target.type === 'GAME' && target.gameType) {
      setActiveMiniGame(target.gameType);
    }
  };

  const handleMiniGameWin = (points: number) => {
    setPlayer(prev => ({ ...prev, score: prev.score + points }));
    showNotification(`Mini-Game Won! +${points} Points!`);
    // Close modal handled by modal's continue button logic if we wanted, 
    // but here we keep modal open until user closes or continues. 
    // We'll close it automatically after a win for smoother flow in this demo.
    setTimeout(() => {
       setActiveMiniGame(null);
    }, 2500);
  };

  const handleFoundEgg = (eggId: string) => {
    setEasterEggs(prev => prev.map(egg => egg.id === eggId ? { ...egg, found: true } : egg));
    setPlayer(prev => ({ ...prev, score: prev.score + 10000 }));
    
    // Play sound effect or visual flare
    showNotification("🌟 SECRET FOUND! +10,000 POINTS! 🌟");
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/* UI Layer */}
      <Leaderboard players={leaderboard} />

      {/* Notification Toast */}
      {notification && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[60] animate-bounce">
          <div className="bg-yellow-500 text-black font-bold px-8 py-4 rounded-full shadow-lg border-4 border-white text-lg">
            {notification}
          </div>
        </div>
      )}

      {/* Stats Corner */}
      <div className="absolute bottom-4 left-4 z-50 text-white bg-black/50 p-4 rounded-xl backdrop-blur-md border border-white/20">
         <div className="text-xs text-gray-400">YOUR SCORE</div>
         <div className="text-4xl font-mono text-yellow-400 font-bold">{player.score.toLocaleString()}</div>
      </div>

      <div className="absolute bottom-4 right-4 z-50 text-white text-right">
        <div className="text-xs text-gray-400">CURRENT ZONE</div>
        <div className="text-xl font-christmas">{ZONES[currentZoneId].name}</div>
      </div>

      {/* Main World View */}
      <WorldZone 
        zone={ZONES[currentZoneId]}
        hiddenEggs={easterEggs}
        onInteract={handleInteract}
        onFoundEgg={handleFoundEgg}
      />

      {/* Modals */}
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

// Root Rendering
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}