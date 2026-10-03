/**
 * Core Game Engine and State Manager for Cartoon Slingshot Clash
 */

import { sounds } from './audio';
import { calculateAIMove, AIDifficulty } from './ai';
import {
  ActiveProjectile,
  CharacterState,
  drawCharacter,
  drawProjectile,
  PROJECTILE_TYPES,
  ProjectileType,
} from './characters';
import { GameCamera } from './camera';
import { EnvironmentRenderer } from './environment';
import { ParticleSystem } from './particles';
import {
  calculateTrajectory,
  GRAVITY,
  TerrainMap,
  TrajectoryResult,
} from './physics';

export type GameMode = 'AI' | 'PVP';

export type MatchState =
  | 'TITLE'
  | 'COUNTDOWN'
  | 'AIMING'
  | 'FLYING'
  | 'RESOLVING'
  | 'ROUND_OVER'
  | 'MATCH_OVER';

export interface GameSettings {
  aiDifficulty: AIDifficulty;
  targetWins: number; // e.g. First to 3
  windEnabled: boolean;
  trajectoryLineLength: 'FULL' | 'MEDIUM' | 'SHORT';
  soundEnabled: boolean;
  volume: number;
}

export interface AimState {
  isAiming: boolean;
  activePlayerId: 1 | 2;
  dragStartX: number;
  dragStartY: number;
  currentX: number;
  currentY: number;
  power: number; // 0 to 1
  angle: number; // launch angle in radians
  pullDx: number;
  pullDy: number;
}

export class GameManager {
  public mode: GameMode = 'AI';
  public state: MatchState = 'TITLE';
  public settings: GameSettings = {
    aiDifficulty: 'MEDIUM',
    targetWins: 3,
    windEnabled: true,
    trajectoryLineLength: 'FULL',
    soundEnabled: true,
    volume: 0.75,
  };

  // World and Camera
  public worldWidth: number = 1800;
  public worldHeight: number = 1000;
  public terrain: TerrainMap;
  public camera: GameCamera;
  public environment: EnvironmentRenderer;
  public particles: ParticleSystem;

  // Characters
  public p1: CharacterState;
  public p2: CharacterState;
  public activeTurn: 1 | 2 = 1;

  // Scores and Match Progression
  public p1Score: number = 0;
  public p2Score: number = 0;
  public currentRound: number = 1;
  public roundWinner: 1 | 2 | null = null;
  public matchWinner: 1 | 2 | null = null;

  // Round transition timers
  public roundCountdown: number = 3;
  private countdownTimer: number = 0;
  private nextRoundTimer: number = 0;

  // Wind
  public wind: number = 0; // px/s^2 horizontal force

  // Active Projectile
  public projectile: ActiveProjectile | null = null;

  // Aiming Interaction
  public aim: AimState = {
    isAiming: false,
    activePlayerId: 1,
    dragStartX: 0,
    dragStartY: 0,
    currentX: 0,
    currentY: 0,
    power: 0,
    angle: 0,
    pullDx: 0,
    pullDy: 0,
  };

  // AI Aiming simulation state
  private aiAimProgress: number = 0;
  private aiIsThinking: boolean = false;
  private aiPlannedMove: { pullDx: number; pullDy: number; power: number; angle: number } | null = null;

  // Trajectory preview
  public previewTrajectory: TrajectoryResult | null = null;

  // Callbacks for React UI updates
  public onStateChange?: () => void;

  constructor() {
    this.terrain = new TerrainMap(this.worldWidth, this.worldHeight);
    this.camera = new GameCamera(this.worldWidth, this.worldHeight);
    this.environment = new EnvironmentRenderer(this.worldWidth);
    this.particles = new ParticleSystem();

    const p1X = this.worldWidth * 0.16;
    const p1Y = this.terrain.getHeight(p1X);

    const p2X = this.worldWidth * 0.84;
    const p2Y = this.terrain.getHeight(p2X);

    this.p1 = {
      id: 1,
      name: 'Player 1',
      x: p1X,
      y: p1Y,
      radius: 20,
      hp: 100,
      maxHp: 100,
      facing: 1,
      actionState: 'idle',
      animTimer: 0,
      hurtTimer: 0,
      projectileType: 'BOMB',
    };

    this.p2 = {
      id: 2,
      name: 'Player 2',
      x: p2X,
      y: p2Y,
      radius: 20,
      hp: 100,
      maxHp: 100,
      facing: -1,
      actionState: 'idle',
      animTimer: 0,
      hurtTimer: 0,
      projectileType: 'BOMB',
    };
  }

  public startMatch(mode: GameMode) {
    this.mode = mode;
    this.p1Score = 0;
    this.p2Score = 0;
    this.currentRound = 1;
    this.matchWinner = null;
    this.roundWinner = null;
    this.p2.name = mode === 'AI' ? 'AI Bot' : 'Player 2';

    this.initRound();
  }

  public initRound() {
    this.terrain.generate();
    this.particles.particles = [];
    this.particles.floatingTexts = [];
    this.projectile = null;
    this.aim.isAiming = false;
    this.previewTrajectory = null;

    // Reposition characters on fresh terrain
    this.p1.x = this.worldWidth * 0.16;
    this.p1.y = this.terrain.getHeight(this.p1.x);
    this.p1.hp = this.p1.maxHp;
    this.p1.actionState = 'idle';
    this.p1.hurtTimer = 0;

    this.p2.x = this.worldWidth * 0.84;
    this.p2.y = this.terrain.getHeight(this.p2.x);
    this.p2.hp = this.p2.maxHp;
    this.p2.actionState = 'idle';
    this.p2.hurtTimer = 0;

    // Pick random wind if enabled
    this.updateWind();

    // Start with Countdown
    this.state = 'COUNTDOWN';
    this.roundCountdown = 3;
    this.countdownTimer = 1.0;
    sounds.playCountdown(false);

    // Frame camera on the battlefield
    this.camera.frameBoth(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    this.notifyUI();
  }

  public updateWind() {
    if (this.settings.windEnabled) {
      // Wind speed between -45 and +45
      this.wind = Math.round((Math.random() * 90 - 45));
      if (Math.abs(this.wind) < 5) this.wind = 10;
    } else {
      this.wind = 0;
    }
  }

  public setProjectileType(player: 1 | 2, type: ProjectileType) {
    if (player === 1) {
      this.p1.projectileType = type;
    } else {
      this.p2.projectileType = type;
    }
    sounds.playButton();
    this.notifyUI();
  }

  /**
   * Main game update loop
   */
  public update(dt: number) {
    this.environment.update(dt, this.worldWidth);
    this.particles.update(dt);
    this.camera.update(dt);

    // Update characters animation
    this.p1.animTimer += dt;
    this.p2.animTimer += dt;
    if (this.p1.hurtTimer > 0) this.p1.hurtTimer -= dt;
    if (this.p2.hurtTimer > 0) this.p2.hurtTimer -= dt;

    // Stick characters to terrain in case of crater under them
    this.p1.y = this.terrain.getHeight(this.p1.x);
    this.p2.y = this.terrain.getHeight(this.p2.x);

    // State machine
    switch (this.state) {
      case 'COUNTDOWN':
        this.updateCountdown(dt);
        break;

      case 'AIMING':
        this.updateAiming(dt);
        break;

      case 'FLYING':
        this.updateFlyingProjectile(dt);
        break;

      case 'RESOLVING':
        // Brief pause after impact to show damage numbers and animations
        break;

      case 'ROUND_OVER':
        this.updateRoundOver(dt);
        break;

      case 'MATCH_OVER':
        // Idle celebrate with victory confetti
        break;
    }
  }

  private updateCountdown(dt: number) {
    this.countdownTimer -= dt;
    if (this.countdownTimer <= 0) {
      this.roundCountdown -= 1;
      this.countdownTimer = 1.0;

      if (this.roundCountdown > 0) {
        sounds.playCountdown(false);
      } else {
        sounds.playCountdown(true);
        // Start turn with Player 1 (or alternating)
        this.state = 'AIMING';
        this.activeTurn = 1;
        this.p1.actionState = 'idle';
        this.p2.actionState = 'idle';
        this.focusOnActivePlayer();
      }
      this.notifyUI();
    }
  }

  private updateAiming(dt: number) {
    // If AI's turn
    if (this.mode === 'AI' && this.activeTurn === 2) {
      this.handleAITurn(dt);
    }
  }

  private handleAITurn(dt: number) {
    if (!this.aiIsThinking && !this.aiPlannedMove) {
      this.aiIsThinking = true;
      this.aiAimProgress = 0;

      // Calculate AI trajectory solution
      const move = calculateAIMove(
        this.p2.x,
        this.p2.y - 12,
        this.p1.x,
        this.p1.y - 12,
        this.wind,
        this.settings.aiDifficulty,
        this.terrain
      );
      this.aiPlannedMove = move;
    }

    if (this.aiPlannedMove) {
      // Simulate aiming pullback over 1.1s
      this.aiAimProgress += dt / 1.1;

      const progress = Math.min(1.0, this.aiAimProgress);
      this.p2.actionState = 'aiming';

      this.aim.isAiming = true;
      this.aim.activePlayerId = 2;
      this.aim.pullDx = this.aiPlannedMove.pullDx * progress;
      this.aim.pullDy = this.aiPlannedMove.pullDy * progress;
      this.aim.power = this.aiPlannedMove.power * progress;
      this.aim.angle = this.aiPlannedMove.angle;

      // Update visible trajectory for AI
      this.updateTrajectoryPreview(2, this.aim.angle, this.aim.power);

      if (this.aiAimProgress >= 1.0) {
        // Fire!
        this.aiIsThinking = false;
        const finalMove = this.aiPlannedMove;
        this.aiPlannedMove = null;
        this.fireProjectile(2, finalMove.angle, finalMove.power);
      }
    }
  }

  private focusOnActivePlayer() {
    const activeChar = this.activeTurn === 1 ? this.p1 : this.p2;
    this.camera.focusOn(activeChar.x, activeChar.y - 60);
  }

  /**
   * Called by user drag handlers
   */
  public onAimStart(screenX: number, screenY: number): boolean {
    if (this.state !== 'AIMING') return false;
    if (this.mode === 'AI' && this.activeTurn === 2) return false; // AI controls P2

    const activeChar = this.activeTurn === 1 ? this.p1 : this.p2;
    const worldPos = this.camera.screenToWorld(screenX, screenY);

    // Check if touch is near active character or anywhere on their side of the screen
    const dx = worldPos.x - activeChar.x;
    const dy = worldPos.y - activeChar.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Generous touch target area (within 130px radius of character)
    if (dist < 140) {
      this.aim.isAiming = true;
      this.aim.activePlayerId = this.activeTurn;
      this.aim.dragStartX = worldPos.x;
      this.aim.dragStartY = worldPos.y;
      this.aim.currentX = worldPos.x;
      this.aim.currentY = worldPos.y;
      this.aim.power = 0;
      this.aim.pullDx = 0;
      this.aim.pullDy = 0;

      activeChar.actionState = 'aiming';
      sounds.playStretch(0.2);
      this.notifyUI();
      return true;
    }

    return false;
  }

  public onAimMove(screenX: number, screenY: number) {
    if (!this.aim.isAiming) return;

    const activeChar = this.activeTurn === 1 ? this.p1 : this.p2;
    const worldPos = this.camera.screenToWorld(screenX, screenY);

    // Calculate drag pull vector from slingshot rest position
    const slingRestX = activeChar.x;
    const slingRestY = activeChar.y - 12;

    const pullX = worldPos.x - slingRestX;
    const pullY = worldPos.y - slingRestY;
    const pullDistance = Math.sqrt(pullX * pullX + pullY * pullY);

    const maxPull = 95; // maximum drag distance
    const clampedDist = Math.min(maxPull, pullDistance);

    const pullAngle = Math.atan2(pullY, pullX);
    this.aim.pullDx = Math.cos(pullAngle) * clampedDist;
    this.aim.pullDy = Math.sin(pullAngle) * clampedDist;

    // Launch angle is opposite to pull direction
    this.aim.angle = pullAngle + Math.PI;
    this.aim.power = clampedDist / maxPull;

    // Keep trajectory preview updated
    this.updateTrajectoryPreview(this.activeTurn, this.aim.angle, this.aim.power);
    this.notifyUI();
  }

  public onAimEnd() {
    if (!this.aim.isAiming) return;
    this.aim.isAiming = false;

    // Minimum power threshold to prevent accidental taps
    if (this.aim.power > 0.12) {
      this.fireProjectile(this.activeTurn, this.aim.angle, this.aim.power);
    } else {
      // Cancelled
      const activeChar = this.activeTurn === 1 ? this.p1 : this.p2;
      activeChar.actionState = 'idle';
      this.previewTrajectory = null;
      this.notifyUI();
    }
  }

  public updateTrajectoryPreview(shooterId: 1 | 2, angle: number, power: number) {
    const shooter = shooterId === 1 ? this.p1 : this.p2;
    const cfg = PROJECTILE_TYPES[shooter.projectileType];

    const maxSpeed = 920 * cfg.speedMultiplier;
    const launchSpeed = power * maxSpeed;

    const startX = shooter.x + Math.cos(angle) * 16;
    const startY = shooter.y - 12 + Math.sin(angle) * 16;
    const vx = Math.cos(angle) * launchSpeed;
    const vy = Math.sin(angle) * launchSpeed;

    const steps =
      this.settings.trajectoryLineLength === 'FULL'
        ? 55
        : this.settings.trajectoryLineLength === 'MEDIUM'
        ? 30
        : 14;

    this.previewTrajectory = calculateTrajectory(
      startX,
      startY,
      vx,
      vy,
      this.wind,
      this.terrain,
      this.p1,
      this.p2,
      shooterId,
      steps
    );
  }

  public fireProjectile(shooterId: 1 | 2, angle: number, power: number) {
    const shooter = shooterId === 1 ? this.p1 : this.p2;
    const cfg = PROJECTILE_TYPES[shooter.projectileType];

    const maxSpeed = 920 * cfg.speedMultiplier;
    const launchSpeed = power * maxSpeed;

    const startX = shooter.x + Math.cos(angle) * 20;
    const startY = shooter.y - 12 + Math.sin(angle) * 20;
    const vx = Math.cos(angle) * launchSpeed;
    const vy = Math.sin(angle) * launchSpeed;

    this.projectile = new ActiveProjectile(startX, startY, vx, vy, shooter.projectileType, shooterId);
    shooter.actionState = 'firing';

    this.state = 'FLYING';
    this.aim.isAiming = false;
    this.previewTrajectory = null;

    sounds.playLaunch(power);
    this.notifyUI();
  }

  private updateFlyingProjectile(dt: number) {
    if (!this.projectile) return;

    const p = this.projectile;
    p.lifetime += dt;

    // Physics step
    p.vy += GRAVITY * dt;
    p.vx += this.wind * dt * 0.65; // wind influence

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Rotation based on velocity vector
    p.rotation = Math.atan2(p.vy, p.vx);

    // Spawn trail particles
    const trailColor =
      p.type === 'ROCKET'
        ? '#F97316'
        : p.type === 'BOUNCY'
        ? '#4ADE80'
        : p.type === 'CLUSTER'
        ? '#FB923C'
        : '#FDE047';
    this.particles.addTrailParticle(p.x, p.y, trailColor);

    // Smoothly focus camera on flying projectile
    this.camera.focusOn(p.x, p.y - 30);

    // Collision Check: Players
    const opponent = p.shooterId === 1 ? this.p2 : this.p1;
    const dx = p.x - opponent.x;
    const dy = p.y - (opponent.y - 10);
    const distSq = dx * dx + dy * dy;

    if (distSq < (opponent.radius + p.radius) * (opponent.radius + p.radius)) {
      // Direct Player Hit!
      this.resolveImpact(p.x, p.y, opponent, true);
      return;
    }

    // Collision Check: Terrain
    const groundY = this.terrain.getHeight(p.x);
    if (p.y >= groundY - p.radius * 0.5) {
      if (p.bouncesLeft > 0) {
        // Watermelon Bounces once!
        p.bouncesLeft -= 1;
        p.y = groundY - p.radius;
        p.vy = -Math.abs(p.vy) * 0.62;
        p.vx = p.vx * 0.75;
        sounds.playHit();
        this.particles.triggerScreenShake(6);
      } else {
        // Ground Detonation
        this.resolveImpact(p.x, groundY, null, false);
      }
      return;
    }

    // World bounds check
    if (p.x < -150 || p.x > this.worldWidth + 150 || p.y > this.worldHeight + 200) {
      // Out of bounds / Miss
      this.resolveMiss();
    }
  }

  private resolveImpact(
    impactX: number,
    impactY: number,
    directHitPlayer: CharacterState | null,
    isDirect: boolean
  ) {
    if (!this.projectile) return;

    const p = this.projectile;
    const cfg = PROJECTILE_TYPES[p.type];

    // Sound and particles
    sounds.playExplosion();
    this.particles.addImpactExplosion(impactX, impactY, isDirect);

    // Terrain crater
    this.terrain.addCrater(impactX, impactY, cfg.blastRadius);

    // Damage calculations
    let hitP1 = false;
    let hitP2 = false;

    // Direct Hit
    if (directHitPlayer) {
      sounds.playHit();
      const dmg = cfg.baseDamage + Math.floor(Math.random() * 8);
      directHitPlayer.hp = Math.max(0, directHitPlayer.hp - dmg);
      directHitPlayer.actionState = 'hurt';
      directHitPlayer.hurtTimer = 0.8;

      this.particles.addFloatingText(
        directHitPlayer.x,
        directHitPlayer.y - 35,
        `-${dmg} DIRECT HIT!`,
        '#EF4444',
        24
      );

      if (directHitPlayer.id === 1) hitP1 = true;
      else hitP2 = true;
    } else {
      // Check splash damage on both players
      [this.p1, this.p2].forEach((player) => {
        const dx = impactX - player.x;
        const dy = impactY - (player.y - 10);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < cfg.blastRadius + player.radius) {
          sounds.playHit();
          const falloff = 1 - dist / (cfg.blastRadius + player.radius);
          const splashDmg = Math.max(8, Math.round(cfg.baseDamage * 0.6 * falloff));
          player.hp = Math.max(0, player.hp - splashDmg);
          player.actionState = 'hurt';
          player.hurtTimer = 0.7;

          this.particles.addFloatingText(
            player.x,
            player.y - 30,
            `-${splashDmg} SPLASH`,
            '#F59E0B',
            20
          );

          if (player.id === 1) hitP1 = true;
          else hitP2 = true;
        }
      });
    }

    this.projectile = null;
    this.state = 'RESOLVING';
    this.notifyUI();

    // Check if someone is defeated
    setTimeout(() => {
      this.checkRoundStatus();
    }, 1200);
  }

  private resolveMiss() {
    this.projectile = null;
    this.state = 'RESOLVING';
    this.particles.addFloatingText(
      this.worldWidth / 2,
      this.worldHeight * 0.4,
      'MISSED!',
      '#94A3B8',
      24
    );
    this.notifyUI();

    setTimeout(() => {
      this.checkRoundStatus();
    }, 900);
  }

  private checkRoundStatus() {
    // Check if either player is at 0 HP
    if (this.p1.hp <= 0 && this.p2.hp <= 0) {
      // Draw round - reset HP and continue
      this.particles.addFloatingText(this.worldWidth / 2, 280, 'DOUBLE K.O.! DRAW ROUND', '#F59E0B', 26);
      this.scheduleNextRound(null);
      return;
    }

    if (this.p1.hp <= 0) {
      // Player 2 wins round
      this.p2Score += 1;
      this.roundWinner = 2;
      this.p2.actionState = 'victory';
      this.p1.actionState = 'defeat';
      sounds.playVictory();
      this.particles.addVictoryConfetti(this.worldWidth, this.worldHeight);

      if (this.p2Score >= this.settings.targetWins) {
        this.matchWinner = 2;
        this.state = 'MATCH_OVER';
        this.notifyUI();
      } else {
        this.state = 'ROUND_OVER';
        this.nextRoundTimer = 3.5;
        this.notifyUI();
      }
      return;
    }

    if (this.p2.hp <= 0) {
      // Player 1 wins round
      this.p1Score += 1;
      this.roundWinner = 1;
      this.p1.actionState = 'victory';
      this.p2.actionState = 'defeat';
      sounds.playVictory();
      this.particles.addVictoryConfetti(this.worldWidth, this.worldHeight);

      if (this.p1Score >= this.settings.targetWins) {
        this.matchWinner = 1;
        this.state = 'MATCH_OVER';
        this.notifyUI();
      } else {
        this.state = 'ROUND_OVER';
        this.nextRoundTimer = 3.5;
        this.notifyUI();
      }
      return;
    }

    // Switch Turn
    this.activeTurn = this.activeTurn === 1 ? 2 : 1;
    this.p1.actionState = 'idle';
    this.p2.actionState = 'idle';
    this.updateWind();
    this.state = 'AIMING';
    this.focusOnActivePlayer();
    this.notifyUI();
  }

  private scheduleNextRound(winner: 1 | 2 | null) {
    this.roundWinner = winner;
    this.state = 'ROUND_OVER';
    this.nextRoundTimer = 3.2;
    this.notifyUI();
  }

  private updateRoundOver(dt: number) {
    this.nextRoundTimer -= dt;
    if (this.nextRoundTimer <= 0) {
      this.currentRound += 1;
      this.initRound();
    }
  }

  public restartMatch() {
    this.startMatch(this.mode);
  }

  public quitToMenu() {
    this.state = 'TITLE';
    this.projectile = null;
    this.aim.isAiming = false;
    this.previewTrajectory = null;
    this.notifyUI();
  }

  private notifyUI() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  /**
   * Main Render Pass
   */
  public render(ctx: CanvasRenderingContext2D) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Apply Camera Transform
    const shakeOffset = {
      x: (Math.random() - 0.5) * this.particles.screenShake,
      y: (Math.random() - 0.5) * this.particles.screenShake,
    };

    this.camera.applyTransform(ctx, shakeOffset);

    // 1. Draw Battlefield Sky, Sun, Clouds, and Destructible Terrain
    this.environment.draw(ctx, this.terrain, this.camera.x, this.camera.y);

    // 2. Draw Trajectory Aiming Line (if aiming)
    if (this.previewTrajectory && this.previewTrajectory.points.length > 1) {
      this.drawTrajectoryLine(ctx, this.previewTrajectory);
    }

    // 3. Draw Characters
    const p1Pull =
      this.aim.isAiming && this.aim.activePlayerId === 1
        ? { dx: this.aim.pullDx, dy: this.aim.pullDy }
        : null;
    const p2Pull =
      this.aim.isAiming && this.aim.activePlayerId === 2
        ? { dx: this.aim.pullDx, dy: this.aim.pullDy }
        : null;

    drawCharacter(ctx, this.p1, p1Pull);
    drawCharacter(ctx, this.p2, p2Pull);

    // 4. Draw Active Projectile
    if (this.projectile) {
      drawProjectile(ctx, this.projectile);
    }

    // 5. Draw Particles and Floating Combat Text
    this.particles.draw(ctx);

    // Restore Camera Transform
    this.camera.restoreTransform(ctx);
  }

  private drawTrajectoryLine(ctx: CanvasRenderingContext2D, traj: TrajectoryResult) {
    ctx.save();
    const isP1 = this.activeTurn === 1;
    const color = isP1 ? '#38BDF8' : '#F87171';

    // Dotted parabolic trajectory arc
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);

    ctx.beginPath();
    ctx.moveTo(traj.points[0].x, traj.points[0].y);
    for (let i = 1; i < traj.points.length; i++) {
      ctx.lineTo(traj.points[i].x, traj.points[i].y);
    }
    ctx.stroke();

    // Draw little bouncing trajectory dots
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    for (let i = 0; i < traj.points.length; i += 3) {
      ctx.beginPath();
      ctx.arc(traj.points[i].x, traj.points[i].y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Landing Target Crosshair / Reticle
    if (traj.hitPoint) {
      ctx.save();
      ctx.translate(traj.hitPoint.x, traj.hitPoint.y);

      ctx.strokeStyle = traj.hitTarget.startsWith('player') ? '#EF4444' : '#FBBF24';
      ctx.lineWidth = 2.5;

      // Animated target ring
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair ticks
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(14, 0);
      ctx.moveTo(0, -14);
      ctx.lineTo(0, 14);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }
}
