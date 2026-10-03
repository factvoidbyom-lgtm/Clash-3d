import React from 'react';
import { GameManager } from '../game/gameManager';
import { sounds } from '../game/audio';
import { AIDifficulty } from '../game/ai';
import { Volume2, VolumeX, X, RotateCcw, Home, Sparkles, Wind } from 'lucide-react';

interface SettingsModalProps {
  game: GameManager;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ game, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDifficulty = (diff: AIDifficulty) => {
    game.settings.aiDifficulty = diff;
    sounds.playButton();
    if (game.onStateChange) game.onStateChange();
  };

  const handleTargetWins = (wins: number) => {
    game.settings.targetWins = wins;
    sounds.playButton();
    if (game.onStateChange) game.onStateChange();
  };

  const handleToggleWind = () => {
    game.settings.windEnabled = !game.settings.windEnabled;
    game.updateWind();
    sounds.playButton();
    if (game.onStateChange) game.onStateChange();
  };

  const handleTrajectoryLength = (len: 'FULL' | 'MEDIUM' | 'SHORT') => {
    game.settings.trajectoryLineLength = len;
    sounds.playButton();
    if (game.onStateChange) game.onStateChange();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    game.settings.volume = val;
    sounds.setVolume(val);
    if (game.onStateChange) game.onStateChange();
  };

  const handleToggleSound = () => {
    const next = !game.settings.soundEnabled;
    game.settings.soundEnabled = next;
    sounds.setSoundEnabled(next);
    if (next) sounds.playButton();
    if (game.onStateChange) game.onStateChange();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span>⚙️</span>
            <span>Settings</span>
          </h2>
          <button
            onClick={() => {
              sounds.playButton();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 flex items-center justify-center text-slate-300 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 text-sm">
          {/* Sound & Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                {game.settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                )}
                <span>Sound Effects</span>
              </span>
              <button
                onClick={handleToggleSound}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  game.settings.soundEnabled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {game.settings.soundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>
            {game.settings.soundEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={game.settings.volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            )}
          </div>

          {/* AI Difficulty */}
          <div>
            <span className="block font-semibold text-slate-300 mb-2">
              AI Difficulty
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as AIDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleDifficulty(diff)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                    game.settings.aiDifficulty === diff
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Target Wins */}
          <div>
            <span className="block font-semibold text-slate-300 mb-2">
              First to Wins (Target Score)
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 5].map((wins) => (
                <button
                  key={wins}
                  onClick={() => handleTargetWins(wins)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                    game.settings.targetWins === wins
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {wins} Wins
                </button>
              ))}
            </div>
          </div>

          {/* Wind Force */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-sky-400" />
              <span>Wind Mechanic</span>
            </span>
            <button
              onClick={handleToggleWind}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                game.settings.windEnabled
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {game.settings.windEnabled ? 'Active' : 'Off'}
            </button>
          </div>

          {/* Trajectory Guide Length */}
          <div>
            <span className="block font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Aiming Trajectory Guide</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['FULL', 'MEDIUM', 'SHORT'] as const).map((len) => (
                <button
                  key={len}
                  onClick={() => handleTrajectoryLength(len)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
                    game.settings.trajectoryLineLength === len
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Creator Attribution */}
        <div className="py-2.5 px-3 mb-2 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5 font-semibold">
            Game Developer
          </span>
          <span className="text-xs sm:text-sm font-black tracking-widest text-amber-400 uppercase drop-shadow-sm">
            MADE BY OM BRAHMAN
          </span>
        </div>

        {/* Action Buttons if in match */}
        {game.state !== 'TITLE' && (
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                sounds.playButton();
                onClose();
                game.restartMatch();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Restart Match</span>
            </button>

            <button
              onClick={() => {
                sounds.playButton();
                onClose();
                game.quitToMenu();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 active:scale-95 text-rose-200 font-bold text-xs flex items-center justify-center gap-2 border border-rose-800/60 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4 text-rose-400" />
              <span>Quit to Main Menu</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
