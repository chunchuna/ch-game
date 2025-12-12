import React, { useState, useEffect } from 'react';
import { MiniGameType, TriviaQuestion } from '../types';
import { generateChristmasTrivia, judgeMiniGame } from '../services/geminiService';

interface MiniGameModalProps {
  type: MiniGameType;
  isOpen: boolean;
  onClose: () => void;
  onWin: (points: number) => void;
}

export const MiniGameModal: React.FC<MiniGameModalProps> = ({ type, isOpen, onClose, onWin }) => {
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WON' | 'LOST'>('START');
  const [trivia, setTrivia] = useState<TriviaQuestion | null>(null);
  const [congratsMsg, setCongratsMsg] = useState("");
  
  // Clicker State
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setGameState('START');
      setClicks(0);
      setTimeLeft(5);
      setTrivia(null);
      setCongratsMsg("");
    }
  }, [isOpen]);

  // Clicker Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameState === 'PLAYING' && type === MiniGameType.CLICKER) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState('LOST');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, type]);

  const startGame = async () => {
    setLoading(true);
    if (type === MiniGameType.TRIVIA) {
      const q = await generateChristmasTrivia();
      setTrivia(q);
      setGameState('PLAYING');
    } else if (type === MiniGameType.CLICKER) {
      setGameState('PLAYING');
    }
    setLoading(false);
  };

  const handleTriviaAnswer = async (index: number) => {
    if (!trivia) return;
    if (index === trivia.correctAnswerIndex) {
      const msg = await judgeMiniGame("answering a Christmas trivia correctly");
      setCongratsMsg(msg);
      setGameState('WON');
      onWin(30); // 30 Points for Trivia
    } else {
      setGameState('LOST');
    }
  };

  const handleClicker = async () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 15) {
      const msg = await judgeMiniGame("wrapping gifts extremely fast");
      setCongratsMsg(msg);
      setGameState('WON');
      onWin(20); // 20 Points for Clicker
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border-2 border-yellow-500 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white p-2">✕</button>

        <div className="p-6 text-center">
          <h2 className="text-2xl font-christmas text-yellow-400 mb-4">
            {type === MiniGameType.TRIVIA ? 'Christmas Trivia' : 'Gift Rush'}
          </h2>

          {loading && <div className="text-white animate-pulse">Summoning holiday spirit...</div>}

          {!loading && gameState === 'START' && (
             <div className="space-y-4">
               <p className="text-gray-300">
                 {type === MiniGameType.TRIVIA 
                   ? "Answer correctly to earn 30 points!" 
                   : "Click the button 15 times in 5 seconds to earn 20 points!"}
               </p>
               <button 
                 onClick={startGame}
                 className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105 shadow-lg shadow-red-900/50"
               >
                 Play Now
               </button>
             </div>
          )}

          {!loading && gameState === 'PLAYING' && type === MiniGameType.TRIVIA && trivia && (
            <div className="space-y-4 text-left">
              <p className="text-lg font-bold text-white mb-4">{trivia.question}</p>
              <div className="grid grid-cols-1 gap-2">
                {trivia.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTriviaAnswer(idx)}
                    className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg text-left transition hover:border-yellow-400 border border-transparent"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && gameState === 'PLAYING' && type === MiniGameType.CLICKER && (
            <div className="space-y-6">
              <div className="text-6xl font-bold text-white mb-2 select-none">{clicks} / 15</div>
              <div className="text-red-400 font-mono text-xl">Time: {timeLeft}s</div>
              <button
                onMouseDown={handleClicker}
                className="bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold w-full h-32 rounded-xl text-2xl shadow-green-900/50 shadow-lg select-none"
              >
                CLICK ME!
              </button>
            </div>
          )}

          {gameState === 'WON' && (
            <div className="animate-float">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">You Won!</h3>
              <p className="text-yellow-200 italic mb-4">"{congratsMsg}"</p>
              <p className="text-gray-300">Points added to your score.</p>
              <button onClick={onClose} className="mt-6 bg-slate-600 px-6 py-2 rounded-lg hover:bg-slate-500">Continue</button>
            </div>
          )}

          {gameState === 'LOST' && (
            <div>
               <div className="text-6xl mb-4">🧊</div>
               <h3 className="text-2xl font-bold text-blue-300 mb-2">Oh no!</h3>
               <p className="text-gray-300">Better luck next time.</p>
               <button onClick={startGame} className="mt-6 bg-slate-600 px-6 py-2 rounded-lg hover:bg-slate-500 mr-2">Retry</button>
               <button onClick={onClose} className="mt-6 bg-transparent border border-slate-500 px-6 py-2 rounded-lg hover:bg-slate-700">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};