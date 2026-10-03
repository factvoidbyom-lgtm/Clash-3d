import React from 'react';
import { GameManager } from '../game/gameManager';
import { PROJECTILE_TYPES, ProjectileType } from '../game/characters';

interface PlayerHUDProps {
  game: GameManager;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ game }) => {
  const p1 = game.p1;
  const p2 = game.p2;

  const isP1Turn = game.activeTurn === 1;
  const activeChar = isP1Turn ? p1 : p2;
  const isHumanTurn = !(game.mode === 'AI' && game.activeTurn === 2);

  const p1HpPercent = Math.max(0, Math.min(100, (p1.hp / p1.maxHp) * 100));
  const p2HpPercent = Math.max(0, Math.min(100, (p2.hp / p2.maxHp) * 100));

  const weaponList: ProjectileType[] = ['BOMB', 'ROCKET', 'BOUNCY', 'CLUSTER'];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-4 flex flex-col gap-2">
      {/* Aiming Power & Angle Gauge (Shown when dragging) */}
      {game.aim.isAiming && (
        <div className="self-center bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-4 text-xs font-bold text-white pointer-events-auto animate-cartoon-pop">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Angle:</span>
            <span className="text-amber-400 tabular-nums">
              {Math.round((((game.aim.angle * 180) / Math.PI + 360) % 360))}°
            </span>
          </div>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Power:</span>
            <div className="w-24 h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full transition-all duration-75"
                style={{ width: `${Math.round(game.aim.power * 100)}%` }}
              />
            </div>
            <span className="text-emerald-400 tabular-nums w-8 text-right">
              {Math.round(game.aim.power * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Weapon Selector Drawer (for the active human player) */}
      {isHumanTurn && game.state === 'AIMING' && (
        <div className="self-center pointer-events-auto bg-slate-900/85 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold text-slate-400 pl-2 hidden sm:inline">
            Weapon:
          </span>
          {weaponList.map((type) => {
            const cfg = PROJECTILE_TYPES[type];
            const isSelected = activeChar.projectileType === type;
            return (
              <button
                key={type}
                onClick={() => game.setProjectileType(game.activeTurn, type)}
                className={`relative px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                <span className="text-base leading-none">{cfg.icon}</span>
                <span className="hidden xs:inline">{cfg.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Health Bar Dock */}
      <div className="flex items-center justify-between gap-2 sm:gap-6 w-full max-w-4xl mx-auto pointer-events-auto">
        {/* Player 1 Health Card */}
        <div
          className={`flex-1 bg-slate-900/90 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border shadow-xl transition-all ${
            isP1Turn ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow">
                🛡️
              </div>
              <span className="text-xs sm:text-sm font-bold text-blue-300 truncate">
                {p1.name}
              </span>
            </div>
            <span className="text-xs font-extrabold text-blue-400 tabular-nums">
              {p1.hp} / {p1.maxHp} HP
            </span>
          </div>

          {/* Health Gauge */}
          <div className="w-full h-3.5 sm:h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                p1HpPercent > 50
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-400'
                  : p1HpPercent > 25
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
              }`}
              style={{ width: `${p1HpPercent}%` }}
            />
          </div>
        </div>

        {/* Player 2 / AI Health Card */}
        <div
          className={`flex-1 bg-slate-900/90 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border shadow-xl transition-all ${
            !isP1Turn ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-extrabold text-rose-400 tabular-nums order-2 sm:order-1">
              {p2.hp} / {p2.maxHp} HP
            </span>
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <span className="text-xs sm:text-sm font-bold text-rose-300 truncate">
                {p2.name}
              </span>
              <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center text-xs font-bold text-white shadow">
                🎯
              </div>
            </div>
          </div>

          {/* Health Gauge (Right-aligned) */}
          <div className="w-full h-3.5 sm:h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-700/60 flex justify-end">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                p2HpPercent > 50
                  ? 'bg-gradient-to-l from-rose-500 to-pink-400'
                  : p2HpPercent > 25
                  ? 'bg-gradient-to-l from-amber-500 to-orange-400'
                  : 'bg-gradient-to-l from-rose-600 to-red-500 animate-pulse'
              }`}
              style={{ width: `${p2HpPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
