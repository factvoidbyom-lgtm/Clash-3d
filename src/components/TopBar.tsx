import React from 'react';
import { GameManager } from '../game/gameManager';
import { sounds } from '../game/audio';
import { ArrowLeft, Settings, Volume2, VolumeX, Wind } from 'lucide-react';

interface TopBarProps {
  game: GameManager;
  onOpenSettings: () => void;
  onBack: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ game, onOpenSettings, onBack }) => {
  const isP1Turn = game.activeTurn === 1;
  const isAIMode = game.mode === 'AI';

  const toggleSound = () => {
    const newState = !game.settings.soundEnabled;
    game.settings.soundEnabled = newState;
    sounds.setSoundEnabled(newState);
    if (newState) sounds.playButton();
    if (game.onStateChange) game.onStateChange();
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-3 flex items-start justify-between">
      {/* Top Left Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => {
            sounds.playButton();
            onBack();
          }}
          className="h-10 w-10 sm:h-11 sm:w-11 bg-slate-900/85 hover:bg-slate-850 active:scale-95 text-slate-100 rounded-xl border border-slate-700/80 flex items-center justify-center shadow-lg transition-transform"
          aria-label="Back to Menu"
          title="Back to Menu"
        >
          <ArrowLeft className="w-5 h-5 text-slate-200" />
        </button>

        <button
          onClick={() => {
            sounds.playButton();
            onOpenSettings();
          }}
          className="h-10 w-10 sm:h-11 sm:w-11 bg-slate-900/85 hover:bg-slate-850 active:scale-95 text-slate-100 rounded-xl border border-slate-700/80 flex items-center justify-center shadow-lg transition-transform"
          aria-label="Game Settings"
          title="Game Settings"
        >
          <Settings className="w-5 h-5 text-slate-200" />
        </button>

        <button
          onClick={toggleSound}
          className="h-10 w-10 sm:h-11 sm:w-11 bg-slate-900/85 hover:bg-slate-850 active:scale-95 text-slate-100 rounded-xl border border-slate-700/80 flex items-center justify-center shadow-lg transition-transform"
          aria-label={game.settings.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          title={game.settings.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
        >
          {game.settings.soundEnabled ? (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-rose-400" />
          )}
        </button>
      </div>

      {/* Top Center Scoreboard */}
      <div className="flex flex-col items-center pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-3 sm:gap-5">
          {/* Player 1 Score */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-blue-400 uppercase tracking-wider">
              P1
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-white tabular-nums px-1.5 py-0.5 bg-blue-950/80 rounded-lg border border-blue-800/60">
              {game.p1Score}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
              Round {game.currentRound}
            </span>
            <span className="text-[10px] text-amber-300 font-medium">
              First to {game.settings.targetWins}
            </span>
          </div>

          {/* Player 2 / AI Score */}
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-extrabold text-white tabular-nums px-1.5 py-0.5 bg-rose-950/80 rounded-lg border border-rose-800/60">
              {game.p2Score}
            </span>
            <span className="text-xs sm:text-sm font-bold text-rose-400 uppercase tracking-wider">
              {isAIMode ? 'AI' : 'P2'}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          </div>
        </div>

        {/* Turn Status & Wind Pill */}
        <div className="mt-1 flex items-center gap-2">
          {/* Turn Indicator */}
          <div
            className={`px-3 py-0.5 rounded-full text-xs font-bold border shadow-md transition-all ${
              isP1Turn
                ? 'bg-blue-600/90 text-white border-blue-400'
                : 'bg-rose-600/90 text-white border-rose-400'
            }`}
          >
            {game.state === 'COUNTDOWN'
              ? 'Get Ready...'
              : isP1Turn
              ? "Player 1's Turn"
              : isAIMode
              ? 'AI Aiming...'
              : "Player 2's Turn"}
          </div>

          {/* Wind Indicator */}
          {game.settings.windEnabled && (
            <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-700 text-xs font-semibold flex items-center gap-1 text-sky-300 shadow">
              <Wind className="w-3.5 h-3.5" />
              <span>
                {Math.abs(game.wind)} mph {game.wind > 0 ? '→' : game.wind < 0 ? '←' : '•'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Right Spacer / Info */}
      <div className="w-10 sm:w-28 flex justify-end" />
    </header>
  );
};
