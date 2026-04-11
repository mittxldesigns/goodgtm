"use client";

import { useEffect, useRef } from "react";

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec2  uRes;
out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x*(1.0/289.0))*289.0; }
vec2 mod289(vec2 x) { return x - floor(x*(1.0/289.0))*289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0*fract(p*C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
  vec3 g;
  g.x = a0.x*x0.x + h.x*x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.0*dot(m, g);
}

float terrain(vec2 p, float t) {
  float h = 0.0;
  h += sin(p.x*0.7 + p.y*0.35 + t*0.3) * 0.80;
  h += sin(p.x*0.45 - p.y*0.6 + t*0.2) * 0.55;
  h += cos(p.x*0.3 + p.y*0.8 - t*0.15) * 0.45;
  h += sin(p.x*1.0 + p.y*0.25 + t*0.35) * 0.22;
  h += cos(p.x*0.75 - p.y*0.95 + t*0.22) * 0.18;
  h += snoise(p * 0.7 + t*0.1) * 0.20;
  h += snoise(p * 1.3 - t*0.07) * 0.08;
  return h;
}

vec3 calcNormal(vec2 p, float t) {
  float e = 0.005;
  float h  = terrain(p, t);
  float hx = terrain(p + vec2(e, 0.0), t);
  float hy = terrain(p + vec2(0.0, e), t);
  return normalize(vec3(h - hx, e * 1.2, h - hy));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float t = uTime * 0.08;
  vec2 tp = p * 3.5;

  float h = terrain(tp, t);
  vec3 nor = calcNormal(tp, t);

  vec3 lightDir1 = normalize(vec3(-0.5, 0.9, 0.4));
  vec3 lightDir2 = normalize(vec3(0.6, 0.3, -0.5));
  float diff1 = max(dot(nor, lightDir1), 0.0);
  float diff2 = max(dot(nor, lightDir2), 0.0);
  float amb = 0.25;

  vec3 viewDir = vec3(0.0, 1.0, 0.0);
  vec3 halfDir = normalize(lightDir1 + viewDir);
  float spec = pow(max(dot(nor, halfDir), 0.0), 32.0) * 0.15;

  float rim = pow(1.0 - max(nor.y, 0.0), 2.5) * 0.12;

  vec3 shadowColor = vec3(0.06, 0.058, 0.05);
  vec3 litColor = vec3(0.20, 0.19, 0.165);

  float lighting = amb + diff1 * 0.55 + diff2 * 0.15;
  vec3 col = mix(shadowColor, litColor, lighting);
  col += vec3(0.08, 0.075, 0.065) * rim;
  col += vec3(0.18, 0.17, 0.15) * spec;

  float heightLight = smoothstep(-0.3, 0.5, h) * 0.08;
  col += vec3(heightLight * 0.9, heightLight * 0.85, heightLight * 0.75);

  float bloom = smoothstep(1.4, 0.0, length(p - vec2(-0.35, 0.25)));
  col += vec3(0.035, 0.03, 0.022) * bloom;

  vec2 vp = uv * (1.0 - uv);
  float vig = smoothstep(0.0, 0.15, vp.x * vp.y);
  col *= 0.65 + 0.35 * vig;

  float grain = fract(sin(dot(gl_FragCoord.xy + fract(uTime), vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.008;

  // Orbital ring
  vec2 ringCenter = vec2(0.0, 0.02);
  vec2 rp = p - ringCenter;
  float angle = 0.25 + sin(t * 0.3) * 0.05;
  float ca = cos(angle), sa = sin(angle);
  vec2 rotP = vec2(rp.x*ca - rp.y*sa, rp.x*sa + rp.y*ca);
  float ellipse = length(rotP * vec2(1.0, 3.2));
  float ringDist = abs(ellipse - 0.38);
  float ring = smoothstep(0.004, 0.001, ringDist);
  float ringFade = smoothstep(0.15, -0.1, h * 0.3);
  col += vec3(0.25, 0.24, 0.22) * ring * 0.35 * ringFade;

  // Cross centerpiece
  vec2 cp = abs(p - vec2(0.0, 0.02));
  float crossH = smoothstep(0.008, 0.002, cp.y) * smoothstep(0.025, 0.015, cp.x);
  float crossV = smoothstep(0.008, 0.002, cp.x) * smoothstep(0.025, 0.015, cp.y);
  float cross = max(crossH, crossV);
  col += vec3(0.5, 0.48, 0.45) * cross * 0.6;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function makeShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

function makeProgram(gl: WebGL2RenderingContext) {
  const v = makeShader(gl, gl.VERTEX_SHADER, VERT);
  const f = makeShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!v || !f) return null;
  const p = gl.createProgram()!;
  gl.attachShader(p, v); gl.attachShader(p, f);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error("Program error:", gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

export default function WebGLBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      powerPreference: "default",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const prog = makeProgram(gl);
    if (!prog) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1, 1,-1, -1,1,
      -1,1,  1,-1,  1,1,
    ]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(prog);
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uRes  = gl.getUniformLocation(prog, "uRes");

    let animFrame: number;
    const startTime = performance.now();

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      gl.uniform1f(uTime, (performance.now() - startTime) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animFrame = requestAnimationFrame(draw);
    };

    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      cancelAnimationFrame(animFrame);
    });
    canvas.addEventListener("webglcontextrestored", draw);

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 5, pointerEvents: "none" }}
    />
  );
}
