"use client";

import { useState, useEffect, useRef } from "react";

const MIN = 1100; // minimum cover time so the bar has room to read as "loading"
const MAX = 9000; // hard cap — never hang, even on a slow first load
const SPLIT = 520;

export default function Preloader() {
  // Default "boot" so the cover is in the SSR / first paint (no blank flash).
  const [phase, setPhase] = useState<"boot" | "split" | "gone">("boot");
  const barRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const flags = window as Window & { __preloaderGone?: boolean };

    // Show only on the first visit this session.
    if (sessionStorage.getItem("gtm-preloader-seen")) {
      flags.__preloaderGone = true;
      setPhase("gone");
      return;
    }
    sessionStorage.setItem("gtm-preloader-seen", "1");

    const start = performance.now();
    const ready = () =>
      (window as Window & { __heroReady?: boolean }).__heroReady === true;

    // Real progress, driven imperatively (no React re-render per frame). The
    // frame decode is deferred (DraggableVideo) so the main thread is free here
    // and this rAF easing stays smooth instead of snapping. The bar eases toward
    // 0.9 while the hero loads, then completes to 1.0 once it can show its video.
    let progress = 0;
    let raf = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      // Signal the hero it's safe to decode the heavy frames now (the bar has
      // finished animating, so the decode won't starve it).
      flags.__preloaderGone = true;
      setPhase("split");
    };
    const tick = () => {
      if (done) return;
      const el = performance.now() - start;
      const target = ready() ? 1 : 0.9;
      progress += (target - progress) * 0.045;
      if (target === 1 && progress > 0.997) progress = 1;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      if (numRef.current) numRef.current.textContent = `${Math.round(progress * 100)}%`;
      if ((progress >= 1 && el >= MIN) || el >= MAX) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Reveal floor — fires even if rAF is paused (background tab).
    const cap = setTimeout(finish, MAX);
    return () => {
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(cap);
    };
  }, []);

  useEffect(() => {
    if (phase !== "split") return;
    const t = setTimeout(() => setPhase("gone"), SPLIT);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;
  const isSplit = phase === "split";

  const curtain = {
    transition: "transform 0.52s cubic-bezier(0.76, 0, 0.24, 1)",
    willChange: "transform",
  } as const;

  return (
    <>
      {/* split curtains */}
      <div
        className="fixed inset-0 z-[60] bg-[#0d0d0f]"
        style={{
          clipPath: "inset(0 0 50% 0)",
          transform: isSplit ? "translateY(-100%)" : "translateY(0)",
          ...curtain,
        }}
      />
      <div
        className="fixed inset-0 z-[60] bg-[#0d0d0f]"
        style={{
          clipPath: "inset(50% 0 0 0)",
          transform: isSplit ? "translateY(100%)" : "translateY(0)",
          ...curtain,
        }}
      />

      {/* centre mark + bar + counter */}
      <div
        className="fixed inset-0 z-[61] flex items-center justify-center pointer-events-none"
        style={{
          opacity: isSplit ? 0 : 1,
          transform: isSplit ? "scale(1.04)" : "scale(1)",
          transition: "opacity 0.25s ease, transform 0.45s cubic-bezier(0.76,0,0.24,1)",
        }}
      >
        <div className="flex flex-col items-center gap-3.5">
          <div className="text-[11px] font-mono tracking-[0.42em] text-white/40">
            good<span className="text-[#e065e8]/75">gtm</span>
          </div>
          <div className="w-[72px] h-px bg-white/[0.07] overflow-hidden rounded-full">
            <div
              ref={barRef}
              className="h-full w-full rounded-full"
              style={{
                transformOrigin: "left center",
                transform: "scaleX(0)",
                background: "linear-gradient(90deg, #e065e855, #e065e8)",
                boxShadow: "0 0 8px #e065e866",
                willChange: "transform",
              }}
            />
          </div>
          <div
            ref={numRef}
            className="text-[9px] font-mono tracking-[0.3em] text-white/35"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            0%
          </div>
        </div>
      </div>

      {/* scanline */}
      {!isSplit && (
        <div
          className="fixed left-0 right-0 z-[62] h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 10%, #e065e822 30%, #ffffff0a 50%, #e065e822 70%, transparent 90%)",
            boxShadow: "0 0 15px 1px #e065e808",
            animation: "pl-scanline 1.6s ease-in-out infinite",
          }}
        />
      )}
    </>
  );
}
