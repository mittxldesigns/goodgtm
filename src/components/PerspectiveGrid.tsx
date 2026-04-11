"use client";

import { useEffect, useRef } from "react";

export default function PerspectiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let offset = 0;
    const speed = 0.5;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const vx = W / 2;
      const vy = H * 0.46; // vanishing point — slightly above center

      // Horizon glow
      const hGrad = ctx.createLinearGradient(0, vy - 40, 0, vy + 60);
      hGrad.addColorStop(0, "rgba(255,255,255,0)");
      hGrad.addColorStop(0.45, "rgba(255,255,255,0.06)");
      hGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, vy - 40, W, 100);

      // Radial point glow at vanishing point
      const rGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, 180);
      rGrad.addColorStop(0, "rgba(255,255,255,0.04)");
      rGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = rGrad;
      ctx.fillRect(vx - 180, vy - 180, 360, 360);

      // Convergence lines (radial, floor only)
      const numCols = 18;
      for (let i = 0; i <= numCols; i++) {
        const t = i / numCols;
        const bottomX = t * W;
        const centerDist = Math.abs(t - 0.5) * 2;
        const alpha = 0.03 + (1 - centerDist) * 0.06;
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(bottomX, H);
        ctx.stroke();
      }

      // Horizontal perspective lines (animated scroll toward viewer)
      const focalLength = (H - vy) * 0.18;
      const gridSpacing = (H - vy) * 0.14;
      const numHLines = 22;

      offset = (offset + speed) % gridSpacing;

      for (let n = 1; n <= numHLines; n++) {
        const D = gridSpacing * n - offset;
        if (D <= 0) continue;

        const screenY = vy + (H - vy) * (focalLength / D);
        if (screenY > H + 2 || screenY < vy) continue;

        const t = Math.min(1, (screenY - vy) / (H - vy));
        const alpha = Math.min(0.4, t * 0.5);
        const lineWidth = 0.2 + t * 1.8;

        const leftX = vx - vx * t;
        const rightX = vx + (W - vx) * t;

        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(leftX, screenY);
        ctx.lineTo(rightX, screenY);
        ctx.stroke();
      }

      // Subtle vignette — darkens edges, keeps center alive
      const vigGrad = ctx.createRadialGradient(vx, H * 0.5, H * 0.1, vx, H * 0.5, H * 0.85);
      vigGrad.addColorStop(0, "rgba(10,10,10,0)");
      vigGrad.addColorStop(1, "rgba(10,10,10,0.55)");
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, W, H);

      animFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
      }}
    />
  );
}
