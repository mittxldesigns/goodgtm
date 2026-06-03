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

export default function NewLanding() {
  const configRef = useRef<ShaderConfig>(DEFAULT_CONFIG);
  const fpsRef = useRef(0);
  const gpuInfoRef = useRef<GpuInfo>({ renderer: "", resolution: [0, 0] });

  const scrollToAbout = () =>
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Support deep links like /new#about — jump straight to the section on load.
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

      {/* Global chrome */}
      <CornerBrackets />
      <NavbarScroll />

      {/* Location — bottom right, persists across sections */}
      <div className="fixed bottom-0 right-0 z-40 pb-8 pr-10 pointer-events-none">
        <span className="text-[10px] font-light tracking-[0.2em] uppercase text-white/35">
          NYC
        </span>
      </div>

      {/* Sections — the document itself scrolls (native, trackpad-friendly) */}
      <main className="w-full">
        {/* Section 1 — Hero */}
        <section
          id="hero"
          className="relative h-screen w-full overflow-hidden"
        >
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

        {/* Section 2 — About */}
        <section
          id="about"
          className="relative z-10 h-screen w-full bg-[#0a0a0a]"
        >
          <AboutSection />
        </section>

        {/* Section 3 — Services */}
        <section
          id="services"
          className="relative z-10 h-screen w-full bg-[#0a0a0a]"
        >
          <ServicesSection />
        </section>
      </main>
    </>
  );
}
