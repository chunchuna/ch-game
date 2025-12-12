import React, { useEffect, useState } from 'react';
import { Player } from '../types';

interface LeaderboardProps {
  players: Player[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players }) => {
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);

  useEffect(() => {
    // Sort players by score descending
    const sorted = [...players].sort((a, b) => b.score - a.score);
    setSortedPlayers(sorted);
  }, [players]);

  return (
    <div className="absolute top-4 left-4 z-50 w-72 bg-slate-900/80 backdrop-blur-md border border-yellow-500/30 rounded-xl overflow-hidden shadow-2xl text-white">
      <div className="bg-gradient-to-r from-red-800 to-red-600 p-3 border-b border-yellow-500/50 flex justify-between items-center">
        <h2 className="font-christmas text-xl font-bold text-yellow-100">🏆 Top Elves</h2>
        <span className="text-xs text-red-200">LIVE</span>
      </div>
      <ul className="divide-y divide-white/10 max-h-64 overflow-y-auto">
        {sortedPlayers.map((player, index) => (
          <li 
            key={player.id} 
            className={`flex items-center justify-between p-3 ${player.isCurrentUser ? 'bg-yellow-500/20' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <span className={`font-bold w-4 text-center ${index < 3 ? 'text-yellow-400' : 'text-slate-400'}`}>
                {index + 1}
              </span>
              <span className="text-2xl">{player.avatar}</span>
              <div className="flex flex-col">
                <span className={`font-semibold text-sm ${player.isCurrentUser ? 'text-yellow-300' : 'text-white'}`}>
                  {player.name} {player.isCurrentUser && '(You)'}
                </span>
              </div>
            </div>
            <span className="font-mono text-yellow-400 font-bold">
              {player.score.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      <div className="p-2 bg-black/40 text-center text-xs text-gray-400">
        Highest score on Dec 25th wins!
      </div>
    </div>
  );
};