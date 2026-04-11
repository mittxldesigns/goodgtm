"use client";

import { useEffect, useRef } from "react";

// Build an icosahedron — 12 vertices, 20 triangular faces
function getIcosahedronData() {
  const phi = (1 + Math.sqrt(5)) / 2; // golden ratio
  const scale = 90;

  const vertices: [number, number, number][] = [
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
  ].map(([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [(x / len) * scale, (y / len) * scale, (z / len) * scale] as [number, number, number];
  });

  const faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  return { vertices, faces };
}

// Calculate the CSS transform to position a triangle in 3D space
function getTriangleTransform(
  v0: [number, number, number],
  v1: [number, number, number],
  v2: [number, number, number]
) {
  // Center of the triangle
  const cx = (v0[0] + v1[0] + v2[0]) / 3;
  const cy = (v0[1] + v1[1] + v2[1]) / 3;
  const cz = (v0[2] + v1[2] + v2[2]) / 3;

  // Normal vector
  const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
  const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

  return { cx, cy, cz, nx: nx / len, ny: ny / len, nz: nz / len };
}

export default function Logo3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { vertices, faces } = getIcosahedronData();

  useEffect(() => {
    let frame: number;
    let angle = 0;

    const animate = () => {
      angle += 0.2;
      if (containerRef.current) {
        containerRef.current.style.transform = `
          rotateY(${angle}deg)
          rotateX(${angle * 0.4}deg)
          rotateZ(${Math.sin(angle * 0.005) * 8}deg)
        `;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div style={{ perspective: 800, perspectiveOrigin: "50% 50%" }}>
        <div
          ref={containerRef}
          style={{
            width: 0,
            height: 0,
            position: "relative",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {faces.map((face, i) => {
            const v0 = vertices[face[0]];
            const v1 = vertices[face[1]];
            const v2 = vertices[face[2]];
            const { cx, cy, cz, nx, ny, nz } = getTriangleTransform(v0, v1, v2);

            // Calculate rotation to align the triangle's face with its normal
            const up = [0, 0, 1];
            const dot = up[2] * nz;
            const crossX = up[1] * nz - up[2] * ny;
            const crossY = up[2] * nx - up[0] * nz;
            const crossZ = up[0] * ny - up[1] * nx;
            const crossLen = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
            const rotAngle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);

            // Color varies per face — metallic with magenta tint
            const lightness = 45 + (i % 5) * 8;
            const hue = 290 + (i % 7) * 3; // magenta range
            const sat = 15 + (i % 4) * 5;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 0,
                  height: 0,
                  transformStyle: "preserve-3d",
                  transform: `
                    translate3d(${cx}px, ${cy}px, ${cz}px)
                    ${crossLen > 0.001
                      ? `rotate3d(${crossX / crossLen}, ${crossY / crossLen}, ${crossZ / crossLen}, ${rotAngle}deg)`
                      : dot < 0 ? "rotateX(180deg)" : ""
                    }
                  `,
                }}
              >
                <svg
                  width="200"
                  height="200"
                  viewBox="-100 -100 200 200"
                  style={{
                    position: "absolute",
                    left: -100,
                    top: -100,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <polygon
                    points={[v0, v1, v2]
                      .map((v) => `${v[0] - cx},${v[1] - cy}`)
                      .join(" ")}
                    fill={`hsl(${hue}, ${sat}%, ${lightness}%)`}
                    stroke="rgba(250, 118, 255, 0.15)"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
