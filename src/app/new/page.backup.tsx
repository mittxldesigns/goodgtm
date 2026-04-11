"use client";

import { useRef } from "react";
import Link from "next/link";
import WebGLBlob, { ShaderConfig, DEFAULT_CONFIG, GpuInfo } from "@/components/WebGLBlob";
import CornerBrackets from "@/components/CornerBrackets";
import DebugPanel from "@/components/DebugPanel";

export default function NewPage() {
  const configRef = useRef<ShaderConfig>(DEFAULT_CONFIG);
  const fpsRef = useRef(0);
  const gpuInfoRef = useRef<GpuInfo>({ renderer: "", resolution: [0, 0] });

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0f0f0f]">
      <WebGLBlob configRef={configRef} fpsRef={fpsRef} gpuInfoRef={gpuInfoRef} />
      <CornerBrackets />
      <DebugPanel configRef={configRef} fpsRef={fpsRef} gpuInfoRef={gpuInfoRef} />

      {/* Hero video — centered, blend away dark background */}
      <div className="fixed inset-0 z-10 flex items-center justify-center pointer-events-none">
        <video
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-[320px] md:w-[400px]"
          style={{
            mixBlendMode: "screen",
            filter: "brightness(1.2) contrast(1.3)",
            maskImage: "radial-gradient(ellipse 85% 85% at center, black 50%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 85% at center, black 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Brand — top center */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-10">
        <h1 className="text-[13px] font-normal tracking-[0.4em] uppercase text-white/85">
          Good<span className="text-[#e065e8]">GTM</span>
        </h1>
      </div>

      {/* Tagline */}
      <div className="fixed bottom-[110px] left-0 right-0 z-30 flex justify-center">
        <p className="text-[10px] font-light tracking-[0.25em] uppercase text-white/40">
          Go-to-market infrastructure for startups
        </p>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between pb-8 px-10">
        <nav className="flex items-center">
          {["About", "Services", "Contact"].map((item, i) => (
            <span key={item} className="flex items-center">
              {i > 0 && (
                <span className="mx-3 text-[9px] text-white/20">·</span>
              )}
              <Link
                href={`/${item.toLowerCase()}`}
                className="text-[10px] font-normal tracking-[0.2em] uppercase text-white/55 hover:text-white/90 transition-colors duration-300"
              >
                {item}
              </Link>
            </span>
          ))}
        </nav>
        <span className="text-[10px] font-light tracking-[0.2em] uppercase text-white/35">
          Florida
        </span>
      </div>
    </div>
  );
}
