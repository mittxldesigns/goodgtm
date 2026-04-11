"use client";

import { useEffect, useState, MutableRefObject } from "react";
import { ShaderConfig, DEFAULT_CONFIG, GpuInfo, BackgroundType, BACKGROUND_LABELS } from "./WebGLBlob";

interface Props {
  configRef: MutableRefObject<ShaderConfig>;
  fpsRef: MutableRefObject<number>;
  gpuInfoRef: MutableRefObject<GpuInfo>;
}

/* ─── URL encoding ─── */
function encodeConfig(cfg: ShaderConfig): string {
  const diff: Record<string, unknown> = {};
  for (const key of Object.keys(DEFAULT_CONFIG) as (keyof ShaderConfig)[]) {
    if (cfg[key] !== DEFAULT_CONFIG[key]) diff[key] = cfg[key];
  }
  return btoa(JSON.stringify(diff));
}

function decodeConfig(seed: string): ShaderConfig | null {
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(atob(seed)) }; }
  catch { return null; }
}

function getInitialConfig(): ShaderConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  const seed = new URLSearchParams(window.location.search).get("debug");
  if (seed) { const d = decodeConfig(seed); if (d) return d; }
  try {
    const s = localStorage.getItem("goodgtm-debug");
    if (s) return { ...DEFAULT_CONFIG, ...JSON.parse(s) };
  } catch {}
  return DEFAULT_CONFIG;
}

/* ─── Sub-components ─── */
function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ opacity: 0.4, fontVariantNumeric: "tabular-nums" }}>{value.toFixed(step < 0.01 ? 3 : 2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", height: 2, appearance: "none", WebkitAppearance: "none",
          background: "rgba(255,255,255,0.12)", outline: "none", borderRadius: 1, cursor: "pointer" }} />
    </div>
  );
}

function Toggle({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
      <span>{label}</span>
      <div onClick={() => onChange(!value)} style={{
        width: 30, height: 16, borderRadius: 8, cursor: "pointer", position: "relative",
        background: value ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)", transition: "background 0.2s",
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: "50%", position: "absolute", top: 2,
          left: value ? 16 : 2, transition: "left 0.15s",
          background: value ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
        }} />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)", marginBottom: 8,
        borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 4,
      }}>{title}</div>
      {children}
    </div>
  );
}

function StatusDot({ level }: { level: "good" | "warn" | "bad" }) {
  const colors = { good: "#4ade80", warn: "#facc15", bad: "#f87171" };
  return <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%",
    background: colors[level], marginLeft: 6, verticalAlign: "middle" }} />;
}

/* ─── Main Panel ─── */
export default function DebugPanel({ configRef, fpsRef, gpuInfoRef }: Props) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ShaderConfig>(getInitialConfig);
  const [fps, setFps] = useState(0);
  const [copied, setCopied] = useState(false);
  const [memMB, setMemMB] = useState(0);
  const [gpuName, setGpuName] = useState("");
  const [res, setRes] = useState<[number, number]>([0, 0]);

  // Hydration-safe: set visibility after mount based on URL
  useEffect(() => {
    configRef.current = config;
    if (new URLSearchParams(window.location.search).has("debug")
      || window.location.pathname.includes("new-debug")) {
      setVisible(true);
    }
  }, []); // eslint-disable-line

  // Keyboard toggle
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "`" || e.key === "~") { e.preventDefault(); setVisible(v => !v); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Polling: FPS, memory, GPU info
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setFps(fpsRef.current);
      if (gpuInfoRef?.current) {
        setGpuName(gpuInfoRef.current.renderer);
        setRes(gpuInfoRef.current.resolution);
      }
      const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
      if (mem) setMemMB(Math.round(mem.usedJSHeapSize / 1024 / 1024));
    }, 500);
    return () => clearInterval(id);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps -- refs are stable

  const update = <K extends keyof ShaderConfig>(key: K, value: ShaderConfig[K]) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    configRef.current = next;
    localStorage.setItem("goodgtm-debug", JSON.stringify(next));
  };

  const reset = () => {
    setConfig(DEFAULT_CONFIG);
    configRef.current = DEFAULT_CONFIG;
    localStorage.removeItem("goodgtm-debug");
    if (window.location.search.includes("debug"))
      window.history.replaceState({}, "", window.location.pathname);
  };

  const copyLink = async () => {
    const seed = encodeConfig(config);
    const url = `${window.location.origin}${window.location.pathname}?debug=${seed}`;
    await navigator.clipboard.writeText(url);
    window.history.replaceState({}, "", `${window.location.pathname}?debug=${seed}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gear button when panel is closed
  if (!visible) {
    return (
      <button onClick={() => setVisible(true)} aria-label="Open debug panel" style={{
        position: "fixed", bottom: 56, right: 16, zIndex: 200,
        width: 32, height: 32, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", pointerEvents: "auto",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </button>
    );
  }

  const fpsLevel: "good" | "warn" | "bad" = fps > 20 ? "good" : fps > 10 ? "warn" : "bad";
  const memLevel: "good" | "warn" | "bad" = memMB < 150 ? "good" : memMB < 300 ? "warn" : "bad";
  const qBtn = (q: ShaderConfig["quality"]) => ({
    flex: 1, padding: "5px 0", cursor: "pointer", fontSize: 9, textTransform: "uppercase" as const,
    letterSpacing: "0.1em", border: "1px solid",
    borderColor: config.quality === q ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
    background: config.quality === q ? "rgba(255,255,255,0.12)" : "transparent",
    color: config.quality === q ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
    transition: "all 0.15s",
  });

  return (
    <div style={{
      position: "fixed", right: 0, top: 0, bottom: 0, width: 270, zIndex: 200,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      padding: "16px 16px 24px", overflowY: "auto", fontFamily: "monospace",
      color: "rgba(255,255,255,0.75)", fontSize: 11, borderLeft: "1px solid rgba(255,255,255,0.06)",
      pointerEvents: "auto",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
          Debug
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontVariantNumeric: "tabular-nums" }}>
            {fps} fps<StatusDot level={fpsLevel} />
          </span>
          <span onClick={() => setVisible(false)} style={{ cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            &times;
          </span>
        </div>
      </div>

      {/* Performance */}
      <Section title="Performance">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", fontSize: 10 }}>
          <span style={{ opacity: 0.4 }}>Resolution</span>
          <span style={{ textAlign: "right" }}>{res[0]}x{res[1]}</span>
          {memMB > 0 && <>
            <span style={{ opacity: 0.4 }}>Memory</span>
            <span style={{ textAlign: "right" }}>{memMB} MB<StatusDot level={memLevel} /></span>
          </>}
          <span style={{ opacity: 0.4 }}>GPU</span>
          <span style={{ textAlign: "right", fontSize: 9, opacity: 0.6, wordBreak: "break-all" }}>
            {gpuName.length > 30 ? gpuName.slice(0, 30) + "…" : gpuName}
          </span>
        </div>
      </Section>

      {/* Background */}
      <Section title="Background">
        <select value={config.backgroundType}
          onChange={e => update("backgroundType", e.target.value as BackgroundType)}
          style={{
            width: "100%", padding: "6px 8px", fontSize: 10, fontFamily: "monospace",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.8)", borderRadius: 2, cursor: "pointer",
            appearance: "none", WebkitAppearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(255,255,255,0.4)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
          }}>
          {(Object.keys(BACKGROUND_LABELS) as BackgroundType[]).map(k => (
            <option key={k} value={k} style={{ background: "#1a1a1a", color: "#ccc" }}>
              {BACKGROUND_LABELS[k]}
            </option>
          ))}
        </select>
      </Section>

      {/* Quality */}
      <Section title="Quality">
        <div style={{ display: "flex", gap: 4 }}>
          {(["low", "medium", "high"] as const).map(q => (
            <button key={q} onClick={() => update("quality", q)} style={qBtn(q)}>{q}</button>
          ))}
        </div>
      </Section>

      {/* Animation */}
      <Section title="Animation">
        <Slider label="Speed" value={config.speed} min={0.1} max={2.0} step={0.05} onChange={v => update("speed", v)} />
      </Section>

      {/* Surface */}
      <Section title="Surface">
        <Slider label="Contrast" value={config.contrast} min={0.5} max={2.0} step={0.05} onChange={v => update("contrast", v)} />
        <Slider label="Glow" value={config.glow} min={0} max={1} step={0.05} onChange={v => update("glow", v)} />
        <Slider label="Warmth" value={config.warmth} min={0} max={1} step={0.05} onChange={v => update("warmth", v)} />
        <Slider label="Bulge" value={config.bulge} min={0} max={1} step={0.05} onChange={v => update("bulge", v)} />
        <Slider label="Normal Detail" value={config.normalDetail} min={0} max={4} step={0.1} onChange={v => update("normalDetail", v)} />
      </Section>

      {/* Post-FX */}
      <Section title="Post-FX">
        <Slider label="Vignette" value={config.vignette} min={0} max={1} step={0.05} onChange={v => update("vignette", v)} />
        <Slider label="Grain" value={config.grain} min={0} max={0.03} step={0.001} onChange={v => update("grain", v)} />
      </Section>

      {/* Halftone */}
      <Section title="Halftone">
        <Slider label="Intensity" value={config.halftone} min={0} max={1} step={0.05} onChange={v => update("halftone", v)} />
        {config.halftone > 0 && (
          <Slider label="Dot Size" value={config.halftoneSize} min={2} max={12} step={0.5} onChange={v => update("halftoneSize", v)} />
        )}
      </Section>

      {/* Overlays */}
      <Section title="Overlays">
        <Toggle label="Orbital Ring" value={config.showRing} onChange={v => update("showRing", v)} />
        <Toggle label="Center Cross" value={config.showCross} onChange={v => update("showCross", v)} />
      </Section>

      {/* Actions */}
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        <button onClick={copyLink} style={{
          flex: 2, padding: "6px 0", cursor: "pointer",
          background: copied ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${copied ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
          color: copied ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)",
          fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 0.15s",
        }}>
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button onClick={reset} style={{
          flex: 1, padding: "6px 0", cursor: "pointer",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: "0.15em",
          textTransform: "uppercase", transition: "all 0.15s",
        }}>
          Reset
        </button>
      </div>

      <div style={{ marginTop: 12, fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
        Press ` to toggle · Link shares exact config
      </div>
    </div>
  );
}
