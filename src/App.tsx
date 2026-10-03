/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useReducer } from 'react';
import { GameManager } from './game/gameManager';
import { GameCanvas } from './components/GameCanvas';
import { TopBar } from './components/TopBar';
import { PlayerHUD } from './components/PlayerHUD';
import { VictoryModal } from './components/VictoryModal';
import { SettingsModal } from './components/SettingsModal';
import { MainMenu } from './components/MainMenu';
import { sounds } from './game/audio';

export default function App() {
  const gameRef = useRef<GameManager | null>(null);
  if (!gameRef.current) {
    gameRef.current = new GameManager();
  }
  const game = gameRef.current;

  // Force re-render on game state changes
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useEffect(() => {
    game.onStateChange = () => {
      forceUpdate();
    };

    return () => {
      game.onStateChange = undefined;
    };
  }, [game]);

  const handleBack = () => {
    if (game.state === 'MATCH_OVER' || game.state === 'ROUND_OVER') {
      game.quitToMenu();
    } else {
      setShowBackConfirm(true);
    }
  };

  const confirmQuitToMenu = () => {
    sounds.playButton();
    setShowBackConfirm(false);
    game.quitToMenu();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Main Title Menu */}
      {game.state === 'TITLE' && (
        <MainMenu
          game={game}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 2. Active Game Arena */}
      {game.state !== 'TITLE' && (
        <>
          {/* Top Bar with Scoreboard & Nav Controls */}
          <TopBar
            game={game}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onBack={handleBack}
          />

          {/* Interactive Physics Game Canvas */}
          <div className="w-full h-full">
            <GameCanvas game={game} />
          </div>

          {/* Bottom Player HUD & Weapon Selection */}
          <PlayerHUD game={game} />

          {/* Victory & Round End Overlays */}
          <VictoryModal game={game} />

          {/* Confirm Back to Menu Dialog */}
          {showBackConfirm && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl text-center animate-cartoon-pop">
                <span className="text-4xl mb-2 block">⏸️</span>
                <h3 className="text-xl font-bold mb-2">Leave Match?</h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-5">
                  Current match progress and scores will be reset.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      sounds.playButton();
                      setShowBackConfirm(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Resume
                  </button>
                  <button
                    onClick={confirmQuitToMenu}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/30"
                  >
                    Quit Match
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 3. Global Settings Modal */}
      <SettingsModal
        game={game}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
