/**
 * Particle and Visual Effects System
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'circle' | 'star' | 'smoke' | 'spark' | 'confetti';
  rotation: number;
  rotSpeed: number;
  gravity?: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  alpha: number;
  vy: number;
  life: number;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public screenShake: number = 0;
  private textCounter: number = 0;

  public update(dt: number) {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      p.rotation += p.rotSpeed * dt;
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating combat texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0.4) {
        ft.alpha = Math.max(0, ft.life / 0.4);
      }
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public triggerScreenShake(intensity: number = 10) {
    this.screenShake = Math.min(22, this.screenShake + intensity);
  }

  public addTrailParticle(x: number, y: number, color: string = '#FDE047') {
    // Subtle smoke or sparkle puff behind flying projectile
    this.particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 20,
      vy: -15 + (Math.random() - 0.5) * 15,
      size: 4 + Math.random() * 5,
      color,
      alpha: 0.8,
      decay: 2.2,
      shape: Math.random() > 0.4 ? 'smoke' : 'spark',
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 4,
    });
  }

  public addImpactExplosion(x: number, y: number, isDirectHit: boolean = false) {
    this.triggerScreenShake(isDirectHit ? 14 : 9);

    const count = isDirectHit ? 35 : 22;
    const colors = ['#EF4444', '#F97316', '#FBBF24', '#FDE047', '#FFFFFF'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        size: 5 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 1.2 + Math.random() * 1.4,
        shape: Math.random() > 0.5 ? 'star' : 'spark',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 380,
      });
    }

    // Add dust / smoke rings
    for (let i = 0; i < 14; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 1.5;
      const speed = 40 + Math.random() * 110;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.7,
        size: 14 + Math.random() * 16,
        color: '#E2E8F0',
        alpha: 0.65,
        decay: 1.5,
        shape: 'smoke',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#EF4444', size: number = 22) {
    this.floatingTexts.push({
      id: ++this.textCounter,
      x,
      y,
      text,
      color,
      size,
      alpha: 1,
      vy: -45,
      life: 1.3,
    });
  }

  public addVictoryConfetti(width: number, height: number) {
    const palette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 140,
        vy: 120 + Math.random() * 180,
        size: 7 + Math.random() * 8,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: 1,
        decay: 0.35,
        shape: 'confetti',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        gravity: 80,
      });
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Draw particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'smoke') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.6);
      } else if (p.shape === 'star') {
        ctx.fillStyle = p.color;
        drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
      } else {
        // spark or circle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw floating texts
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${ft.size}px 'Fredoka', 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';

      // Outline for readability
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0F172A';
      ctx.strokeText(ft.text, ft.x, ft.y);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}
