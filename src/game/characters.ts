/**
 * Characters, Projectiles, and Cartoon Rendering
 */

export type ProjectileType = 'BOMB' | 'ROCKET' | 'BOUNCY' | 'CLUSTER';

export interface ProjectileConfig {
  type: ProjectileType;
  name: string;
  icon: string;
  baseDamage: number;
  blastRadius: number;
  speedMultiplier: number;
  description: string;
}

export const PROJECTILE_TYPES: Record<ProjectileType, ProjectileConfig> = {
  BOMB: {
    type: 'BOMB',
    name: 'Cartoon Bomb',
    icon: '💣',
    baseDamage: 35,
    blastRadius: 55,
    speedMultiplier: 1.0,
    description: 'Classic heavy explosive with solid area blast!',
  },
  ROCKET: {
    type: 'ROCKET',
    name: 'Acorn Rocket',
    icon: '🚀',
    baseDamage: 40,
    blastRadius: 45,
    speedMultiplier: 1.15,
    description: 'High-speed aerodynamic acorn with sharp precision.',
  },
  BOUNCY: {
    type: 'BOUNCY',
    name: 'Bouncy Melon',
    icon: '🍉',
    baseDamage: 32,
    blastRadius: 50,
    speedMultiplier: 0.95,
    description: 'Bounces once off terrain before popping!',
  },
  CLUSTER: {
    type: 'CLUSTER',
    name: 'Super Carrot',
    icon: '🥕',
    baseDamage: 38,
    blastRadius: 65,
    speedMultiplier: 1.05,
    description: 'Explodes into sweet shockwave blasts!',
  },
};

export interface CharacterState {
  id: 1 | 2;
  name: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  facing: 1 | -1; // 1 = right, -1 = left
  actionState: 'idle' | 'aiming' | 'firing' | 'hurt' | 'victory' | 'defeat';
  animTimer: number;
  hurtTimer: number;
  projectileType: ProjectileType;
}

export class ActiveProjectile {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public radius: number = 10;
  public type: ProjectileType;
  public shooterId: 1 | 2;
  public rotation: number = 0;
  public bouncesLeft: number = 0;
  public active: boolean = true;
  public lifetime: number = 0;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    type: ProjectileType,
    shooterId: 1 | 2
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.type = type;
    this.shooterId = shooterId;
    this.bouncesLeft = type === 'BOUNCY' ? 1 : 0;
  }
}

/**
 * Draws cartoon character with cute procedural animations
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  char: CharacterState,
  aimPullBack: { dx: number; dy: number } | null = null
) {
  ctx.save();
  ctx.translate(char.x, char.y);

  // Breathing & idle wobble
  const breathe = Math.sin(char.animTimer * 3) * 2;
  const isP1 = char.id === 1;

  // Hurt shake
  let hurtShakeX = 0;
  if (char.hurtTimer > 0) {
    hurtShakeX = Math.sin(char.hurtTimer * 40) * 4;
  }

  ctx.translate(hurtShakeX, breathe);
  ctx.scale(char.facing, 1);

  // Character shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const primaryColor = isP1 ? '#3B82F6' : '#EF4444';
  const secondaryColor = isP1 ? '#93C5FD' : '#FCA5A5';
  const darkColor = isP1 ? '#1D4ED8' : '#B91C1C';

  // Body: Chubby rounded oval
  ctx.fillStyle = primaryColor;
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-18, -32, 36, 34, [16, 16, 12, 12]);
  ctx.fill();
  ctx.stroke();

  // Belly patch
  ctx.fillStyle = secondaryColor;
  ctx.beginPath();
  ctx.ellipse(0, -14, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  if (isP1) {
    // Cat / Knight ears
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.moveTo(-14, -30);
    ctx.lineTo(-18, -44);
    ctx.lineTo(-6, -32);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(6, -32);
    ctx.lineTo(18, -44);
    ctx.lineTo(14, -30);
    ctx.fill();
    ctx.stroke();
  } else {
    // Fox / Bandit ears
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(-14, -30);
    ctx.lineTo(-20, -46);
    ctx.lineTo(-5, -32);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(5, -32);
    ctx.lineTo(20, -46);
    ctx.lineTo(14, -30);
    ctx.fill();
    ctx.stroke();
  }

  // Eyes & Expressions
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.5;

  if (char.actionState === 'hurt') {
    // X_X dizzy eyes
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    // Left eye X
    ctx.beginPath();
    ctx.moveTo(-11, -24);
    ctx.lineTo(-3, -16);
    ctx.moveTo(-3, -24);
    ctx.lineTo(-11, -16);
    ctx.stroke();

    // Right eye X
    ctx.beginPath();
    ctx.moveTo(3, -24);
    ctx.lineTo(11, -16);
    ctx.moveTo(11, -24);
    ctx.lineTo(3, -16);
    ctx.stroke();
  } else if (char.actionState === 'victory') {
    // Happy squint eyes ^_^
    ctx.beginPath();
    ctx.arc(-7, -19, 5, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(7, -19, 5, Math.PI, 0);
    ctx.stroke();

    // Big happy smile
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, -11, 6, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
  } else {
    // Normal cartoon eyes looking forward
    ctx.beginPath();
    ctx.ellipse(-7, -20, 5.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(7, -20, 5.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils looking towards opponent
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-5.5, -20, 3, 0, Math.PI * 2);
    ctx.arc(8.5, -20, 3, 0, Math.PI * 2);
    ctx.fill();

    // Shine highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-7, -22, 1.5, 0, Math.PI * 2);
    ctx.arc(7, -22, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Cute mouth
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -11, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // Bandit bandana / mask for Player 2
  if (!isP1) {
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(-16, -26, 32, 11, 4);
    ctx.fill();
  }

  // Goggles / Headband for Player 1
  if (isP1) {
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.rect(-17, -28, 34, 5);
    ctx.fill();
  }

  // Hands & Slingshot
  ctx.fillStyle = primaryColor;
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.5;

  // Slingshot wooden fork in front hand
  const slingX = 18;
  const slingY = -12;

  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(slingX, slingY + 12);
  ctx.lineTo(slingX, slingY);
  ctx.lineTo(slingX - 6, slingY - 12);
  ctx.moveTo(slingX, slingY);
  ctx.lineTo(slingX + 6, slingY - 12);
  ctx.stroke();

  // Rubber band stretching when aiming
  if (aimPullBack && char.actionState === 'aiming') {
    // Un-scale dx because character is flipped if facing -1
    const pullX = aimPullBack.dx * char.facing;
    const pullY = aimPullBack.dy;

    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(slingX - 6, slingY - 12);
    ctx.lineTo(slingX + pullX, slingY + pullY);
    ctx.lineTo(slingX + 6, slingY - 12);
    ctx.stroke();

    // Draw projectile being pulled in the pocket
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(slingX + pullX, slingY + pullY, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Rest band
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(slingX - 6, slingY - 12);
    ctx.lineTo(slingX, slingY - 8);
    ctx.lineTo(slingX + 6, slingY - 12);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws the flying projectile with spin and cartoon flair
 */
export function drawProjectile(ctx: CanvasRenderingContext2D, proj: ActiveProjectile) {
  ctx.save();
  ctx.translate(proj.x, proj.y);
  ctx.rotate(proj.rotation);

  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.5;

  if (proj.type === 'BOMB') {
    // Round black bomb with brass cap and burning fuse
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fuse cap
    ctx.fillStyle = '#D97706';
    ctx.fillRect(-3, -proj.radius - 4, 6, 4);

    // Fuse spark
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(0, -proj.radius - 6, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (proj.type === 'ROCKET') {
    // Acorn rocket with fins
    ctx.fillStyle = '#854D0E';
    ctx.beginPath();
    ctx.ellipse(0, 0, proj.radius + 3, proj.radius - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Acorn textured cap
    ctx.fillStyle = '#713F12';
    ctx.beginPath();
    ctx.arc(-proj.radius + 2, 0, proj.radius * 0.75, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();
    ctx.stroke();

    // Red thruster nose
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(proj.radius + 3, 0);
    ctx.lineTo(proj.radius - 3, -4);
    ctx.lineTo(proj.radius - 3, 4);
    ctx.closePath();
    ctx.fill();
  } else if (proj.type === 'BOUNCY') {
    // Watermelon sphere with stripes
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dark green wavy stripes
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius, -0.6, 0.6);
    ctx.stroke();
  } else {
    // Super carrot
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(proj.radius + 5, 0);
    ctx.lineTo(-proj.radius, -6);
    ctx.lineTo(-proj.radius, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Green leafy top
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(-proj.radius - 5, -3, 5, 6);
  }

  ctx.restore();
}
