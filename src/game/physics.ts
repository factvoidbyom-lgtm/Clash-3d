/**
 * Physics and Collision System for 2D Cartoon Slingshot Clash
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface TerrainPoint {
  x: number;
  y: number;
}

export interface Crater {
  x: number;
  y: number;
  radius: number;
}

export class TerrainMap {
  public width: number;
  public height: number;
  public baseHeights: number[] = [];
  public craters: Crater[] = [];
  private step: number = 8; // resolution of heightfield

  constructor(width: number = 1800, height: number = 1000) {
    this.width = width;
    this.height = height;
    this.generate();
  }

  public generate() {
    this.craters = [];
    const count = Math.ceil(this.width / this.step) + 1;
    this.baseHeights = new Array(count);

    // Baseline terrain: rolling hills with elevated natural mounds on left (P1) and right (P2)
    // and a playful dip / valley in the middle.
    const groundLevel = this.height * 0.72;

    for (let i = 0; i < count; i++) {
      const x = i * this.step;
      const normalizedX = x / this.width;

      // Hills formula using multi-octave sine curves
      const wave1 = Math.sin(normalizedX * Math.PI * 2) * 55;
      const wave2 = Math.sin(normalizedX * Math.PI * 4.5 + 0.5) * 30;
      const wave3 = Math.cos(normalizedX * Math.PI * 6.2) * 15;

      // Platform bumps for players around x = 0.15 and x = 0.85
      const p1Mound = Math.exp(-Math.pow((normalizedX - 0.16) / 0.12, 2)) * 60;
      const p2Mound = Math.exp(-Math.pow((normalizedX - 0.84) / 0.12, 2)) * 60;
      const centerDip = Math.exp(-Math.pow((normalizedX - 0.5) / 0.2, 2)) * -40;

      const y = groundLevel - (wave1 + wave2 + wave3 + p1Mound + p2Mound + centerDip);
      this.baseHeights[i] = y;
    }
  }

  /**
   * Get surface height Y for a given world X
   */
  public getHeight(x: number): number {
    if (x < 0) x = 0;
    if (x > this.width) x = this.width;

    const index = Math.floor(x / this.step);
    const remainder = (x % this.step) / this.step;

    const y0 = this.baseHeights[index] ?? (this.height * 0.75);
    const y1 = this.baseHeights[Math.min(index + 1, this.baseHeights.length - 1)] ?? y0;
    let surfaceY = y0 + (y1 - y0) * remainder;

    // Apply crater deformation
    for (const crater of this.craters) {
      const dx = Math.abs(x - crater.x);
      if (dx < crater.radius) {
        // Spherical indentation
        const depth = Math.sqrt(crater.radius * crater.radius - dx * dx);
        const craterBottomY = crater.y + depth * 0.75;
        if (craterBottomY > surfaceY) {
          surfaceY = Math.max(surfaceY, craterBottomY);
        }
      }
    }

    return surfaceY;
  }

  /**
   * Carve out a crater when an explosive hits the ground
   */
  public addCrater(x: number, y: number, radius: number) {
    this.craters.push({ x, y, radius });
    if (this.craters.length > 25) {
      this.craters.shift(); // retain performance
    }
  }
}

export interface TrajectoryPoint {
  x: number;
  y: number;
}

export interface TrajectoryResult {
  points: TrajectoryPoint[];
  hitPoint: TrajectoryPoint | null;
  hitTarget: 'terrain' | 'player1' | 'player2' | 'none';
}

export const GRAVITY = 720; // px/s^2

/**
 * Predicts the projectile path using physics step simulation
 */
export function calculateTrajectory(
  startX: number,
  startY: number,
  velocityX: number,
  velocityY: number,
  windSpeed: number,
  terrain: TerrainMap,
  target1: { x: number; y: number; radius: number },
  target2: { x: number; y: number; radius: number },
  shooterId: 1 | 2,
  maxSteps: number = 45,
  stepDt: number = 0.04
): TrajectoryResult {
  const points: TrajectoryPoint[] = [{ x: startX, y: startY }];
  let currentX = startX;
  let currentY = startY;
  let vx = velocityX;
  let vy = velocityY;

  let hitPoint: TrajectoryPoint | null = null;
  let hitTarget: 'terrain' | 'player1' | 'player2' | 'none' = 'none';

  for (let i = 0; i < maxSteps; i++) {
    // Apply gravity and wind
    vy += GRAVITY * stepDt;
    vx += windSpeed * stepDt * 0.65; // wind resistance factor

    currentX += vx * stepDt;
    currentY += vy * stepDt;

    // Check player collision (don't hit shooter at point blank on step 0-2)
    if (i > 3) {
      if (shooterId === 2) {
        const dx = currentX - target1.x;
        const dy = currentY - target1.y;
        if (dx * dx + dy * dy < target1.radius * target1.radius) {
          hitPoint = { x: currentX, y: currentY };
          hitTarget = 'player1';
          points.push({ ...hitPoint });
          break;
        }
      } else {
        const dx = currentX - target2.x;
        const dy = currentY - target2.y;
        if (dx * dx + dy * dy < target2.radius * target2.radius) {
          hitPoint = { x: currentX, y: currentY };
          hitTarget = 'player2';
          points.push({ ...hitPoint });
          break;
        }
      }
    }

    // Check terrain collision
    const groundY = terrain.getHeight(currentX);
    if (currentY >= groundY) {
      hitPoint = { x: currentX, y: groundY };
      hitTarget = 'terrain';
      points.push({ ...hitPoint });
      break;
    }

    // Check boundary
    if (currentX < -100 || currentX > terrain.width + 100 || currentY > terrain.height + 150) {
      hitTarget = 'none';
      break;
    }

    points.push({ x: currentX, y: currentY });
  }

  return { points, hitPoint, hitTarget };
}
