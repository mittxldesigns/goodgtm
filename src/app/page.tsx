"use client";

import { useRef, useState } from "react";
import WebGLBlob, { ShaderConfig, DEFAULT_CONFIG, GpuInfo } from "@/components/WebGLBlob";
import CornerBrackets from "@/components/CornerBrackets";
import NavbarScroll from "@/components/NavbarScroll";
import Preloader from "@/components/Preloader";
import PixelButton from "@/components/PixelButton";
import DraggableVideo from "@/components/DraggableVideo";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import SectionModal from "@/components/SectionModal";
import DebugPanel from "@/components/DebugPanel";

export default function Home() {
  // clone so WebGLBlob writing the device quality tier doesn't mutate the shared module default
  const configRef = useRef<ShaderConfig>({ ...DEFAULT_CONFIG });
  const fpsRef = useRef(0);
  const gpuInfoRef = useRef<GpuInfo>({ renderer: "", resolution: [0, 0] });

  // Single-screen hero. START + nav open the content as a black popup — there
  // are no scroll-to sections anymore (Nate: "i want it to just be this").
  const [modal, setModal] = useState<null | "about" | "services">(null);

  return (
    <>
      <Preloader />

      {/* Persistent WebGL background */}
      <WebGLBlob configRef={configRef} fpsRef={fpsRef} gpuInfoRef={gpuInfoRef} />

      {/* Perf diagnostics — only renders when the URL hash is #debug */}
      <DebugPanel configRef={configRef} fpsRef={fpsRef} gpuInfoRef={gpuInfoRef} />

      {/* Persistent logo */}
      <NavbarScroll />

      {/* The whole page is the hero — one screen, no scrolling. */}
      <main id="hero" className="relative min-h-[100svh] w-full overflow-hidden">
        {/* Four-corner bounding box */}
        <CornerBrackets />

        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 pointer-events-none"
          style={{ paddingTop: "5vh" }}
        >
          <DraggableVideo />
          <PixelButton onClick={() => setModal("about")} />
        </div>

        {/* Tagline */}
        <div className="absolute bottom-[80px] left-0 right-0 z-30 flex justify-center">
          <p className="text-[10px] font-light tracking-[0.25em] uppercase text-white/40">
            Go-to-market infrastructure for startups
          </p>
        </div>

        {/* Nav — opens the content popups */}
        <nav
          className="absolute bottom-0 left-0 z-50 flex items-center gap-5"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
            paddingLeft: "calc(env(safe-area-inset-left) + 2rem)",
          }}
        >
          <button
            onClick={() => setModal("about")}
            className="text-[10px] font-normal tracking-[0.2em] uppercase text-white/50 hover:text-white/90 transition-colors duration-200 cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => setModal("services")}
            className="text-[10px] font-normal tracking-[0.2em] uppercase text-white/50 hover:text-white/90 transition-colors duration-200 cursor-pointer"
          >
            Services
          </button>
        </nav>

        {/* Location */}
        <div
          className="absolute bottom-0 right-0 z-40 pointer-events-none"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
            paddingRight: "calc(env(safe-area-inset-right) + 2.5rem)",
          }}
        >
          <span className="text-[10px] font-light tracking-[0.2em] uppercase text-white/35">
            NYC
          </span>
        </div>
      </main>

      {/* Black popup — START / About / Services content */}
      {modal && (
        <SectionModal onClose={() => setModal(null)}>
          {modal === "about" ? <AboutSection /> : <ServicesSection />}
        </SectionModal>
      )}
    </>
  );
}
