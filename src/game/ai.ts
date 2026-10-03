/**
 * AI Decision Engine for Cartoon Slingshot Clash
 */

import { GRAVITY, TerrainMap } from './physics';

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface AIMove {
  angle: number; // in radians
  power: number; // 0 to 1
  pullDx: number;
  pullDy: number;
}

/**
 * Solves launch trajectory to hit target from start position
 */
export function calculateAIMove(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  windSpeed: number,
  difficulty: AIDifficulty,
  terrain: TerrainMap
): AIMove {
  // Delta coordinates
  const dx = targetX - startX; // negative if AI is on right shooting left
  const dy = targetY - startY;
  const distance = Math.abs(dx);

  // Default desired loft angle for high cartoon arc
  // AI is player 2 on right shooting left, so launch angle will be facing left
  const baseLaunchAngleDeg = dx < 0 ? 142 : 38; // high parabolic arc ~ 40-50 deg from horizontal
  let angleRad = (baseLaunchAngleDeg * Math.PI) / 180;

  // Ballistics approximation:
  // x(t) = v * cos(θ) * t + 0.5 * a_wind * t^2
  // y(t) = v * sin(θ) * t + 0.5 * g * t^2
  // For standard projectile range: R ≈ (v^2 / g) * sin(2θ)
  const g = GRAVITY;
  const effectiveWind = windSpeed * 0.65;

  // Estimate flight time t ~ sqrt(2 * max_height / g) or based on distance
  const estimatedTime = Math.sqrt((2 * distance) / g) * 1.05;
  const neededVx = (dx - 0.5 * effectiveWind * estimatedTime * estimatedTime) / estimatedTime;
  const neededVy = (dy - 0.5 * g * estimatedTime * estimatedTime) / estimatedTime;

  let calculatedVelocity = Math.sqrt(neededVx * neededVx + neededVy * neededVy);
  angleRad = Math.atan2(neededVy, neededVx);

  // Normalize power (max velocity in game is ~900 px/s)
  const maxVelocity = 920;
  let power = Math.min(1.0, Math.max(0.25, calculatedVelocity / maxVelocity));

  // Apply difficulty variance
  let angleSpread = 0;
  let powerSpread = 0;

  if (difficulty === 'EASY') {
    // Large variance, sometimes forgets wind
    angleSpread = (Math.random() - 0.5) * 0.28; // ~16 degrees variance
    powerSpread = (Math.random() - 0.5) * 0.35;
    if (Math.random() > 0.4) {
      power *= 0.85; // frequently under-powers
    }
  } else if (difficulty === 'MEDIUM') {
    // Moderate variance
    angleSpread = (Math.random() - 0.5) * 0.1; // ~5 degrees variance
    powerSpread = (Math.random() - 0.5) * 0.12;
  } else {
    // HARD: very precise, slight micro-variation for realism
    angleSpread = (Math.random() - 0.5) * 0.035; // ~2 degrees
    powerSpread = (Math.random() - 0.5) * 0.04;
  }

  angleRad += angleSpread;
  power = Math.max(0.3, Math.min(1.0, power + powerSpread));

  // The slingshot drag pull is in the OPPOSITE direction of launch
  // Pull distance corresponds to power (max drag ~ 85px)
  const maxPullDist = 85;
  const pullDist = power * maxPullDist;
  const pullAngle = angleRad + Math.PI; // opposite direction
  const pullDx = Math.cos(pullAngle) * pullDist;
  const pullDy = Math.sin(pullAngle) * pullDist;

  return {
    angle: angleRad,
    power,
    pullDx,
    pullDy,
  };
}
