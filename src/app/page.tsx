"use client";

import { useRef, useEffect } from "react";
import WebGLBlob, { ShaderConfig, DEFAULT_CONFIG, GpuInfo } from "@/components/WebGLBlob";
import CornerBrackets from "@/components/CornerBrackets";
import NavbarScroll from "@/components/NavbarScroll";
import Preloader from "@/components/Preloader";
import PixelButton from "@/components/PixelButton";
import DraggableVideo from "@/components/DraggableVideo";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import DebugPanel from "@/components/DebugPanel";

export default function Home() {
  // clone so WebGLBlob writing the device quality tier doesn't mutate the shared module default
  const configRef = useRef<ShaderConfig>({ ...DEFAULT_CONFIG });
  const fpsRef = useRef(0);
  const gpuInfoRef = useRef<GpuInfo>({ renderer: "", resolution: [0, 0] });

  const scrollToAbout = () =>
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Support deep links like /#about (and redirects from /about) — jump to the section on load.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    requestAnimationFrame(() => {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      target.scrollIntoView({ block: "start" });
      root.style.scrollBehavior = prev;
    });
  }, []);

  return (
    <>
      <Preloader />

      {/* Persistent WebGL background — fixed, spans every section */}
      <WebGLBlob configRef={configRef} fpsRef={fpsRef} gpuInfoRef={gpuInfoRef} />

      {/* Perf diagnostics — only renders when the URL hash is #debug */}
      <DebugPanel configRef={configRef} fpsRef={fpsRef} gpuInfoRef={gpuInfoRef} />

      {/* Global chrome */}
      <NavbarScroll />

      {/* Location — bottom right (clear of the iOS home indicator) */}
      <div
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
          paddingRight: "calc(env(safe-area-inset-right) + 2.5rem)",
        }}
        className="fixed bottom-0 right-0 z-40 pointer-events-none"
      >
        <span className="text-[10px] font-light tracking-[0.2em] uppercase text-white/35">
          NYC
        </span>
      </div>

      {/* Sections — the document itself scrolls (native, trackpad-friendly) */}
      <main className="w-full">
        {/* Section 1 — Hero */}
        <section id="hero" className="relative min-h-[100svh] w-full overflow-hidden">
          {/* Four-corner bounding box — hero only (scrolls away with the section) */}
          <CornerBrackets />

          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 pointer-events-none"
            style={{ paddingTop: "5vh" }}
          >
            <DraggableVideo />
            <PixelButton onClick={scrollToAbout} />
          </div>

          {/* Tagline */}
          <div className="absolute bottom-[80px] left-0 right-0 z-30 flex justify-center">
            <p className="text-[10px] font-light tracking-[0.25em] uppercase text-white/40">
              Go-to-market infrastructure for startups
            </p>
          </div>
        </section>

        {/* Section 2 — About — transparent so the fixed WebGL background shows
            through here too (continuous animated bg across every section) */}
        <section id="about" className="relative z-10 min-h-[100svh] w-full">
          <AboutSection />
        </section>

        {/* Section 3 — Services — transparent, same animated bg shows through */}
        <section id="services" className="relative z-10 min-h-[100svh] w-full">
          <ServicesSection />
        </section>
      </main>
    </>
  );
}
