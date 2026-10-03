import React, { useState } from 'react';
import { GameManager } from '../game/gameManager';
import { sounds } from '../game/audio';
import { Play, Users, Settings, LogOut, HelpCircle, ChevronRight, X } from 'lucide-react';

interface MainMenuProps {
  game: GameManager;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ game, onOpenSettings }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const startAIMode = () => {
    sounds.playButton();
    game.startMatch('AI');
  };

  const startPVPMode = () => {
    sounds.playButton();
    game.startMatch('PVP');
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-8 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 select-none overflow-y-auto">
      {/* Cartoon Background Elements (Sun & Clouds) */}
      <div className="absolute top-6 left-8 w-20 h-20 bg-amber-300 rounded-full blur-[1px] shadow-[0_0_40px_rgba(251,191,36,0.8)] opacity-90 animate-pulse pointer-events-none" />
      <div className="absolute top-12 right-12 text-6xl opacity-75 pointer-events-none">☁️</div>
      <div className="absolute top-28 left-16 text-5xl opacity-60 pointer-events-none">☁️</div>

      {/* Top Bar Branding */}
      <header className="w-full max-w-lg flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏹</span>
          <span className="text-sm font-extrabold tracking-wider text-slate-900 bg-white/70 px-3 py-1 rounded-full backdrop-blur-sm border border-white/80 shadow-sm">
            Cartoon Physics Duel
          </span>
        </div>

        <button
          onClick={() => {
            sounds.playButton();
            setShowHowToPlay(true);
          }}
          className="h-9 px-3 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs font-bold border border-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>Rules</span>
        </button>
      </header>

      {/* Center Hero Title */}
      <div className="flex flex-col items-center text-center my-auto py-6 z-10">
        {/* Cartoon Characters Faceoff Avatar Badges */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blue-600 border-4 border-white shadow-xl flex flex-col items-center justify-center text-3xl animate-bounce">
            🛡️
            <span className="text-[10px] font-black text-blue-100 uppercase tracking-wider">
              Pip
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-amber-950 bg-amber-400 px-3 py-1 rounded-2xl border-2 border-white shadow-lg">
            VS
          </div>

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-rose-600 border-4 border-white shadow-xl flex flex-col items-center justify-center text-3xl animate-bounce [animation-delay:0.15s]">
            🎯
            <span className="text-[10px] font-black text-rose-100 uppercase tracking-wider">
              Rusty
            </span>
          </div>
        </div>

        {/* Title Logo */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_8px_rgba(15,23,42,0.45)] uppercase">
          Sling Clash
        </h1>
        <p className="text-sm sm:text-base font-bold text-amber-950/90 mt-1 max-w-xs drop-shadow-sm">
          2D Mobile Cartoon Battle Arena
        </p>
      </div>

      {/* Main Menu Action Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3 z-10 pb-4">
        {/* Play vs AI Button */}
        <button
          onClick={startAIMode}
          className="w-full py-4 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-base sm:text-lg flex items-center justify-between shadow-xl shadow-amber-600/30 border-2 border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 flex items-center justify-center text-slate-950">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div className="text-left">
              <div>Play vs AI</div>
              <div className="text-xs font-semibold text-amber-950/80">
                Difficulty: {game.settings.aiDifficulty}
              </div>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Local 2-Player Button */}
        <button
          onClick={startPVPMode}
          className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-base sm:text-lg flex items-center justify-between shadow-xl shadow-blue-700/30 border-2 border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700/60 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div>Local 2-Player</div>
              <div className="text-xs font-semibold text-blue-200">Pass & Play on 1 Device</div>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Secondary Row: Settings & Quit */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              sounds.playButton();
              onOpenSettings();
            }}
            className="py-3 px-3 rounded-xl bg-white/90 hover:bg-white active:scale-95 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 shadow-md transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              sounds.playButton();
              setShowQuitConfirm(true);
            }}
            className="py-3 px-3 rounded-xl bg-white/90 hover:bg-white active:scale-95 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 border border-slate-200 shadow-md transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Quit</span>
          </button>
        </div>

        {/* Creator Attribution */}
        <div className="text-center pt-1">
          <span className="text-[11px] font-black tracking-widest text-slate-900 bg-white/60 px-3 py-0.5 rounded-full border border-white/60 shadow-xs uppercase">
            MADE BY OM BRAHMAN
          </span>
        </div>
      </div>

      {/* Rules / How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl animate-cartoon-pop max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>📖</span>
                <span>How to Play</span>
              </h3>
              <button
                onClick={() => {
                  sounds.playButton();
                  setShowHowToPlay(false);
                }}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-bold text-amber-400 mb-0.5">Drag & Release Aiming</h4>
                  <p>
                    Touch or click near your hero, pull back in the opposite direction to set power & angle, then release to launch!
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-start gap-3">
                <span className="text-2xl">💨</span>
                <div>
                  <h4 className="font-bold text-sky-400 mb-0.5">Wind Influence</h4>
                  <p>
                    Watch the wind indicator in the top scoreboard. Strong winds push projectiles mid-air!
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-start gap-3">
                <span className="text-2xl">💣</span>
                <div>
                  <h4 className="font-bold text-rose-400 mb-0.5">Cartoon Weapon Arsenal</h4>
                  <p>
                    Choose between Classic Cannonball, Acorn Rocket (fast), Bouncy Melon (bounces once), or Super Carrot (cluster explosion).
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-start gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-bold text-emerald-400 mb-0.5">Round Based Scoring</h4>
                  <p>
                    First player to reach the target round wins takes the match trophy!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playButton();
                setShowHowToPlay(false);
              }}
              className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Got it! Let's Clash
            </button>
          </div>
        </div>
      )}

      {/* Quit Game Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl animate-cartoon-pop text-center">
            <span className="text-4xl mb-2 block">👋</span>
            <h3 className="text-xl font-bold mb-2">Leave Game?</h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-5">
              Ready to take a break from the battlefield?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  sounds.playButton();
                  setShowQuitConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs"
              >
                Stay & Play
              </button>
              <button
                onClick={() => {
                  sounds.playButton();
                  setShowQuitConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs"
              >
                Exit Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
