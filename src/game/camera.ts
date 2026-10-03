/**
 * Dynamic 2D Camera with smooth lerping, tracking, and zoom
 */

export class GameCamera {
  public x: number = 0; // Center world X
  public y: number = 0; // Center world Y
  public targetX: number = 0;
  public targetY: number = 0;
  public zoom: number = 1;
  public targetZoom: number = 1;

  public viewportWidth: number = 800;
  public viewportHeight: number = 600;
  public worldWidth: number = 1800;
  public worldHeight: number = 1000;

  constructor(worldWidth: number = 1800, worldHeight: number = 1000) {
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.x = worldWidth / 2;
    this.y = worldHeight / 2;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  public setViewport(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;

    // Calculate base zoom to ensure proper arena visibility
    // On mobile screens, provide adequate view of both duelists
    const isPortrait = height > width;
    const targetSpanX = isPortrait ? 1300 : 1650;
    const calculatedZoom = Math.min(1.4, Math.max(0.45, width / targetSpanX));
    this.targetZoom = calculatedZoom;
    if (this.zoom === 1) {
      this.zoom = calculatedZoom;
    }
  }

  public focusOn(worldX: number, worldY: number, instant: boolean = false, customZoom?: number) {
    this.targetX = worldX;
    this.targetY = worldY;
    if (customZoom !== undefined) {
      this.targetZoom = customZoom;
    }
    if (instant) {
      this.x = this.targetX;
      this.y = this.targetY;
      if (customZoom !== undefined) {
        this.zoom = this.targetZoom;
      }
    }
  }

  public frameBoth(x1: number, y1: number, x2: number, y2: number) {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - 40;
    const spanX = Math.abs(x2 - x1) + 260;
    const baseZoom = Math.min(1.2, Math.max(0.5, this.viewportWidth / spanX));
    this.focusOn(midX, midY, false, baseZoom);
  }

  public update(dt: number) {
    // Smooth lerp camera movement
    const lerpSpeed = Math.min(1, dt * 7.5);
    this.x += (this.targetX - this.x) * lerpSpeed;
    this.y += (this.targetY - this.y) * lerpSpeed;
    this.zoom += (this.targetZoom - this.zoom) * (lerpSpeed * 0.8);

    // Clamp camera within world bounds
    const halfW = (this.viewportWidth / 2) / this.zoom;
    const halfH = (this.viewportHeight / 2) / this.zoom;

    if (halfW * 2 < this.worldWidth) {
      this.x = Math.max(halfW, Math.min(this.worldWidth - halfW, this.x));
    }
    if (halfH * 2 < this.worldHeight) {
      this.y = Math.max(halfH, Math.min(this.worldHeight - halfH, this.y));
    }
  }

  /**
   * Applies camera transformation to canvas context
   */
  public applyTransform(ctx: CanvasRenderingContext2D, shakeOffset: { x: number; y: number } = { x: 0, y: 0 }) {
    ctx.save();
    ctx.translate(this.viewportWidth / 2 + shakeOffset.x, this.viewportHeight / 2 + shakeOffset.y);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  public restoreTransform(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  /**
   * Converts screen pixel coordinate to world space
   */
  public screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const centeredX = screenX - this.viewportWidth / 2;
    const centeredY = screenY - this.viewportHeight / 2;
    const unzoomedX = centeredX / this.zoom;
    const unzoomedY = centeredY / this.zoom;
    return {
      x: unzoomedX + this.x,
      y: unzoomedY + this.y,
    };
  }

  /**
   * Converts world space coordinate to screen pixel
   */
  public worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const unzoomedX = worldX - this.x;
    const unzoomedY = worldY - this.y;
    return {
      x: unzoomedX * this.zoom + this.viewportWidth / 2,
      y: unzoomedY * this.zoom + this.viewportHeight / 2,
    };
  }
}
