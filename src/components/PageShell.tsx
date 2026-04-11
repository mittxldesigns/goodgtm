"use client";

import CornerBrackets from "./CornerBrackets";
import Navbar from "./Navbar";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0a0a]">
      <CornerBrackets />
      <Navbar />

      {/* Content */}
      <div className="relative z-30 flex h-full items-center justify-center px-10 pt-16">
        <div className="max-w-2xl w-full">{children}</div>
      </div>

      {/* Location */}
      <div className="fixed bottom-0 right-0 z-40 pb-8 pr-10">
        <span className="text-[11px] font-light tracking-[0.18em] uppercase text-white/50">
          NYC
        </span>
      </div>
    </div>
  );
}
