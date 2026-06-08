"use client";

import { useEffect, useRef, useState, MutableRefObject } from "react";
import { GpuInfo, ShaderConfig, QUALITY } from "./WebGLBlob";
import { framesLoaded } from "./DraggableVideo";

interface Props {
  configRef: MutableRefObject<ShaderConfig>;
  fpsRef: MutableRefObject<number>;
  gpuInfoRef: MutableRefObject<GpuInfo>;
}

interface Metrics {
  webglFps: number;
  rafFps: number;
  frameMs: number;
  renderer: string;
  resolution: [number, number];
  dpr: number;
  deviceMemory: string;
  cores: string;
  frames: string;
  heap: string;
  tier: string;
}

/**
 * Perf HUD — renders ONLY when the URL hash is `#debug` (e.g. goodgtm.com/#debug),
 * so it ships to prod at zero cost. While shown it runs one rAF loop that samples
 * fpsRef/gpuInfoRef and flushes to React state ~3x/sec (no per-frame re-render).
 */
export default function DebugPanel({ configRef, fpsRef, gpuInfoRef }: Props) {
  const [show, setShow] = useState(false);
  const [m, setM] = useState<Metrics | null>(null);
  const refs = useRef({ configRef, fpsRef, gpuInfoRef });
  refs.current = { configRef, fpsRef, gpuInfoRef };

  // Gate on the URL hash.
  useEffect(() => {
    const check = () => setShow(window.location.hash === "#debug");
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  // Sampling loop — only runs while shown. Accumulates in locals, flushes ~3Hz.
  useEffect(() => {
    if (!show) return;
    let raf = 0;
    let frames = 0;
    let deltaSum = 0;
    let last = performance.now();
    let lastFlush = last;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      frames++;
      deltaSum += now - last;
      last = now;
      if (now - lastFlush < 300) return;

      const secs = (now - lastFlush) / 1000;
      const rafFps = Math.round(frames / secs);
      const frameMs = Math.round((deltaSum / frames) * 10) / 10;
      frames = 0;
      deltaSum = 0;
      lastFlush = now;

      const { configRef: cR, fpsRef: fR, gpuInfoRef: gR } = refs.current;
      const nav = navigator as Navigator & { deviceMemory?: number };
      const perfMem = (performance as Performance & {
        memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
      }).memory;
      const fl = framesLoaded();
      const q = cR.current.quality;
      const qv = QUALITY[q];

      setM({
        webglFps: fR.current,
        rafFps,
        frameMs,
        renderer: gR.current.renderer || "n/a",
        resolution: gR.current.resolution,
        dpr: Math.round((window.devicePixelRatio || 1) * 100) / 100,
        deviceMemory: nav.deviceMemory != null ? `${nav.deviceMemory} GB` : "n/a",
        cores: navigator.hardwareConcurrency != null ? String(navigator.hardwareConcurrency) : "n/a",
        frames: `${fl.loaded}/${fl.total}`,
        heap: perfMem
          ? `${(perfMem.usedJSHeapSize / 1048576) | 0}/${(perfMem.totalJSHeapSize / 1048576) | 0} MB`
          : "n/a",
        tier: `${q} · ${qv.fps}fps · ${qv.scale}x · dpr≤${qv.dprCap}`,
      });
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show]);

  if (!show) return null;

  const rows: [string, string][] = m
    ? [
        ["raf fps", String(m.rafFps)],
        ["webgl fps", String(m.webglFps)],
        ["frame ms", String(m.frameMs)],
        ["quality", m.tier],
        ["render res", `${m.resolution[0]}×${m.resolution[1]}`],
        ["dpr", String(m.dpr)],
        ["device mem", m.deviceMemory],
        ["cpu cores", m.cores],
        ["frames", m.frames],
        ["js heap", m.heap],
        ["gpu", m.renderer],
      ]
    : [["", "measuring…"]];

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        zIndex: 200,
        pointerEvents: "none",
        font: "11px/1.5 ui-monospace, 'Roboto Mono', monospace",
        color: "#e065e8",
        background: "rgba(8,8,8,0.82)",
        border: "1px solid rgba(224,101,232,0.35)",
        borderRadius: 6,
        padding: "8px 10px",
        minWidth: 196,
        maxWidth: "80vw",
        letterSpacing: "0.02em",
      }}
    >
      <div style={{ color: "#fff", opacity: 0.55, marginBottom: 4 }}>PERF · #debug</div>
      {rows.map(([k, v]) => (
        <div
          key={k}
          style={{ display: "flex", justifyContent: "space-between", gap: 14 }}
        >
          <span style={{ opacity: 0.6 }}>{k}</span>
          <span style={{ color: "#fff", textAlign: "right", wordBreak: "break-word" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
