import React, { useEffect, useRef } from 'react';

export const SynapticGrid: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let gridPoints: GridPoint[] = [];

    // Premium UI Physics Parameters
    const GRID_SPACING = 50; // The pixel gap between node intersections
    const PROXIMITY_RADIUS = 130; // Area of effect around the cursor
    const ELASTICITY = 0.08; // Return snap speed
    const MAGNET_PULL = 0.25; // Pull factor toward the cursor coordinate

    class GridPoint {
      baseX: number;
      baseY: number;
      x: number;
      y: number;

      constructor(x: number, y: number) {
        this.baseX = x;
        this.baseY = y;
        this.x = x;
        this.y = y;
      }

      update(mouseX: number, mouseY: number) {
        const dx = mouseX - this.baseX;
        const dy = mouseY - this.baseY;
        const distance = Math.hypot(dx, dy);

        let targetX = this.baseX;
        let targetY = this.baseY;

        // If cursor is near, gently pull the node toward it
        if (distance < PROXOC_RADIUS) {
          const proximityForce = (PROXOC_RADIUS - distance) / PROXOC_RADIUS;
          targetX += dx * proximityForce * MAGNET_PULL;
          targetY += dy * proximityForce * MAGNET_PULL;
        }

        // Apply smooth linear interpolation back to base position
        this.x += (targetX - this.x) * ELASTICITY;
        this.y += (targetY - this.y) * ELASTICITY;
      }

      draw(context: CanvasRenderingContext2D, mouseX: number, mouseY: number) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.hypot(dx, dy);

        context.beginPath();
        context.arc(this.x, this.y, 1.2, 0, Math.PI * 2);

        if (distance < PROXOC_RADIUS) {
          // Illuminate nodes near the cursor with a sleek indigo glow
          const alpha = (PROXOC_RADIUS - distance) / PROXOC_RADIUS;
          context.fillStyle = `rgba(99, 102, 241, ${alpha * 0.75 + 0.1})`;
        } else {
          // Keep distant nodes dark and minimal
          context.fillStyle = 'rgba(255, 255, 255, 0.04)';
        }
        context.fill();
      }
    }

    const PROXOC_RADIUS = PROXIMITY_RADIUS;

    const initGrid = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gridPoints = [];

      // Calculate perfect grid intersection coordinates across the viewport
      for (let x = 0; x < canvas.width; x += GRID_SPACING) {
        for (let y = 0; y < canvas.height; y += GRID_SPACING) {
          gridPoints.push(new GridPoint(x, y));
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const loop = () => {
      // Smooth cursor path filtering
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.12;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.12;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      gridPoints.forEach((point) => {
        point.update(mouseRef.current.x, mouseRef.current.y);
        point.draw(ctx, mouseRef.current.x, mouseRef.current.y);
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    window.addEventListener('resize', initGrid);
    window.addEventListener('pointermove', handlePointerMove);

    initGrid();
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', initGrid);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none block"
      style={{ transform: 'translate3d(0,0,0)' }}
    />
  );
};
