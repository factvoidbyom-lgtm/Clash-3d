import React, { useEffect, useRef } from 'react';
import { GameManager } from '../game/gameManager';

interface GameCanvasProps {
  game: GameManager;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ game }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activePointerId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      game.camera.setViewport(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const loop = (now: number) => {
      const dt = Math.min(0.08, (now - lastTime) / 1000);
      lastTime = now;

      game.update(dt);
      game.render(ctx);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [game]);

  // Pointer / Touch aiming event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current !== null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const started = game.onAimStart(screenX, screenY);
    if (started) {
      activePointerId.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // fallback
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current !== e.pointerId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    game.onAimMove(screenX, screenY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current === e.pointerId) {
      activePointerId.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // fallback
      }
      game.onAimEnd();
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current === e.pointerId) {
      activePointerId.current = null;
      game.onAimEnd();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="w-full h-full block cursor-crosshair touch-none select-none"
    />
  );
};
