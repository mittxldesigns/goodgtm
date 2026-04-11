"use client";

import { useCalendly } from "./CalendlyModal";

export default function PixelButton() {
  const { open } = useCalendly();

  return (
    <button
      onClick={open}
      className="group relative inline-block pointer-events-auto cursor-pointer"
    >
      <div
        className="relative px-5 py-2 transition-transform duration-150 group-hover:scale-105 group-active:scale-95"
        style={{
          background: "#d946ef",
          clipPath: `polygon(
            4px 0%, calc(100% - 4px) 0%,
            100% 4px, 100% calc(100% - 4px),
            calc(100% - 4px) 100%, 4px 100%,
            0% calc(100% - 4px), 0% 4px
          )`,
        }}
      >
        <div
          className="absolute inset-[3px]"
          style={{
            background: "linear-gradient(180deg, #f5d0fe, #e8b4f8)",
            clipPath: `polygon(
              3px 0%, calc(100% - 3px) 0%,
              100% 3px, 100% calc(100% - 3px),
              calc(100% - 3px) 100%, 3px 100%,
              0% calc(100% - 3px), 0% 3px
            )`,
          }}
        />
        <span
          className="relative z-10 block text-center"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "7px",
            color: "#c026d3",
            letterSpacing: "2px",
            textShadow: "1px 1px 0px #f0abfc44",
            imageRendering: "pixelated",
          }}
        >
          START
        </span>
      </div>
      <div
        className="absolute top-[3px] left-[3px] -z-10 w-full h-full opacity-30 group-hover:opacity-50 transition-opacity duration-150"
        style={{
          background: "#a855f7",
          clipPath: `polygon(
            4px 0%, calc(100% - 4px) 0%,
            100% 4px, 100% calc(100% - 4px),
            calc(100% - 4px) 100%, 4px 100%,
            0% calc(100% - 4px), 0% 4px
          )`,
        }}
      />
    </button>
  );
}
