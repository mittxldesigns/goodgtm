"use client";

import { useEffect, useRef, useState } from "react";

export default function DitherOverlay({ blendMode = "screen", intensity = 0.22, beamIntensity = 1.0 }: { blendMode?: string; intensity?: number; beamIntensity?: number }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const animFrameRef = useRef(0);
  const timeRef = useRef(0);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    const offscreen = document.createElement("canvas");
    const w = Math.floor(window.innerWidth / 4);
    const h = Math.floor(window.innerHeight / 4);
    offscreen.width = w;
    offscreen.height = h;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    const bayerMatrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];

    const noise = (x: number, y: number, t: number) => {
      const v1 = Math.sin(x * 0.008 + t * 0.25) * Math.cos(y * 0.01 - t * 0.18);
      const v2 = Math.sin((x + y) * 0.006 + t * 0.12) * 0.5;
      const v3 = Math.cos(x * 0.005 - y * 0.007 + t * 0.2) * 0.35;
      const v4 = Math.sin(Math.sqrt(x * x + y * y) * 0.004 - t * 0.08) * 0.4;
      return (v1 + v2 + v3 + v4) * 0.5 + 0.5;
    };

    const renderFrame = (timestamp: number) => {
      // ~15fps
      if (timestamp - lastFrameRef.current < 66) {
        animFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }
      lastFrameRef.current = timestamp;

      timeRef.current += 0.012;
      const t = timeRef.current;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const n = noise(x * 4, y * 4, t);

          // Main beam — upper right area with magenta tint
          const cx = w * 0.62;
          const cy = h * 0.35;
          const dx = (x - cx) / w;
          const dy = (y - cy) / h;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const beam = Math.exp(-dist * 2.5) * 0.7 * beamIntensity;

          // Secondary glow — lower left
          const cx2 = w * 0.25;
          const cy2 = h * 0.75;
          const dx2 = (x - cx2) / w;
          const dy2 = (y - cy2) / h;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          const glow2 = Math.exp(-dist2 * 3.5) * 0.35 * beamIntensity;

          // Center glow for the 3D object
          const cx3 = w * 0.5;
          const cy3 = h * 0.48;
          const dx3 = (x - cx3) / w;
          const dy3 = (y - cy3) / h;
          const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
          const centerGlow = Math.exp(-dist3 * 4) * 0.25 * beamIntensity;

          const brightness = (n * 0.25 + beam + glow2 + centerGlow) * 255;
          const threshold = (bayerMatrix[y % 4][x % 4] / 16) * 255;
          const dithered = brightness > threshold ? 1 : 0;

          if (dithered > 0) {
            const dotBrightness = brightness / 255;
            // Magenta tint near the main beam, white elsewhere
            const magentaInfluence = beam / (beam + glow2 + centerGlow + 0.01);
            const r = Math.min(255, 255);
            const g = Math.min(255, Math.floor(255 - magentaInfluence * 140));
            const b = 255;
            const alpha = Math.min(dotBrightness * intensity, intensity) * 255;

            const idx = (y * w + x) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = alpha;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setImageUrl(offscreen.toDataURL("image/png"));
      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    const timer = setTimeout(() => {
      animFrameRef.current = requestAnimationFrame(renderFrame);
    }, 300);

    const handleResize = () => {
      offscreen.width = Math.floor(window.innerWidth / 4);
      offscreen.height = Math.floor(window.innerHeight / 4);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [intensity, beamIntensity]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10"
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: "100% 100%",
        imageRendering: "pixelated",
        mixBlendMode: blendMode as React.CSSProperties["mixBlendMode"],
      }}
    />
  );
}
