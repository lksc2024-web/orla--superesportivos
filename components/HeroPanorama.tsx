"use client";

import { useEffect, useRef } from "react";
import { largest, srcSet } from "@/lib/site";
import { createDepthLayer } from "@/lib/depthImage";

const PHOTO = "/img/sala-vista-2560.webp";
const PHOTO_SMALL = "/img/sala-vista-1440.webp";
const DEPTH = "/img/sala-vista-depth.webp";

/**
 * Opening: the finished room, straight away. While the visitor scrolls through the pinned hero the view
 * travels across the room like a panorama (window and hills → sofa → armchair), with depth between near
 * and far planes; pointer movement adds a little more depth on desktop.
 * The plain <img> is the instant first paint and the fallback without WebGL.
 */
export default function HeroPanorama({ alt }: { alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = box.current!, canvas = canvasRef.current!;
    const wrap = el.closest<HTMLElement>("[data-hero-wrap]") ?? el;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const depth = createDepthLayer(canvas, innerWidth > 1200 ? PHOTO : PHOTO_SMALL, DEPTH);
    if (!depth) return;
    let ready = false, raf = 0, shownAt = 0;
    depth.ready.then(() => { ready = true; shownAt = performance.now(); el.dataset.gl = "on"; }).catch(() => {});

    const target = { x: 0, y: 0 }, look = { x: 0, y: 0 };
    let pointer = false;
    const onMove = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; pointer = true; target.x = (e.clientX / innerWidth) * 2 - 1; target.y = (e.clientY / innerHeight) * 2 - 1; };
    addEventListener("pointermove", onMove, { passive: true });
    const onResize = () => depth.resize();
    addEventListener("resize", onResize);
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(el);

    let pan = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!ready || !visible || document.hidden) return;
      // progress through the pinned hero (0 at the top, 1 when it starts to leave)
      const r = wrap.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      const leave = Math.min(1, Math.max(0, -r.top / innerHeight - (r.height / innerHeight - 1)));
      pan += (p - pan) * 0.12; // eased so wheel steps glide instead of jumping
      if (!pointer) {
        if (calm) { target.x = 0; target.y = 0; }
        else { target.x = Math.sin(now / 1000 * 0.21) * 0.45; target.y = Math.cos(now / 1000 * 0.15) * 0.25; }
      }
      look.x += (target.x - look.x) * 0.05; look.y += (target.y - look.y) * 0.05;
      const portrait = canvas.clientWidth / Math.max(1, canvas.clientHeight) < 0.9;
      const intro = 1 - Math.min(1, (now - shownAt) / 2200);
      depth.draw(look, {
        pan: pan * pan * (3 - 2 * pan),
        scroll: leave,
        intro: intro * intro,
        // phones see a narrow slice, so they travel across most of the room; wide screens zoom in a little to have room to pan
        from: portrait ? 0.3 : 0.36,
        to: portrait ? 0.9 : 0.78,
        zoom: portrait ? 1.0 : 1.18,
      });
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", onMove); removeEventListener("resize", onResize); };
  }, []);

  return (
    <div ref={box} className="hero-media" data-hero-media>
      <img src={largest("sala-vista")} srcSet={srcSet("sala-vista")} sizes="100vw" alt={alt} fetchPriority="high" decoding="async" style={{ objectPosition: "36% 50%" }} />
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
