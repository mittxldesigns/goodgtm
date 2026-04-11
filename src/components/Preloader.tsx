"use client";

import { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
const DURATION = 1800; // Total preloader duration in ms

export default function Preloader() {
  const [phase, setPhase] = useState<"boot" | "split" | "gone">("gone");
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);
  const lineRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);
  const lastScramble = useRef(0);

  // Only show preloader on first visit this session
  useEffect(() => {
    const seen = sessionStorage.getItem("gtm-preloader-seen");
    if (!seen) {
      sessionStorage.setItem("gtm-preloader-seen", "1");
      setPhase("boot");
    }
  }, []);

  useEffect(() => {
    if (phase !== "boot") return;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const raw = Math.min(elapsed / DURATION, 1);
      const val = Math.round(raw * raw * (3 - 2 * raw) * 100); // smoothstep

      if (lineRef.current) lineRef.current.style.width = `${val}%`;
      if (numRef.current) {
        numRef.current.textContent = String(val).padStart(3, "0");
        numRef.current.style.color = val > 75 ? "#e065e888" : "#ffffff20";
      }
      if (textRef.current && now - lastScramble.current > 60) {
        lastScramble.current = now;
        textRef.current.textContent = val >= 100
          ? "G T M"
          : Array.from({ length: 3 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join(" ");
      }

      if (val >= 100) {
        setTimeout(() => setPhase("split"), 120);
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
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
