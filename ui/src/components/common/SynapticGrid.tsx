import React, { useEffect, useRef } from 'react';

export const SynapticGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // ── Physics constants ──────────────────────────────────────────────────
    const GRID_SPACING  = 52;   // px between nodes
    const PROX_RADIUS   = 140;  // cursor influence radius
    const ELASTICITY    = 0.07; // spring return speed  (lower = slower)
    const MAGNET_PULL   = 0.28; // how much cursor attracts nearby nodes
    const LINE_RADIUS   = 90;   // draw connecting lines within this range
    const LINE_OPACITY  = 0.07; // base opacity of grid lines

    // ── Node class ─────────────────────────────────────────────────────────
    class GridPoint {
      baseX: number;
      baseY: number;
      x: number;
      y: number;

      constructor(baseX: number, baseY: number) {
        this.baseX = baseX;
        this.baseY = baseY;
        this.x = baseX;
        this.y = baseY;
      }

      update(mx: number, my: number) {
        const dx = mx - this.baseX;
        const dy = my - this.baseY;
        const dist = Math.hypot(dx, dy);

        let targetX = this.baseX;
        let targetY = this.baseY;

        if (dist < PROX_RADIUS) {
          const force = (PROX_RADIUS - dist) / PROX_RADIUS;
          targetX += dx * force * MAGNET_PULL;
          targetY += dy * force * MAGNET_PULL;
        }

        this.x += (targetX - this.x) * ELASTICITY;
        this.y += (targetY - this.y) * ELASTICITY;
      }

      draw(context: CanvasRenderingContext2D, mx: number, my: number) {
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.hypot(dx, dy);

        context.beginPath();
        context.arc(this.x, this.y, 1.4, 0, Math.PI * 2);

        if (dist < PROX_RADIUS) {
          const alpha = ((PROX_RADIUS - dist) / PROX_RADIUS) * 0.85 + 0.08;
          context.fillStyle = `rgba(139, 92, 246, ${alpha})`;  // brand-500
        } else {
          context.fillStyle = 'rgba(255, 255, 255, 0.055)';
        }
        context.fill();
      }
    }

    let gridPoints: GridPoint[] = [];

    // ── Initialise / resize grid ───────────────────────────────────────────
    const initGrid = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      gridPoints = [];

      for (let x = 0; x <= canvas.width; x += GRID_SPACING) {
        for (let y = 0; y <= canvas.height; y += GRID_SPACING) {
          gridPoints.push(new GridPoint(x, y));
        }
      }
    };

    // ── Mouse tracking ─────────────────────────────────────────────────────
    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handlePointerLeave = () => {
      mouseRef.current.targetX = -9999;
      mouseRef.current.targetY = -9999;
    };

    // ── Render loop ────────────────────────────────────────────────────────
    const loop = () => {
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.1;
      m.y += (m.targetY - m.y) * 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle connecting lines between nearby nodes
      const cols = Math.ceil(canvas.width / GRID_SPACING) + 1;
      for (let i = 0; i < gridPoints.length; i++) {
        const p = gridPoints[i];
        // connect to right neighbour
        const rightIdx = i + gridPoints.length / cols; // approximate — just connect every node to its right
        if (i % Math.ceil(canvas.height / GRID_SPACING + 1) !== Math.ceil(canvas.height / GRID_SPACING)) {
          const below = gridPoints[i + 1];
          if (below) {
            const dx = m.x - p.x;
            const dy = m.y - p.y;
            const dist = Math.hypot(dx, dy);
            const glowLine = dist < LINE_RADIUS;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(below.x, below.y);
            ctx.strokeStyle = glowLine
              ? `rgba(139, 92, 246, ${((LINE_RADIUS - dist) / LINE_RADIUS) * 0.25})`
              : `rgba(255,255,255,${LINE_OPACITY})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        void rightIdx; // suppress unused warning
      }

      // Draw & update each node
      gridPoints.forEach(p => {
        p.update(m.x, m.y);
        p.draw(ctx, m.x, m.y);
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', initGrid);
    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerleave', handlePointerLeave);

    initGrid();
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initGrid);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, transform: 'translate3d(0,0,0)' }}
    />
  );
};
