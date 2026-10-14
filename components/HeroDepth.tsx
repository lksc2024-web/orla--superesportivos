"use client";

import { useEffect, useRef } from "react";
import { largest, srcSet } from "@/lib/site";

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

// Depth-displaced image: near pixels (white in the depth map) move more than far ones.
const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uImg, uDepth;
uniform vec2 uRes, uImgRes, uLook;
uniform float uScroll, uFocus;
vec2 cover(vec2 uv){
  float rs = uRes.x / uRes.y, ri = uImgRes.x / uImgRes.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}
void main(){
  vec2 uv = cover(vUv);
  uv = (uv - 0.5) / (1.04 + uScroll * 0.08) + 0.5;
  uv.y = 1.0 - uv.y;
  float d = texture2D(uDepth, uv).r;
  vec2 shift = (uLook * vec2(0.016, 0.010) + vec2(0.0, -uScroll * 0.035)) * (d - uFocus);
  vec2 q = clamp(uv + shift, 0.001, 0.999);
  gl_FragColor = vec4(texture2D(uImg, q).rgb, 1.0);
}`;

type Props = { alt: string };

export default function HeroDepth({ alt }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current, canvas = canvasRef.current;
    if (!el || !canvas) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // the <picture> stays; no motion
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const portrait = () => innerWidth / innerHeight < 0.9;
    let isPortrait = portrait();
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("uRes"), uImgRes = U("uImgRes"), uLook = U("uLook"), uScroll = U("uScroll"), uFocus = U("uFocus");
    gl.uniform1i(U("uImg"), 0); gl.uniform1i(U("uDepth"), 1);

    const texFrom = (img: HTMLImageElement, unit: number) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    const load = (src: string) => new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.decoding = "async"; i.onload = () => ok(i); i.onerror = bad; i.src = src; });

    let ready = false, raf = 0, alive = true;
    let imgW = 1920, imgH = 1080;
    async function setup() {
      ready = false;
      const wide = innerWidth > 1100;
      const [c, d] = isPortrait
        ? await Promise.all([load("/img/hero-m-900.webp"), load("/img/hero-m-depth.webp")])
        : await Promise.all([load(wide ? "/img/hero-1920.webp" : "/img/hero-1440.webp"), load("/img/hero-depth.webp")]);
      if (!alive) return;
      texFrom(c, 0); texFrom(d, 1);
      imgW = c.naturalWidth; imgH = c.naturalHeight;
      ready = true;
      el!.dataset.gl = "on";
    }
    setup().catch(() => { /* keep the static picture */ });

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.75);
      const w = el.clientWidth, h = el.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    size();
    const onResize = () => { size(); const p = portrait(); if (p !== isPortrait) { isPortrait = p; setup().catch(() => {}); } };
    addEventListener("resize", onResize);

    const target = { x: 0, y: 0 }, look = { x: 0, y: 0 };
    let pointer = false;
    const onMove = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; pointer = true; target.x = (e.clientX / innerWidth) * 2 - 1; target.y = (e.clientY / innerHeight) * 2 - 1; };
    addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 });
    io.observe(el);

    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!ready || !visible || document.hidden) return;
      const t = (now - t0) / 1000;
      if (!pointer) { target.x = Math.sin(t * 0.23) * 0.7; target.y = Math.cos(t * 0.17) * 0.35; }
      look.x += (target.x - look.x) * 0.045; look.y += (target.y - look.y) * 0.045;
      const sc = Math.min(1, Math.max(0, scrollY / el.clientHeight));
      gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform2f(uImgRes, imgW, imgH);
      gl.uniform2f(uLook, look.x, look.y); gl.uniform1f(uScroll, sc); gl.uniform1f(uFocus, 0.42);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);

    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener("resize", onResize); removeEventListener("pointermove", onMove); io.disconnect(); };
  }, []);

  return (
    <div ref={box} className="hero-media" data-hero-media>
      <picture>
        <source media="(max-aspect-ratio: 9/10)" srcSet={srcSet("hero-m")} sizes="100vw" />
        <img src={largest("hero")} srcSet={srcSet("hero")} sizes="100vw" alt={alt} fetchPriority="high" decoding="async" />
      </picture>
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
