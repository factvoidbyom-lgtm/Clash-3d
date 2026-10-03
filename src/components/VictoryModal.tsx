import React from 'react';
import { GameManager } from '../game/gameManager';
import { sounds } from '../game/audio';
import { RotateCcw, Home, Trophy } from 'lucide-react';

interface VictoryModalProps {
  game: GameManager;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ game }) => {
  if (game.state !== 'ROUND_OVER' && game.state !== 'MATCH_OVER' && game.state !== 'COUNTDOWN') {
    return null;
  }

  // 1. Initial 3... 2... 1... Battle Countdown Overlay
  if (game.state === 'COUNTDOWN') {
    return (
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
        <div className="bg-slate-900/85 backdrop-blur-md px-8 py-5 rounded-3xl border-2 border-amber-400/80 shadow-2xl flex flex-col items-center animate-cartoon-pop">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-1">
            Round {game.currentRound}
          </span>
          <span className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow">
            {game.roundCountdown > 0 ? game.roundCountdown : 'CLASH!'}
          </span>
        </div>
      </div>
    );
  }

  // 2. Round Over Overlay: "Player X Wins Round!"
  if (game.state === 'ROUND_OVER') {
    const winnerName =
      game.roundWinner === 1
        ? game.p1.name
        : game.roundWinner === 2
        ? game.p2.name
        : 'Draw';
    const isP1 = game.roundWinner === 1;

    return (
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center p-4">
        <div className="bg-slate-900/90 backdrop-blur-md px-8 py-6 rounded-3xl border-2 border-slate-700 shadow-2xl flex flex-col items-center animate-cartoon-pop max-w-sm w-full text-center">
          <span className="text-3xl mb-2">{isP1 ? '🎉' : '🔥'}</span>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-wide mb-1 ${
              isP1 ? 'text-blue-400' : 'text-rose-400'
            }`}
          >
            {winnerName} Wins!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-4">
            Round {game.currentRound} Finished
          </p>

          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-sm font-bold text-blue-400">
              {game.p1.name}: {game.p1Score}
            </span>
            <span className="text-slate-500 font-bold">-</span>
            <span className="text-sm font-bold text-rose-400">
              {game.p2.name}: {game.p2Score}
            </span>
          </div>

          <p className="text-xs text-amber-400 mt-3 font-semibold animate-pulse">
            Next round starting soon...
          </p>
        </div>
      </div>
    );
  }

  // 3. Match Champion Victory Screen
  if (game.state === 'MATCH_OVER') {
    const winnerName = game.matchWinner === 1 ? game.p1.name : game.p2.name;
    const isP1 = game.matchWinner === 1;

    return (
      <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center animate-cartoon-pop">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 bg-amber-500/20 rounded-2xl border border-amber-400/50 flex items-center justify-center text-amber-400">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            Match Champion
          </span>

          <h2
            className={`text-3xl sm:text-4xl font-extrabold uppercase mt-1 mb-2 ${
              isP1 ? 'text-blue-400' : 'text-rose-400'
            }`}
          >
            {winnerName} Wins!
          </h2>

          <p className="text-sm text-slate-300 mb-6">
            Final Score: {game.p1Score} - {game.p2Score}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                sounds.playButton();
                game.restartMatch();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            <button
              onClick={() => {
                sounds.playButton();
                game.quitToMenu();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
