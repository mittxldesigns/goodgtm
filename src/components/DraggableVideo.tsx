"use client";

import { useRef, useEffect, useCallback, useState } from "react";

const FRICTION = 0.92;
const MIN_VELOCITY = 0.05;
const TOTAL_FRAMES = 252;
const FPS = 24;

// ── Decode-time downscale to cut memory. 252 frames at 460x259 RGBA ≈ 120MB
// resident — an OOM / GC-jank risk on low-RAM phones. Desktop keeps full res;
// phones use a smaller backing store matched to the on-screen display size. ──
function pickFrameSize(): { w: number; h: number } {
  if (typeof window === "undefined") return { w: 460, h: 259 };
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!isMobile) return { w: 460, h: 259 };
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (mem && mem <= 4) return { w: 262, h: 148 }; // budget device: max cut (~39MB)
  return { w: 380, h: 214 }; // typical phone: stays sharp (~82MB)
}

// ── Module-level frame cache (survives navigation) ──────────
let cachedFrames: ImageBitmap[] = [];
let cacheLoading = false;
let frameSize: { w: number; h: number } | null = null;
function getFrameSize() {
  if (!frameSize) frameSize = pickFrameSize();
  return frameSize;
}

// Side-effect-free status getter for the #debug HUD (no React import needed).
export function framesLoaded() {
  return { loaded: cachedFrames.length, total: TOTAL_FRAMES };
}

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
  const { w, h } = getFrameSize();

  // Per-frame: resolve to a (downscaled) ImageBitmap, or null on error/timeout.
  // One bad frame must NOT reject the whole batch — that would leave the cache
  // empty forever and the drag permanently dead on flaky networks.
  const settle = (i: number): Promise<ImageBitmap | null> => {
    const idx = String(i + 1).padStart(3, "0");
    return new Promise((resolve) => {
      let done = false;
      const finish = (v: ImageBitmap | null) => {
        if (!done) { done = true; resolve(v); }
      };
      const timer = setTimeout(() => finish(null), 12000);
      const img = new Image();
      img.onload = () =>
        createImageBitmap(img, { resizeWidth: w, resizeHeight: h, resizeQuality: "high" })
          .then((bmp) => { clearTimeout(timer); finish(bmp); })
          .catch(() => { clearTimeout(timer); finish(null); });
      img.onerror = () => { clearTimeout(timer); finish(null); };
      img.src = `/frames/f${idx}.webp`;
    });
  };

  return Promise.all(Array.from({ length: TOTAL_FRAMES }, (_, i) => settle(i)))
    .then((results) => {
      cachedFrames = results.filter((b): b is ImageBitmap => b !== null);
      return cachedFrames;
    })
    .finally(() => {
      cacheLoading = false;
    });
}

export default function DraggableVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const currentFrame = useRef(0);
  const fractional = useRef(0);
  const dragging = useRef(false);
  // Holds the touch-start position until we know the gesture's direction, so we
  // can let vertical swipes scroll the page instead of capturing them as a drag.
  const pending = useRef<{ x: number; y: number; id: number } | null>(null);
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
    pending.current = null;
    if (!dragging.current) return;
    dragging.current = false;
    if (cachedFrames.length) {
      Math.abs(velocity.current) > MIN_VELOCITY ? startMomentum() : startLoop();
    }
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

  // ── pause the idle-spin while the hero is scrolled offscreen ───────────────
  // Redrawing the canvas ~24x/sec for an invisible hero wastes the main thread
  // and competes with scroll on mobile. (Same IntersectionObserver pattern as
  // NavbarScroll.) The WebGL background keeps running — it's the full-page bg.
  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting) {
          if (!dragging.current && cachedFrames.length) startLoop();
        } else {
          cancelAnimationFrame(rafId.current);
        }
      },
      { threshold: 0, rootMargin: "100px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [startLoop, canvasReady]);

  const canvasCallback = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    if (node) {
      const { w, h } = getFrameSize();
      node.width = w;
      node.height = h;
      ctxRef.current = node.getContext("2d", { alpha: true });
    } else {
      ctxRef.current = null;
    }
  }, []);

  // ── load orchestration ────────────────────────────────────
  // The hero is the transparent poster image (tiny, instant, no codec/autoplay
  // pitfalls) until the 252 rotate-frames decode and the interactive canvas
  // takes over. There is NO <video> — it was the source of the blank/slow hero
  // on Safari (HEVC-alpha, 12.6MB, flaky autoplay). The frame decode is deferred
  // until the preloader reveals so it doesn't starve the bar / first paint.
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    sens.current = isMobile ? 0.3 : 0.4;
    let cancelled = false;

    const markReady = () => {
      (window as Window & { __heroReady?: boolean }).__heroReady = true;
      window.dispatchEvent(new Event("hero-ready"));
    };

    const showCanvas = () => {
      fractional.current = 0;
      draw(0); // paint frame 0 BEFORE the canvas becomes visible (no swap flash)
      setCanvasReady(true);
      startLoop();
    };

    const beginFrames = () => {
      if (cancelled) return;
      if (cachedFrames.length) {
        showCanvas();
        return;
      }
      const decode = () =>
        loadFrames().then(() => {
          if (cancelled || cachedFrames.length < TOTAL_FRAMES * 0.8) return;
          showCanvas();
        });
      // Wait until the preloader has revealed so the 252-frame decode doesn't
      // starve its progress bar; cap the wait so the canvas never stalls.
      const flags = window as Window & { __preloaderGone?: boolean };
      if (flags.__preloaderGone) {
        decode();
        return;
      }
      let waited = 0;
      const iv = setInterval(() => {
        if (cancelled) {
          clearInterval(iv);
          return;
        }
        waited += 60;
        if (flags.__preloaderGone || waited >= 4000) {
          clearInterval(iv);
          decode();
        }
      }, 60);
    };

    // Frames already decoded this session → straight to canvas.
    if (cachedFrames.length) {
      markReady();
      showCanvas();
      return () => {
        cancelled = true;
        cancelAnimationFrame(rafId.current);
      };
    }

    // Reveal once the poster is loaded → the preloader lifts on a real (static)
    // transparent Game Boy, never a blank box.
    const poster = new Image();
    const onReady = () => {
      if (cancelled) return;
      markReady();
      beginFrames();
    };
    poster.onload = onReady;
    poster.onerror = onReady;
    poster.src = "/hero-poster.webp";
    const fallback = setTimeout(onReady, 2500);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      cancelAnimationFrame(rafId.current);
    };
  }, [draw, startLoop]);

  // ── pointer handlers ──────────────────────────────────────
  // Directional lock: on touchdown we only REMEMBER the start point — we do NOT
  // capture the pointer or start dragging yet. We wait for the first move to
  // decide intent: a mostly-vertical swipe is left to the browser so the page
  // scrolls (capturing it on touchdown is what made iOS Safari refuse to scroll
  // when your finger landed on the Game Boy); a mostly-horizontal drag rotates.
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only allow rotating once frames are loaded. Dragging during the video
    // phase scrubs the still-buffering hero video and blanks it out.
    if (!cachedFrames.length) return;
    pending.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    // Resolve gesture direction before committing to a rotate.
    if (pending.current && !dragging.current) {
      const adx = Math.abs(e.clientX - pending.current.x);
      const ady = Math.abs(e.clientY - pending.current.y);
      if (adx < 8 && ady < 8) return; // below intent threshold — wait
      if (ady > adx) {
        // vertical intent → let the browser scroll the page; abandon this gesture
        pending.current = null;
        return;
      }
      // horizontal intent → begin rotating (and capture so the drag is smooth)
      dragging.current = true;
      lastX.current = e.clientX;
      lastMoveTime.current = performance.now();
      velocity.current = 0;
      cancelAnimationFrame(rafId.current);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(pending.current.id);
      } catch {}
      pending.current = null;
    }

    if (!dragging.current || !cachedFrames.length) return;
    const now = performance.now();
    const dx = e.clientX - lastX.current;
    const dt = now - lastMoveTime.current;
    lastX.current = e.clientX;
    lastMoveTime.current = now;

    if (dt > 0) velocity.current = (dx * sens.current) / dt;
    const total = cachedFrames.length;
    fractional.current = wrap(fractional.current + dx * sens.current, total);
    draw(Math.floor(fractional.current));
  }, [draw]);

  const onPointerUp = useCallback(() => releaseDrag(), [releaseDrag]);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-hidden
      className="pointer-events-auto cursor-grab active:cursor-grabbing touch-pan-y select-none"
    >
      {/* transparent Game Boy poster — instant hero until the canvas takes over */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-poster.webp"
        alt=""
        draggable={false}
        className={`w-[82vw] max-w-[380px] md:w-[460px] md:max-w-none ${canvasReady ? "hidden" : ""}`}
      />

      <canvas
        ref={canvasCallback}
        className={`w-[82vw] max-w-[380px] md:w-[460px] md:max-w-none ${canvasReady ? "" : "hidden"}`}
      />
    </div>
  );
}
