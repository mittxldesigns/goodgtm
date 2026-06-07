"use client";

import { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
const FILL_MS = 1400; // ease the bar toward ~92% over this time
const MIN_SHOW = 700; // never flash shorter than this
const MAX_WAIT = 7000; // hard cap so it can never hang

export default function Preloader() {
  // Default to "boot" so the cover exists on the very first paint (SSR included) —
  // otherwise the unready WebGL/Game Boy canvas flashes before the loader appears.
  const [phase, setPhase] = useState<"boot" | "split" | "gone">("boot");
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const readyRef = useRef(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const lastScramble = useRef(0);

  // Skip the preloader on repeat visits within the session.
  useEffect(() => {
    if (sessionStorage.getItem("gtm-preloader-seen")) {
      setPhase("gone");
    } else {
      sessionStorage.setItem("gtm-preloader-seen", "1");
    }
  }, []);

  useEffect(() => {
    if (phase !== "boot") return;
    startRef.current = performance.now();
    readyRef.current = document.readyState === "complete";

    // The hero (DraggableVideo) fires this once its frames are decoded.
    const onReady = () => { readyRef.current = true; };
    window.addEventListener("hero-ready", onReady);
    window.addEventListener("load", onReady);

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const ready = readyRef.current || elapsed >= MAX_WAIT;

      // Smoothstep toward 92%; only allow the final 100% once the hero is ready.
      const t = Math.min(elapsed / FILL_MS, 1);
      const eased = t * t * (3 - 2 * t);
      const val = Math.round(Math.min(eased, ready ? 1 : 0.92) * 100);

      if (lineRef.current) lineRef.current.style.width = `${val}%`;
      if (numRef.current) {
        numRef.current.textContent = String(val).padStart(3, "0");
        numRef.current.style.color = val > 75 ? "#e065e888" : "#ffffff20";
      }
      if (textRef.current && now - lastScramble.current > 60) {
        lastScramble.current = now;
        textRef.current.textContent =
          val >= 100
            ? "G T M"
            : Array.from({ length: 3 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join(" ");
      }

      // Split away only when the bar is full, the hero is ready, and we've shown
      // for at least MIN_SHOW (so it never flickers).
      if (val >= 100 && ready && elapsed >= MIN_SHOW) {
        setTimeout(() => setPhase("split"), 120);
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("hero-ready", onReady);
      window.removeEventListener("load", onReady);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "split") {
      const t = setTimeout(() => setPhase("gone"), 550);
      return () => clearTimeout(t);
    }
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
          <div ref={textRef} className="text-[11px] font-mono tracking-[0.5em] text-white/25 w-[80px] text-center">
            · · ·
          </div>
          <div className="w-[60px] h-px bg-white/[0.06] overflow-hidden rounded-full">
            <div ref={lineRef} className="h-full rounded-full" style={{
              width: "0%",
              background: "linear-gradient(90deg, #e065e855, #e065e8aa)",
              willChange: "width",
            }} />
          </div>
          <div ref={numRef} className="text-[9px] font-mono tracking-[0.3em] text-white/[0.12]" style={{ fontVariantNumeric: "tabular-nums" }}>
            000
          </div>
        </div>
      </div>

      {phase === "boot" && (
        <div className="fixed left-0 right-0 z-[62] h-px pointer-events-none" style={{
          background: "linear-gradient(90deg, transparent 10%, #e065e822 30%, #ffffff0a 50%, #e065e822 70%, transparent 90%)",
          boxShadow: "0 0 15px 1px #e065e808",
          animation: "scanline 1.6s ease-in-out infinite",
        }} />
      )}

      <style jsx>{`
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </>
  );
}
