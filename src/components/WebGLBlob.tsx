"use client";

import { useEffect, useRef, MutableRefObject } from "react";

/* ─── Types & defaults ─── */
export type BackgroundType = "waves" | "smoke" | "aurora" | "grid" | "gradient";

export const BACKGROUND_LABELS: Record<BackgroundType, string> = {
  waves: "Flowing Waves",
  smoke: "Smoke",
  aurora: "Aurora",
  grid: "Wireframe Grid",
  gradient: "Gradient Orbs",
};

export interface ShaderConfig {
  speed: number;
  contrast: number;
  glow: number;
  warmth: number;
  bulge: number;
  normalDetail: number;
  vignette: number;
  grain: number;
  halftone: number;
  halftoneSize: number;
  quality: "low" | "medium" | "high";
  showRing: boolean;
  showCross: boolean;
  backgroundType: BackgroundType;
}

export const DEFAULT_CONFIG: ShaderConfig = {
  speed: 0.9,
  contrast: 1.0,
  glow: 0.45,
  warmth: 0.55,
  bulge: 0.35,
  normalDetail: 1.8,
  vignette: 0.35,
  grain: 0.008,
  halftone: 0.0,
  halftoneSize: 4.0,
  quality: "medium",
  showRing: true,
  showCross: true,
  backgroundType: "waves",
};

export interface GpuInfo {
  renderer: string;
  resolution: [number, number];
}

const QUALITY = {
  low:    { fps: 15, scale: 0.5  },
  medium: { fps: 24, scale: 0.75 },
  high:   { fps: 60, scale: 1.0  },
};

/* ─── Shaders ─── */
const VERT = `#version 300 es
in vec2 aPos;
void main(){gl_Position=vec4(aPos,0.0,1.0);}`;

const FRAG_HEADER = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform float uSpeed,uContrast,uGlow,uWarmth,uBulge,uNormalStr,uVignette,uGrain,uHalftone,uHalftoneSize,uShowRing,uShowCross;
out vec4 fragColor;

vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
`;

const BG_WAVES = `
float terrain(vec2 p,float t){
  float h=0.0;
  h+=sin(p.x*0.7+p.y*0.35+t*0.15)*(0.70+0.40*sin(t*1.0));
  h+=sin(p.x*0.45-p.y*0.6+t*0.10)*(0.48+0.32*cos(t*0.72));
  h+=cos(p.x*0.3+p.y*0.8-t*0.08)*(0.38+0.25*sin(t*0.55));
  h+=sin(p.x*1.0+p.y*0.25+t*0.18)*(0.20+0.14*cos(t*0.88));
  h+=cos(p.x*0.75-p.y*0.95+t*0.12)*(0.16+0.12*sin(t*1.05));
  h+=snoise(p*0.6+t*0.05)*(0.22+0.12*sin(t*0.60));
  return h;
}
vec3 cNor(vec2 p,float t,float ns){
  float e=0.005;float h=terrain(p,t);
  float hx=terrain(p+vec2(e,0),t);float hy=terrain(p+vec2(0,e),t);
  return normalize(vec3((h-hx)*ns,e*1.2,(h-hy)*ns));
}
void background(vec2 uv,vec2 p,vec2 wp,float t,float bulge,out vec3 col,out float h){
  vec2 tp=wp*3.5;h=terrain(tp,t);
  float nb=1.0+bulge*uNormalStr;
  vec3 nor=cNor(tp,t,nb);
  vec3 sn=normalize(vec3((p-vec2(0.05)),0.5));
  nor=normalize(mix(nor,sn,bulge*0.15));
  vec3 l1=normalize(vec3(-0.5,0.9,0.4));vec3 l2=normalize(vec3(0.6,0.3,-0.5));
  float d1=max(dot(nor,l1),0.0);float d2=max(dot(nor,l2),0.0);
  vec3 hd=normalize(l1+vec3(0,1,0));
  float sp=pow(max(dot(nor,hd),0.0),28.0)*0.20;
  float rim=pow(1.0-max(nor.y,0.0),2.5)*(0.12+bulge*0.10);
  float li=0.22+d1*0.70+d2*0.22;
  col=mix(vec3(0.03,0.03,0.028),vec3(0.24,0.23,0.215),li);
  col+=vec3(0.08,0.075,0.07)*rim;col+=vec3(0.25,0.24,0.22)*sp;
  float hl=smoothstep(-0.2,0.6,h)*0.16;
  col+=vec3(hl*0.95,hl*0.92,hl*0.85);
  float gv=smoothstep(-0.1,0.8,h)*bulge*uGlow*0.4;
  col+=vec3(0.18,0.16,0.13)*gv;
  col+=vec3(0.03,0.025,0.02)*bulge*d1;
  col+=vec3(0.04,0.035,0.025)*smoothstep(1.4,0.0,length(p-vec2(-0.35,0.25)));
}`;

const BG_SMOKE = `
float fbm(vec2 p,float t){
  float f=0.0;
  f+=0.50*snoise(p+t*0.12);
  f+=0.25*snoise(p*2.0-t*0.18);
  f+=0.125*snoise(p*4.0+t*0.09);
  f+=0.0625*snoise(p*8.0-t*0.06);
  return f;
}
void background(vec2 uv,vec2 p,vec2 wp,float t,float bulge,out vec3 col,out float h){
  float f1=fbm(wp*2.2,t);
  float f2=fbm(wp*2.2+vec2(5.2,1.3),t*0.7);
  h=f1+f2*f1*0.8;
  float li=smoothstep(-0.5,1.0,h);
  col=mix(vec3(0.02),vec3(0.19,0.18,0.165),li);
  col+=vec3(0.12,0.10,0.08)*smoothstep(0.3,1.2,h)*uGlow*0.5;
  col+=vec3(0.04,0.035,0.03)*smoothstep(1.3,0.0,length(wp))*bulge;
}`;

const BG_AURORA = `
void background(vec2 uv,vec2 p,vec2 wp,float t,float bulge,out vec3 col,out float h){
  float y=wp.y*3.0+0.5;
  float wave=0.0;
  wave+=sin(y*2.5+wp.x*0.8+t*0.8)*0.6;
  wave+=sin(y*4.0-wp.x*1.2+t*0.5)*0.3;
  wave+=snoise(vec2(wp.x*1.5,y*0.8+t*0.15))*0.5;
  wave+=snoise(vec2(wp.x*0.8-t*0.1,y*1.5))*0.25;
  h=wave;
  float b1=smoothstep(-0.2,0.6,wave)*smoothstep(1.5,0.3,wave);
  float b2=smoothstep(0.0,0.8,wave)*smoothstep(1.8,0.5,wave);
  col=vec3(0.02);
  col+=vec3(0.07,0.13,0.09)*b1*1.3;
  col+=vec3(0.04,0.07,0.11)*b2*0.9;
  col+=vec3(0.11,0.09,0.07)*smoothstep(0.5,1.2,wave)*uGlow*0.4;
  col+=vec3(0.03)*bulge*smoothstep(0.0,0.5,wave);
}`;

const BG_GRID = `
void background(vec2 uv,vec2 p,vec2 wp,float t,float bulge,out vec3 col,out float h){
  vec2 gp=wp*5.0;gp.y-=2.0;
  float persp=1.0/max(gp.y+3.0,0.1);
  gp.x*=persp*2.0;gp.y=gp.y*persp*4.0;
  gp+=sin(gp.yx*0.4+t*0.5)*0.25;
  float gx=smoothstep(0.06,0.01,abs(fract(gp.x)-0.5));
  float gy=smoothstep(0.06,0.01,abs(fract(gp.y)-0.5));
  float grid=max(gx,gy);
  float fade=smoothstep(4.0,0.5,length(wp));
  h=grid*fade;
  col=vec3(0.02)+vec3(0.10,0.10,0.09)*grid*fade;
  col+=vec3(0.06,0.05,0.04)*gx*gy*fade*2.0;
  col+=vec3(0.03)*bulge*fade*uGlow;
}`;

const BG_GRADIENT = `
void background(vec2 uv,vec2 p,vec2 wp,float t,float bulge,out vec3 col,out float h){
  col=vec3(0.03);h=0.0;
  for(int i=0;i<5;i++){
    float fi=float(i);
    vec2 c=vec2(sin(t*0.25+fi*1.57)*0.35,cos(t*0.20+fi*2.09)*0.25);
    float r=0.22+sin(t*0.15+fi*0.8)*0.07;
    float d=length(wp-c)/r;
    float blob=exp(-d*d*2.0);
    h+=blob;
    col+=vec3(0.14,0.13,0.12)*blob*0.55;
  }
  col+=vec3(0.08,0.07,0.06)*smoothstep(0.3,1.2,h)*uGlow*0.5;
  col+=vec3(0.03)*bulge;
}`;

const FRAG_MAIN = `
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  float aspect=uRes.x/uRes.y;
  vec2 p=(uv-0.5)*vec2(aspect,1.0);
  float t=uTime*uSpeed;
  vec2 bc=vec2(0.05,0.05);vec2 fc=p-bc;
  float bulge=smoothstep(1.2,0.0,length(fc)/0.85);
  float bp=bulge*bulge*uBulge;
  vec2 wp=p+fc*bp;
  vec3 col;float h;
  background(uv,p,wp,t,bulge,col,h);
  float mid=0.10;col=clamp(mid+(col-mid)*uContrast,0.0,1.0);
  float lum=dot(col,vec3(0.299,0.587,0.114));
  col=mix(vec3(lum),col*vec3(1.06,1.0,0.90),uWarmth);
  vec2 vp=uv*(1.0-uv);float vig=smoothstep(0.0,0.15,vp.x*vp.y);
  col*=(1.0-uVignette)+uVignette*vig;
  float grain=fract(sin(dot(gl_FragCoord.xy+fract(uTime),vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrain;
  if(uHalftone>0.001){
    float cs=uHalftoneSize;vec2 cell=floor(gl_FragCoord.xy/cs)*cs+cs*0.5;
    float hl=dot(col,vec3(0.299,0.587,0.114));float r=hl*cs*0.55;
    float d=length(gl_FragCoord.xy-cell);
    col=mix(col,vec3(smoothstep(r+0.8,r-0.8,d)*hl*1.2),uHalftone);
  }
  if(uShowRing>0.5){
    vec2 rp=p-vec2(0,0.02);float ang=0.25+sin(t*0.3)*0.05;
    float ca=cos(ang),sa=sin(ang);
    vec2 rotP=vec2(rp.x*ca-rp.y*sa,rp.x*sa+rp.y*ca);
    float rd=abs(length(rotP*vec2(1,3.2))-0.38);
    col+=vec3(0.25,0.24,0.22)*smoothstep(0.004,0.001,rd)*0.35*smoothstep(0.15,-0.1,h*0.3);
  }
  if(uShowCross>0.5){
    vec2 cp=abs(p-vec2(0,0.02));
    float cH=smoothstep(0.003,0.0008,cp.y)*smoothstep(0.018,0.010,cp.x);
    float cV=smoothstep(0.003,0.0008,cp.x)*smoothstep(0.018,0.010,cp.y);
    col+=vec3(0.6,0.58,0.54)*max(cH,cV)*0.7;
  }
  fragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;

const BG_MAP: Record<BackgroundType, string> = {
  waves: BG_WAVES, smoke: BG_SMOKE, aurora: BG_AURORA, grid: BG_GRID, gradient: BG_GRADIENT,
};

function buildFrag(type: BackgroundType): string {
  return FRAG_HEADER + BG_MAP[type] + FRAG_MAIN;
}

/* ─── GL helpers ─── */
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

function compileProgram(gl: WebGL2RenderingContext, bgType: BackgroundType) {
  const v = makeShader(gl, gl.VERTEX_SHADER, VERT);
  const f = makeShader(gl, gl.FRAGMENT_SHADER, buildFrag(bgType));
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

const UNIFORM_NAMES = [
  "uTime","uRes","uSpeed","uContrast","uGlow","uWarmth","uBulge",
  "uNormalStr","uVignette","uGrain","uHalftone","uHalftoneSize","uShowRing","uShowCross",
] as const;

type Locs = Record<(typeof UNIFORM_NAMES)[number], WebGLUniformLocation | null>;

function getLocations(gl: WebGL2RenderingContext, prog: WebGLProgram): Locs {
  const locs = {} as Locs;
  for (const n of UNIFORM_NAMES) locs[n] = gl.getUniformLocation(prog, n);
  return locs;
}

/* ─── Component ─── */
interface Props {
  configRef: MutableRefObject<ShaderConfig>;
  fpsRef: MutableRefObject<number>;
  gpuInfoRef?: MutableRefObject<GpuInfo>;
}

export default function WebGLBlob({ configRef, fpsRef, gpuInfoRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const _gl = canvas.getContext("webgl2", {
      antialias: false, powerPreference: "default", preserveDrawingBuffer: false,
    });
    if (!_gl) return;
    const gl = _gl;

    // GPU info
    if (gpuInfoRef) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      gpuInfoRef.current = {
        renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "Unknown",
        resolution: [0, 0],
      };
    }

    // Initial compile
    let currentBgType = configRef.current.backgroundType;
    let prog = compileProgram(gl, currentBgType);
    if (!prog) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

    function setupAttribs() {
      const aPos = gl.getAttribLocation(prog!, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    }

    gl.useProgram(prog);
    setupAttribs();
    let loc = getLocations(gl, prog);

    let animFrame: number;
    const startTime = performance.now();
    let lastFrame = 0;
    let frameCount = 0;
    let fpsTime = performance.now();
    const dpr = Math.min(devicePixelRatio, 2);

    const draw = (now: number) => {
      animFrame = requestAnimationFrame(draw);
      const cfg = configRef.current;

      // Background type change → recompile
      if (cfg.backgroundType !== currentBgType) {
        const newProg = compileProgram(gl, cfg.backgroundType);
        if (newProg) {
          gl.deleteProgram(prog);
          prog = newProg;
          gl.useProgram(prog);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          setupAttribs();
          loc = getLocations(gl, prog);
          currentBgType = cfg.backgroundType;
        }
      }

      // FPS cap
      const q = QUALITY[cfg.quality];
      if (now - lastFrame < 1000 / q.fps) return;
      lastFrame = now;

      // Resolution
      const w = Math.floor(window.innerWidth * q.scale * dpr) || 1;
      const h = Math.floor(window.innerHeight * q.scale * dpr) || 1;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
        if (gpuInfoRef) gpuInfoRef.current.resolution = [w, h];
      }

      // FPS counter
      frameCount++;
      if (now - fpsTime >= 1000) {
        fpsRef.current = frameCount;
        frameCount = 0;
        fpsTime = now;
      }

      // Uniforms
      gl.uniform1f(loc.uTime, (now - startTime) / 1000);
      gl.uniform2f(loc.uRes, w, h);
      gl.uniform1f(loc.uSpeed, cfg.speed);
      gl.uniform1f(loc.uContrast, cfg.contrast);
      gl.uniform1f(loc.uGlow, cfg.glow);
      gl.uniform1f(loc.uWarmth, cfg.warmth);
      gl.uniform1f(loc.uBulge, cfg.bulge);
      gl.uniform1f(loc.uNormalStr, cfg.normalDetail);
      gl.uniform1f(loc.uVignette, cfg.vignette);
      gl.uniform1f(loc.uGrain, cfg.grain);
      gl.uniform1f(loc.uHalftone, cfg.halftone);
      gl.uniform1f(loc.uHalftoneSize, cfg.halftoneSize);
      gl.uniform1f(loc.uShowRing, cfg.showRing ? 1 : 0);
      gl.uniform1f(loc.uShowCross, cfg.showCross ? 1 : 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); cancelAnimationFrame(animFrame); });
    canvas.addEventListener("webglcontextrestored", () => requestAnimationFrame(draw));
    requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- refs are stable, effect runs once on mount

  return (
    <canvas ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 5, pointerEvents: "none" }} />
  );
}
