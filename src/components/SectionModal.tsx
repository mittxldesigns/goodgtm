"use client";

import { useEffect } from "react";

/**
 * Black popup overlay (the START / nav "About" + "Services" content).
 * Mounted ONLY while open (page.tsx renders it conditionally), so when closed
 * it is fully out of the DOM — no persistent fixed overlay to capture touch or
 * block scroll on iOS. The animated WebGL background shows faintly through the
 * semi-transparent backdrop + card, matching the textured look Nate wants.
 */
export default function SectionModal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      onClick={onClose}
      style={{
        background: "rgba(0,0,0,0.72)",
        paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)",
      }}
    >
      <div
        className="relative w-full max-w-xl max-h-[82svh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0c0e]/85 px-7 py-10 md:px-10 md:py-12"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-sm leading-none">✕</span>
        </button>
        {children}
      </div>
    </div>
  );
}
