import React from 'react';
import { ZoneData, Interactable, EasterEgg } from '../types';

interface WorldZoneProps {
  zone: ZoneData;
  hiddenEggs: EasterEgg[];
  onInteract: (target: Interactable) => void;
  onFoundEgg: (eggId: string) => void;
}

export const WorldZone: React.FC<WorldZoneProps> = ({ zone, hiddenEggs, onInteract, onFoundEgg }) => {
  // Filter eggs relevant to this zone and not found
  const eggsInZone = hiddenEggs.filter(egg => egg.zoneId === zone.id && !egg.found);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ background: zone.backgroundPattern }}
      >
        <div className="absolute inset-0 bg-black/30"></div> {/* Overlay for readability */}
      </div>

      {/* Zone Title */}
      <div className="absolute top-8 w-full text-center pointer-events-none">
        <h1 className="font-christmas text-4xl md:text-6xl text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          {zone.name}
        </h1>
        <p className="text-blue-100 drop-shadow-md text-sm md:text-lg mt-2 opacity-90">{zone.description}</p>
      </div>

      {/* Interactables (Portals and Games) */}
      {zone.interactables.map((item) => (
        <button
          key={item.id}
          onClick={() => onInteract(item)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 z-10"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          <div className={`
            w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-lg border-2
            ${item.type === 'PORTAL' ? 'bg-blue-600/80 border-blue-300 hover:bg-blue-500 animate-pulse' : 'bg-yellow-600/90 border-yellow-300 hover:bg-yellow-500'}
          `}>
            {item.icon}
          </div>
          <span className="mt-2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
            {item.label}
          </span>
        </button>
      ))}

      {/* Hidden Easter Eggs */}
      {eggsInZone.map((egg) => (
        <button
          key={egg.id}
          onClick={() => onFoundEgg(egg.id)}
          className="absolute w-8 h-8 opacity-20 hover:opacity-100 transition-opacity cursor-pointer z-0 hover:scale-125"
          style={{ left: `${egg.x}%`, top: `${egg.y}%` }}
          title="???"
        >
          🎁
        </button>
      ))}

      {/* Snow Effect (Simple CSS particles) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
           <div 
             key={i}
             className="absolute bg-white rounded-full opacity-70 animate-float"
             style={{
               width: Math.random() * 6 + 2 + 'px',
               height: Math.random() * 6 + 2 + 'px',
               top: Math.random() * 100 + '%',
               left: Math.random() * 100 + '%',
               animationDuration: Math.random() * 5 + 3 + 's',
               animationDelay: Math.random() * 2 + 's'
             }}
           />
        ))}
      </div>
    </div>
  );
};