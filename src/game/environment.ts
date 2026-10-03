/**
 * 2D Cartoon Battlefield Environment & Terrain Graphics
 */

import { TerrainMap } from './physics';

export interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
}

export class EnvironmentRenderer {
  private clouds: Cloud[] = [];
  private sunAngle: number = 0;
  private grassSway: number = 0;

  constructor(worldWidth: number = 1800) {
    // Generate initial clouds
    for (let i = 0; i < 9; i++) {
      this.clouds.push({
        x: Math.random() * worldWidth,
        y: 60 + Math.random() * 220,
        speed: 10 + Math.random() * 20,
        scale: 0.6 + Math.random() * 0.8,
        opacity: 0.75 + Math.random() * 0.25,
      });
    }
  }

  public update(dt: number, worldWidth: number) {
    this.sunAngle += dt * 0.35;
    this.grassSway += dt * 3.5;

    for (const cloud of this.clouds) {
      cloud.x += cloud.speed * dt;
      if (cloud.x > worldWidth + 200) {
        cloud.x = -200;
        cloud.y = 60 + Math.random() * 220;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, terrain: TerrainMap, cameraX: number, cameraY: number) {
    const w = terrain.width;
    const h = terrain.height;

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#60A5FA'); // Vibrant sky blue
    skyGrad.addColorStop(0.45, '#93C5FD');
    skyGrad.addColorStop(0.85, '#BAE6FD');
    skyGrad.addColorStop(1, '#E0F2FE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Cartoon Sun with Rotating Rays
    this.drawSun(ctx, w * 0.5, 160);

    // 3. Distant Parallax Mountains / Hills (slow shift)
    this.drawDistantHills(ctx, w, h, cameraX);

    // 4. Clouds
    for (const cloud of this.clouds) {
      this.drawCloud(ctx, cloud.x, cloud.y, cloud.scale, cloud.opacity);
    }

    // 5. Main Destructible Ground / Terrain
    this.drawTerrain(ctx, terrain);
  }

  private drawSun(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    ctx.save();
    ctx.translate(cx, cy);

    // Sun Rays
    ctx.save();
    ctx.rotate(this.sunAngle);
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(48, 0);
      ctx.lineTo(76, 0);
      ctx.stroke();
      ctx.rotate((Math.PI * 2) / 12);
    }
    ctx.restore();

    // Sun Outer Glow
    const sunGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, 60);
    sunGlow.addColorStop(0, '#FDE047');
    sunGlow.addColorStop(0.7, '#FBBF24');
    sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 56, 0, Math.PI * 2);
    ctx.fill();

    // Sun Center Disk
    ctx.fillStyle = '#FBBF24';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Happy Sun Face
    ctx.fillStyle = '#78350F';
    // Eyes
    ctx.beginPath();
    ctx.arc(-11, -4, 3.5, 0, Math.PI * 2);
    ctx.arc(11, -4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(0, 2, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();
    // Cheeks
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.beginPath();
    ctx.arc(-15, 4, 4.5, 0, Math.PI * 2);
    ctx.arc(15, 4, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawDistantHills(ctx: CanvasRenderingContext2D, w: number, h: number, cameraX: number) {
    // Distant soft lavender hills
    ctx.save();
    const parallaxOffset = (cameraX - w / 2) * 0.15;
    ctx.fillStyle = '#A7F3D0';
    ctx.beginPath();
    ctx.moveTo(-100, h);
    ctx.lineTo(-100, h * 0.65);
    for (let x = -100; x <= w + 100; x += 120) {
      const hillY = h * 0.65 + Math.sin((x + parallaxOffset) * 0.003) * 60;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w + 100, h);
    ctx.closePath();
    ctx.fill();

    // Midground soft teal hills
    const midParallax = (cameraX - w / 2) * 0.28;
    ctx.fillStyle = '#6EE7B7';
    ctx.beginPath();
    ctx.moveTo(-100, h);
    ctx.lineTo(-100, h * 0.7);
    for (let x = -100; x <= w + 100; x += 90) {
      const hillY = h * 0.7 + Math.cos((x + midParallax) * 0.0045) * 45;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(w + 100, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opacity: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.arc(20, -8, 28, 0, Math.PI * 2);
    ctx.arc(48, -4, 22, 0, Math.PI * 2);
    ctx.arc(66, 6, 18, 0, Math.PI * 2);
    ctx.arc(28, 10, 22, 0, Math.PI * 2);
    ctx.arc(-6, 8, 16, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // Subtle cloud shadow underneath
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.arc(28, 12, 18, 0, Math.PI);
    ctx.arc(48, 10, 14, 0, Math.PI);
    ctx.fill();

    ctx.restore();
  }

  private drawTerrain(ctx: CanvasRenderingContext2D, terrain: TerrainMap) {
    const step = 8;
    const count = Math.ceil(terrain.width / step);

    ctx.save();

    // 1. Earth / Dirt Body Fill
    ctx.beginPath();
    ctx.moveTo(0, terrain.height);
    ctx.lineTo(0, terrain.getHeight(0));

    for (let i = 0; i <= count; i++) {
      const x = Math.min(terrain.width, i * step);
      const y = terrain.getHeight(x);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(terrain.width, terrain.height);
    ctx.closePath();

    // Earthy warm clay/soil gradient
    const dirtGrad = ctx.createLinearGradient(0, terrain.height * 0.5, 0, terrain.height);
    dirtGrad.addColorStop(0, '#92400E'); // Rich warm brown
    dirtGrad.addColorStop(0.3, '#78350F');
    dirtGrad.addColorStop(1, '#451A03'); // Dark bedrock
    ctx.fillStyle = dirtGrad;
    ctx.fill();

    // Draw little stone pebbles in the dirt
    ctx.fillStyle = '#573010';
    for (let px = 80; px < terrain.width; px += 180) {
      const py = terrain.getHeight(px) + 55;
      ctx.beginPath();
      ctx.ellipse(px, py, 9, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Thick Cartoon Grass Rim on surface
    ctx.beginPath();
    ctx.moveTo(0, terrain.getHeight(0) + 16);
    for (let i = 0; i <= count; i++) {
      const x = Math.min(terrain.width, i * step);
      const y = terrain.getHeight(x);
      ctx.lineTo(x, y);
    }
    // Bottom border of grass line
    for (let i = count; i >= 0; i--) {
      const x = Math.min(terrain.width, i * step);
      const y = terrain.getHeight(x) + 14;
      ctx.lineTo(x, y);
    }
    ctx.closePath();

    const grassGrad = ctx.createLinearGradient(0, 0, 0, 16);
    grassGrad.addColorStop(0, '#22C55E'); // Fresh bright green
    grassGrad.addColorStop(1, '#15803D'); // Deep grass
    ctx.fillStyle = '#22C55E';
    ctx.fill();

    // Grass outline
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, terrain.getHeight(0));
    for (let i = 0; i <= count; i++) {
      const x = Math.min(terrain.width, i * step);
      const y = terrain.getHeight(x);
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Little flowers and grass tufts across the hills
    ctx.save();
    for (let fx = 50; fx < terrain.width; fx += 80) {
      const fy = terrain.getHeight(fx);
      // Grass tufts
      ctx.strokeStyle = '#16A34A';
      ctx.lineWidth = 2.5;
      const sway = Math.sin(this.grassSway + fx) * 3;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx + sway, fy - 8, fx + sway * 1.5 - 2, fy - 10);
      ctx.moveTo(fx + 4, fy);
      ctx.quadraticCurveTo(fx + 4 + sway, fy - 7, fx + 5 + sway * 1.5, fy - 9);
      ctx.stroke();

      // Daisy flower on every 3rd patch
      if (fx % 240 === 50) {
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(fx + 1, fy - 11, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(fx + 1, fy - 11, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Draw crater scorched edges
    for (const crater of terrain.craters) {
      ctx.save();
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(crater.x, crater.y + 4, crater.radius * 0.9, 0, Math.PI);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
