"use client";

import { useEffect, useRef } from "react";

export default function OrganicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainEl = useRef<HTMLCanvasElement | null>(null);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    grainEl.current = document.createElement("canvas");
    let animFrame: number;
    let t = 0;

    const rebuildGrain = () => {
      const gc = grainEl.current!;
      const s = 3; // 1/3 res — upscaled for chunky film grain
      gc.width = Math.ceil(canvas.width / s);
      gc.height = Math.ceil(canvas.height / s);
      const gCtx = gc.getContext("2d")!;
      const id = gCtx.createImageData(gc.width, gc.height);
      const d = id.data;
      for (let i = 0; i < gc.width * gc.height; i++) {
        const v = (Math.random() * 40) | 0;
        const idx = i << 2;
        d[idx] = d[idx + 1] = d[idx + 2] = v;
        d[idx + 3] = 36;
      }
      gCtx.putImageData(id, 0, 0);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      rebuildGrain();
    };

    const draw = () => {
      t += 0.0010;
      tick.current++;

      const W = canvas.width;
      const H = canvas.height;

      // ── Base ──────────────────────────────────────────────
      ctx.fillStyle = "#0d0c0b";
      ctx.fillRect(0, 0, W, H);

      // ── Warm ambient bloom — upper left ───────────────────
      const bloom = ctx.createRadialGradient(
        W * 0.26, H * 0.19, 0,
        W * 0.26, H * 0.19, W * 0.6
      );
      bloom.addColorStop(0, "rgba(218, 200, 172, 0.20)");
      bloom.addColorStop(0.35, "rgba(140, 126, 106, 0.07)");
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);

      // ── Dark vignette — right side ─────────────────────────
      const vig = ctx.createRadialGradient(
        W * 0.72, H * 0.48, W * 0.05,
        W * 0.72, H * 0.48, W * 0.58
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.52)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ── Wave 1 — large background sweep ───────────────────
      const p1 = Math.sin(t * 0.9) * 0.011;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.bezierCurveTo(
        W * 0.10, H * (0.64 + p1),
        W * 0.42, H * (0.42 - p1 * 0.6),
        W, H * (0.50 + p1 * 0.4)
      );
      ctx.lineTo(W, H);
      ctx.closePath();
      const wg1 = ctx.createLinearGradient(0, H * 0.40, 0, H);
      wg1.addColorStop(0.0, "rgba(30, 27, 23, 0.0)");
      wg1.addColorStop(0.12, "rgba(27, 24, 20, 0.88)");
      wg1.addColorStop(1.0, "rgba(13, 12, 10, 1)");
      ctx.fillStyle = wg1;
      ctx.fill();

      // ridge highlight
      ctx.beginPath();
      ctx.moveTo(0, H * (0.97 + p1 * 0.2));
      ctx.bezierCurveTo(
        W * 0.10, H * (0.64 + p1),
        W * 0.42, H * (0.42 - p1 * 0.6),
        W, H * (0.50 + p1 * 0.4)
      );
      ctx.strokeStyle = "rgba(200, 184, 158, 0.13)";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // ── Wave 2 — foreground dune ───────────────────────────
      const p2 = Math.sin(t * 0.65 + 1.9) * 0.008;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.bezierCurveTo(
        W * 0.32, H * (0.80 + p2),
        W * 0.60, H * (0.63 - p2),
        W, H * (0.72 + p2 * 0.5)
      );
      ctx.lineTo(W, H);
      ctx.closePath();
      const wg2 = ctx.createLinearGradient(W * 0.32, H * 0.62, W * 0.68, H);
      wg2.addColorStop(0.0, "rgba(22, 20, 17, 0.0)");
      wg2.addColorStop(0.18, "rgba(20, 18, 15, 0.94)");
      wg2.addColorStop(1.0, "rgba(10, 9, 8, 1)");
      ctx.fillStyle = wg2;
      ctx.fill();

      // ridge highlight
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.bezierCurveTo(
        W * 0.32, H * (0.80 + p2),
        W * 0.60, H * (0.63 - p2),
        W, H * (0.72 + p2 * 0.5)
      );
      ctx.strokeStyle = "rgba(168, 154, 136, 0.11)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // ── Contour arcs — mid area (topology hint) ────────────
      const cp = Math.sin(t * 0.38 + 0.6) * 0.005;
      const contours = [
        { yBase: 0.42, alpha: 0.11 },
        { yBase: 0.46, alpha: 0.065 },
      ];
      for (const { yBase, alpha } of contours) {
        ctx.beginPath();
        ctx.moveTo(W * 0.07, H * (yBase + cp));
        ctx.bezierCurveTo(
          W * 0.28, H * (yBase - 0.04 - cp * 0.5),
          W * 0.55, H * (yBase - 0.08 + cp * 0.3),
          W * 0.90, H * (yBase - 0.02 - cp * 0.2)
        );
        ctx.strokeStyle = `rgba(215, 198, 175, ${alpha})`;
        ctx.lineWidth = 0.65;
        ctx.stroke();
      }

      // ── Film grain ─────────────────────────────────────────
      if (tick.current % 5 === 0) rebuildGrain();
      if (grainEl.current) {
        ctx.drawImage(grainEl.current, 0, 0, W, H);
      }

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
      style={{ position: "fixed", inset: 0, zIndex: 10, pointerEvents: "none" }}
    />
  );
}
