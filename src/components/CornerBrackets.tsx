"use client";

export default function CornerBrackets() {
  const bracketSize = 24;
  const inset = 20;
  const thickness = 1.5;
  const color = "rgba(255, 255, 255, 0.6)";

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Top-left */}
      <div
        className="absolute"
        style={{
          top: inset,
          left: inset,
          width: bracketSize,
          height: bracketSize,
          borderTop: `${thickness}px solid ${color}`,
          borderLeft: `${thickness}px solid ${color}`,
        }}
      />
      {/* Top-right */}
      <div
        className="absolute"
        style={{
          top: inset,
          right: inset,
          width: bracketSize,
          height: bracketSize,
          borderTop: `${thickness}px solid ${color}`,
          borderRight: `${thickness}px solid ${color}`,
        }}
      />
      {/* Bottom-left */}
      <div
        className="absolute"
        style={{
          bottom: inset,
          left: inset,
          width: bracketSize,
          height: bracketSize,
          borderBottom: `${thickness}px solid ${color}`,
          borderLeft: `${thickness}px solid ${color}`,
        }}
      />
      {/* Bottom-right */}
      <div
        className="absolute"
        style={{
          bottom: inset,
          right: inset,
          width: bracketSize,
          height: bracketSize,
          borderBottom: `${thickness}px solid ${color}`,
          borderRight: `${thickness}px solid ${color}`,
        }}
      />
    </div>
  );
}
