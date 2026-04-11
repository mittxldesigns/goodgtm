"use client";

import CornerBrackets from "@/components/CornerBrackets";
import DitherOverlay from "@/components/DitherOverlay";
import BottomNav from "@/components/BottomNav";
import Logo3D from "@/components/Logo3D";

export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      {/* Dithered atmospheric overlay */}
      <DitherOverlay />

      {/* Corner bracket framing */}
      <CornerBrackets />

      {/* 3D centerpiece */}
      <Logo3D />

      {/* Brand name - top center */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-8">
        <h1
          className="text-[14px] font-medium tracking-[0.35em] uppercase"
          style={{ textShadow: "0 0 20px rgba(0,0,0,0.9)" }}
        >
          <span className="text-white/90">Good</span>
          <span className="text-[#fa76ff]">GTM</span>
        </h1>
      </div>

      {/* Tagline - below center */}
      <div className="fixed bottom-[100px] left-0 right-0 z-30 flex justify-center">
        <p
          className="text-[11px] font-light tracking-[0.2em] uppercase text-white/50"
          style={{ textShadow: "0 0 15px rgba(0,0,0,0.9)" }}
        >
          Go-to-market infrastructure for startups
        </p>
      </div>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
