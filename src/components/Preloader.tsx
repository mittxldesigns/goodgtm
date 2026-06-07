"use client";

import { useState, useEffect } from "react";

const DURATION = 1300; // keep in sync with pl-fill / pl-count in globals.css

export default function Preloader() {
  // Default "boot" so the cover is in the SSR / first paint (no blank-canvas flash).
  const [phase, setPhase] = useState<"boot" | "split" | "gone">("boot");

  useEffect(() => {
    // Show only on the first visit this session.
    if (sessionStorage.getItem("gtm-preloader-seen")) {
      setPhase("gone");
      return;
    }
    sessionStorage.setItem("gtm-preloader-seen", "1");
    // Fixed, short window. The bar + number animate via CSS (compositor), so
    // they stay smooth even while the main thread decodes the hero frames.
    const t = setTimeout(() => setPhase("split"), DURATION);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "split") return;
    const t = setTimeout(() => setPhase("gone"), 550);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;
  const isSplit = phase === "split";

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-[#0f0f0f]" style={{
        clipPath: "inset(0 0 50% 0)",
        transform: isSplit ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.45s cubic-bezier(0.7, 0, 0.3, 1)",
        willChange: "transform",
      }} />
      <div className="fixed inset-0 z-[60] bg-[#0f0f0f]" style={{
        clipPath: "inset(50% 0 0 0)",
        transform: isSplit ? "translateY(100%)" : "translateY(0)",
        transition: "transform 0.45s cubic-bezier(0.7, 0, 0.3, 1)",
        willChange: "transform",
      }} />

      <div className="fixed inset-0 z-[61] flex items-center justify-center pointer-events-none" style={{
        opacity: isSplit ? 0 : 1,
        transition: "opacity 0.15s ease",
      }}>
        <div className="flex flex-col items-center gap-3">
          <div className="text-[11px] font-mono tracking-[0.5em] text-white/30 w-[80px] text-center">
            G T M
          </div>
          <div className="w-[60px] h-px bg-white/[0.06] overflow-hidden rounded-full">
            <div className="pl-bar h-full w-full rounded-full" style={{
              background: "linear-gradient(90deg, #e065e855, #e065e8aa)",
              willChange: "transform",
            }} />
          </div>
          <div className="pl-num text-[9px] font-mono tracking-[0.3em] text-white/30" style={{ fontVariantNumeric: "tabular-nums" }} />
        </div>
      </div>

      {!isSplit && (
        <div className="fixed left-0 right-0 z-[62] h-px pointer-events-none" style={{
          background: "linear-gradient(90deg, transparent 10%, #e065e822 30%, #ffffff0a 50%, #e065e822 70%, transparent 90%)",
          boxShadow: "0 0 15px 1px #e065e808",
          animation: "pl-scanline 1.6s ease-in-out infinite",
        }} />
      )}
    </>
  );
}
