"use client";

import { useState, useEffect } from "react";

// MIN: let the bar fill gracefully. MAX: hard cap so we never hang if the hero
// never signals ready. Reveal once the bar is full AND the hero is ready, so the
// curtain lifts on a fully-loaded scene instead of a half-painted one.
// MIN must stay in sync with the pl-fill / pl-count durations in globals.css.
const MIN = 1400;
const MAX = 3200;
const SPLIT = 520;

export default function Preloader() {
  // Default "boot" so the cover is in the SSR / first paint (no blank flash).
  const [phase, setPhase] = useState<"boot" | "split" | "gone">("boot");

  useEffect(() => {
    // Show only on the first visit this session.
    if (sessionStorage.getItem("gtm-preloader-seen")) {
      setPhase("gone");
      return;
    }
    sessionStorage.setItem("gtm-preloader-seen", "1");

    const start = performance.now();
    const ready = () =>
      (window as Window & { __heroReady?: boolean }).__heroReady === true;

    let raf = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setPhase("split");
    };
    const tick = () => {
      if (done) return;
      if (performance.now() - start >= MIN && ready()) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Hard cap — guarantees the reveal even if rAF is throttled (background tab)
    // or the hero never signals ready.
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
              className="pl-bar h-full w-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #e065e855, #e065e8)",
                boxShadow: "0 0 8px #e065e866",
                willChange: "transform",
              }}
            />
          </div>
          <div
            className="pl-num text-[9px] font-mono tracking-[0.3em] text-white/35"
            style={{ fontVariantNumeric: "tabular-nums" }}
          />
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
