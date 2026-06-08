"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const CALENDLY_URL = "https://calendly.com/nate-goodgtm/30min";

const CalendlyContext = createContext<{ open: () => void }>({ open: () => {} });

export function useCalendly() {
  return useContext(CalendlyContext);
}

export function CalendlyProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Start preloading the iframe after a short delay (don't block first paint)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Mount on demand too, so a tap before the 1.5s preload still opens instantly
  // (otherwise the click sets visible=true but the iframe isn't in the DOM yet).
  const open = useCallback(() => {
    setMounted(true);
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);

  return (
    <CalendlyContext.Provider value={{ open }}>
      {children}

      {/* Preloaded iframe — always in DOM once mounted, shown/hidden via display.
          display:none (not just opacity:0) so the full-screen fixed overlay and
          its Calendly iframe fully leave the render/hit-test tree when closed.
          On mobile (esp. iOS Safari) a persistent fixed overlay + iframe keeps
          capturing touch/scroll even at opacity:0, leaving the page unscrollable
          after closing the popup. display:none does NOT reload the iframe, so it
          stays preloaded/warm for instant reopen. */}
      {mounted && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            display: visible ? "flex" : "none",
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
            style={{
              transition: "opacity 0.3s ease",
            }}
          />

          {/* Modal */}
          <div
            className="relative w-[90vw] max-w-[480px] h-[85dvh] max-h-[700px] rounded-xl overflow-hidden"
            style={{
              transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(12px)",
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(224,101,232,0.08)",
            }}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <span className="text-white/70 text-sm leading-none">✕</span>
            </button>

            <iframe
              src={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=1a1a1a&text_color=ffffff&primary_color=e065e8`}
              className="w-full h-full border-0"
              title="Schedule a call"
            />
          </div>
        </div>
      )}
    </CalendlyContext.Provider>
  );
}
