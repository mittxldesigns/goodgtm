"use client";

import { useRef, useEffect, useCallback, useState } from "react";

const FRICTION = 0.92;
const MIN_VELOCITY = 0.05;
const TOTAL_FRAMES = 252;
const FPS = 24;

// ── Module-level frame cache (survives navigation) ──────────
let cachedFrames: ImageBitmap[] = [];
let cacheLoading = false;

function loadFrames(): Promise<ImageBitmap[]> {
  if (cachedFrames.length) return Promise.resolve(cachedFrames);
  if (cacheLoading) {
    // Wait for in-progress load
    return new Promise((resolve) => {
      const check = () => {
        if (cachedFrames.length) resolve(cachedFrames);
        else setTimeout(check, 100);
      };
      check();
    });
  }

  cacheLoading = true;

  const promises = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
    const idx = String(i + 1).padStart(3, "0");
    return new Promise<ImageBitmap>((resolve, reject) => {
      const img = new Image();
      img.onload = () => createImageBitmap(img).then(resolve).catch(reject);
      img.onerror = reject;
      img.src = `/frames/f${idx}.webp`;
    });
  });

  return Promise.all(promises).then((bitmaps) => {
    cachedFrames = bitmaps;
    cacheLoading = false;
    return bitmaps;
  });
}

export default function DraggableVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentFrame = useRef(0);
  const fractional = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastMoveTime = useRef(0);
  const velocity = useRef(0);
  const rafId = useRef(0);
  const lastTick = useRef(0);
  const sens = useRef(0.4);
  const [canvasReady, setCanvasReady] = useState(false);

  const wrap = (v: number, total: number) => ((v % total) + total) % total;

  const draw = useCallback((index: number) => {
    const ctx = ctxRef.current;
    if (!ctx || !cachedFrames.length) return;
    const total = cachedFrames.length;
    const safe = ((Math.floor(index) % total) + total) % total;
    currentFrame.current = safe;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(cachedFrames[safe], 0, 0);
  }, []);

  const startLoop = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    lastTick.current = performance.now();
    const tick = (now: number) => {
      if (dragging.current) return;
      const total = cachedFrames.length;
      if (!total) return;
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      fractional.current = wrap(fractional.current + dt * FPS, total);
      const idx = Math.floor(fractional.current);
      if (idx !== currentFrame.current) draw(idx);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
  }, [draw]);

  const startMomentum = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    let prev = performance.now();
    const tick = (now: number) => {
      if (dragging.current) return;
      const dt = now - prev;
      prev = now;
      velocity.current *= FRICTION;
      if (Math.abs(velocity.current) < MIN_VELOCITY) { startLoop(); return; }
      const total = cachedFrames.length;
      if (total > 0) {
        fractional.current = wrap(fractional.current + velocity.current * dt, total);
        draw(Math.floor(fractional.current));
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
  }, [draw, startLoop]);

  const releaseDrag = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    if (cachedFrames.length) {
      Math.abs(velocity.current) > MIN_VELOCITY ? startMomentum() : startLoop();
      return;
    }
    videoRef.current?.play();
  }, [startLoop, startMomentum]);

  // ── global stuck-drag safety nets ─────────────────────────
  useEffect(() => {
    const release = () => releaseDrag();
    const onVis = () => { if (document.hidden) releaseDrag(); };
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [releaseDrag]);

  const canvasCallback = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    if (node) {
      node.width = 460;
      node.height = 259;
      ctxRef.current = node.getContext("2d", { alpha: true });
    } else {
      ctxRef.current = null;
    }
  }, []);

  // ── load pre-extracted frames ─────────────────────────────
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    sens.current = isMobile ? 0.3 : 0.4;

    // If already cached, go straight to canvas
    if (cachedFrames.length) {
      setCanvasReady(true);
      fractional.current = 0;
      draw(0);
      startLoop();
      return () => { cancelAnimationFrame(rafId.current); };
    }

    let cancelled = false;

    loadFrames().then(() => {
      if (cancelled) return;
      setCanvasReady(true);
      fractional.current = 0;
      draw(0);
      startLoop();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId.current);
    };
  }, [draw, startLoop]);

  // ── pointer handlers ──────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    lastMoveTime.current = performance.now();
    velocity.current = 0;
    cancelAnimationFrame(rafId.current);
    if (!cachedFrames.length) videoRef.current?.pause();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const now = performance.now();
    const dx = e.clientX - lastX.current;
    const dt = now - lastMoveTime.current;
    lastX.current = e.clientX;
    lastMoveTime.current = now;

    if (cachedFrames.length) {
      if (dt > 0) velocity.current = (dx * sens.current) / dt;
      const total = cachedFrames.length;
      fractional.current = wrap(fractional.current + dx * sens.current, total);
      draw(Math.floor(fractional.current));
      return;
    }

    // Video fallback
    const video = videoRef.current;
    if (!video || !video.duration) return;
    let t = video.currentTime + dx * 0.012;
    t = ((t % video.duration) + video.duration) % video.duration;
    video.currentTime = t;
  }, [draw]);

  const onPointerUp = useCallback(() => releaseDrag(), [releaseDrag]);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="pointer-events-auto cursor-grab active:cursor-grabbing touch-none select-none"
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster="/hero-poster.webp"
        className={`w-[380px] md:w-[460px] ${canvasReady ? "hidden" : ""}`}
      >
        <source src="/hero-alpha.mp4?v=5" type='video/mp4; codecs="hvc1"' />
        <source src="/hero.webm?v=9" type='video/webm; codecs="vp9"' />
      </video>

      <canvas
        ref={canvasCallback}
        className={`w-[380px] md:w-[460px] ${canvasReady ? "" : "hidden"}`}
      />
    </div>
  );
}
