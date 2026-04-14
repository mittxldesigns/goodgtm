"use client";

import { useRef } from "react";
import WebGLBlob, { ShaderConfig, DEFAULT_CONFIG, GpuInfo } from "@/components/WebGLBlob";
import CornerBrackets from "@/components/CornerBrackets";
import Navbar from "@/components/Navbar";
import Preloader from "@/components/Preloader";
import PixelButton from "@/components/PixelButton";
import DraggableVideo from "@/components/DraggableVideo";

export default function NewPageRoute() {
  const configRef = useRef<ShaderConfig>(DEFAULT_CONFIG);
  const fpsRef = useRef(0);
  const gpuInfoRef = useRef<GpuInfo>({ renderer: "", resolution: [0, 0] });

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0f0f0f]">
      <Preloader />

      <WebGLBlob configRef={configRef} fpsRef={fpsRef} gpuInfoRef={gpuInfoRef} />
      <CornerBrackets />
      <Navbar />

      {/* Hero video + CTA — centered stack */}
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-4 pointer-events-none" style={{ paddingTop: "5vh" }}>
        <DraggableVideo />
        <PixelButton />
      </div>

      {/* Tagline */}
      <div className="fixed bottom-[80px] left-0 right-0 z-30 flex justify-center">
        <p className="text-[10px] font-light tracking-[0.25em] uppercase text-white/40">
          Go-to-market infrastructure for startups
        </p>
      </div>

      {/* Location — bottom right */}
      <div className="fixed bottom-0 right-0 z-40 pb-8 pr-10">
        <span className="text-[10px] font-light tracking-[0.2em] uppercase text-white/35">
          NYC
        </span>
      </div>
    </div>
  );
}
