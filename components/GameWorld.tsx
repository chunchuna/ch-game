import React, { useRef, useEffect, useState } from 'react';
import { Player, ZoneData, Interactable, EasterEgg } from '../types';

interface GameWorldProps {
  zone: ZoneData;
  player: Player;
  otherPlayers: Player[];
  hiddenEggs: EasterEgg[];
  onMovePlayer: (x: number, y: number) => void;
  onInteract: (item: Interactable) => void;
  onFoundEgg: (eggId: string) => void;
  onChatBubbleExpire: (playerId: string) => void;
}

// Keyboard Hook
function useKeyboard() {
  const [keys, setKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      // Don't trigger movement if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      setKeys(k => ({ ...k, [e.code]: true }));
    };
    const handleUp = (e: KeyboardEvent) => setKeys(k => ({ ...k, [e.code]: false }));
    
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  return keys;
}

export const GameWorld: React.FC<GameWorldProps> = ({ 
  zone, player, otherPlayers, hiddenEggs, onMovePlayer, onInteract, onFoundEgg, onChatBubbleExpire
}) => {
  const keys = useKeyboard();
  const requestRef = useRef<number>(0);
  const SPEED = 5;

  // Game Loop
  const animate = () => {
    let dx = 0;
    let dy = 0;

    if (keys['KeyW'] || keys['ArrowUp']) dy -= SPEED;
    if (keys['KeyS'] || keys['ArrowDown']) dy += SPEED;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= SPEED;
    if (keys['KeyD'] || keys['ArrowRight']) dx += SPEED;

    // Normalizing diagonal speed
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    if (dx !== 0 || dy !== 0) {
      // Boundary checks
      const nextX = Math.max(20, Math.min(zone.width - 20, player.x + dx));
      const nextY = Math.max(20, Math.min(zone.height - 20, player.y + dy));
      onMovePlayer(nextX, nextY);

      // Distance Check for Interactions
      checkInteractions(nextX, nextY);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [keys, player.x, player.y, zone]); // Dependencies for loop

  const checkInteractions = (px: number, py: number) => {
    // Check Eggs
    hiddenEggs.forEach(egg => {
      if (egg.zoneId === zone.id && !egg.found) {
        const dist = Math.hypot(egg.x - px, egg.y - py);
        if (dist < 40) onFoundEgg(egg.id);
      }
    });
  };

  // Interaction key listener (E or Enter is handled by global, but let's check proximity)
  const getNearestInteractable = () => {
    let nearest: Interactable | null = null;
    let minDst = Infinity;

    zone.interactables.forEach(item => {
      const dst = Math.hypot(item.x - player.x, item.y - player.y);
      if (dst < item.range && dst < minDst) {
        minDst = dst;
        nearest = item;
      }
    });
    return nearest;
  };

  const nearestItem = getNearestInteractable();

  // Handle interaction click
  useEffect(() => {
    const handleInteractKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && nearestItem) {
        onInteract(nearestItem);
      }
    };
    window.addEventListener('keydown', handleInteractKey);
    return () => window.removeEventListener('keydown', handleInteractKey);
  }, [nearestItem, onInteract]);


  // Camera Logic: Center player on screen
  // viewport is window.innerWidth/Height
  const camX = -player.x + window.innerWidth / 2;
  const camY = -player.y + window.innerHeight / 2;

  const renderPlayer = (p: Player) => (
    <div 
      key={p.id}
      className="absolute flex flex-col items-center transition-transform duration-100 ease-linear z-20"
      style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
    >
      {/* Speech Bubble */}
      {p.currentMessage && (
        <div className="absolute -top-16 bg-white text-black px-3 py-2 rounded-xl text-sm font-bold shadow-lg whitespace-nowrap animate-float z-30 border border-gray-300">
           {p.currentMessage}
           <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
        </div>
      )}

      {/* Name */}
      <span className={`text-xs font-bold mb-1 px-2 py-0.5 rounded bg-black/50 ${p.isCurrentUser ? 'text-yellow-300' : 'text-white'}`}>
        {p.name}
      </span>
      
      {/* Avatar */}
      <div className={`text-4xl filter drop-shadow-lg ${p.isCurrentUser ? 'scale-110' : ''}`}>
        {p.avatar}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
      {/* Camera Container */}
      <div 
        className="will-change-transform"
        style={{ 
          transform: `translate(${camX}px, ${camY}px)`,
          width: zone.width,
          height: zone.height,
          background: zone.backgroundPattern
        }}
      >
        {/* Grid Floor Effect (CSS) */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {/* Interactables */}
        {zone.interactables.map(item => (
          <div 
            key={item.id}
            className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: item.x, top: item.y }}
          >
             <div className="text-4xl animate-pulse cursor-pointer hover:scale-125 transition-transform" onClick={() => onInteract(item)}>
               {item.icon}
             </div>
             <span className="mt-2 bg-black/60 px-2 py-1 rounded text-white text-xs">{item.label}</span>
             {/* Interaction Ring */}
             <div className="absolute border-2 border-yellow-400/30 rounded-full w-[120%] h-[120%] animate-ping" style={{ width: item.range * 2, height: item.range * 2}} />
          </div>
        ))}

        {/* Eggs */}
        {hiddenEggs.filter(e => e.zoneId === zone.id && !e.found).map(egg => (
          <div 
            key={egg.id}
            className="absolute text-2xl animate-bounce cursor-pointer hover:scale-125"
            style={{ left: egg.x, top: egg.y }}
            onClick={() => onFoundEgg(egg.id)}
          >
            🎁
          </div>
        ))}

        {/* Other Players */}
        {otherPlayers.map(renderPlayer)}

        {/* Local Player */}
        {renderPlayer(player)}
      </div>

      {/* Interaction Hint */}
      {nearestItem && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white font-bold text-xl animate-bounce drop-shadow-md">
           Press <span className="bg-yellow-500 text-black px-2 rounded">E</span> to interact with {nearestItem.label}
        </div>
      )}
    </div>
  );
};