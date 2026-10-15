"use client";

import { useEffect, useRef, useState } from "react";
import { largest, srcSet } from "@/lib/site";
import { createRoom, lerp3, sm } from "@/lib/room3d";
import { createDepthLayer } from "@/lib/depthImage";

const PHASES = ["Planta", "Volume", "Mobiliário", "Materiais", "Espaço pronto"];
const BUILD_SECONDS = 5.6;
const PHOTO = "/img/sala-vista-2560.webp";
const PHOTO_SMALL = "/img/sala-vista-1440.webp";
const DEPTH = "/img/sala-vista-depth.webp";
const FOCUS_X = 0.42; // the window with the hills, kept in frame on phones

/**
 * Opening: the study model assembles itself (plan → walls → furniture → materials), then a curtain
 * opens onto the finished space: an illustrative photo with a depth map, moving with pointer and scroll.
 * "Rever a maquete" closes the curtain and plays the model again.
 * Everything runs regardless of the OS "reduce motion" flag (often on by default on Windows);
 * that flag only removes the self-running drift.
 */
export default function Hero3D({ alt }: { alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const replayRef = useRef<() => void>(() => {});
  const [phase, setPhase] = useState(-1);
  const [canReplay, setCanReplay] = useState(false);

  useEffect(() => {
    const el = box.current!, stage = stageRef.current!, photoCanvas = photoRef.current!;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true, raf = 0;
    let disposeRoom: (() => void) | null = null;
    el.dataset.mode = "3d";

    // --- finished-space photo with depth ---
    const depth = createDepthLayer(photoCanvas, innerWidth > 1200 ? PHOTO : PHOTO_SMALL, DEPTH, FOCUS_X);
    let photoReady = false;
    depth?.ready.then(() => { photoReady = true; }).catch(() => {});

    const target = { x: 0, y: 0 }, look = { x: 0, y: 0 };
    let pointer = false;
    const onMove = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; pointer = true; target.x = (e.clientX / innerWidth) * 2 - 1; target.y = (e.clientY / innerHeight) * 2 - 1; };
    addEventListener("pointermove", onMove, { passive: true });
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(el);

    // --- state ---
    let room: Awaited<ReturnType<typeof createRoom>> | null = null;
    let t0 = performance.now(), built = false, revealAt = 0, lastPhase = -1;
    const showPhoto = () => {
      if (!photoReady) return false;
      el.dataset.photo = "on"; revealAt = performance.now(); setPhase(4); lastPhase = 4; setCanReplay(!!room);
      return true;
    };
    replayRef.current = () => {
      if (!room) return;
      el.dataset.photo = "off"; built = false; t0 = performance.now(); setCanReplay(false);
    };

    // if the 3D is slow or unavailable, go straight to the photo
    const fallback = setTimeout(() => { if (el.dataset.gl !== "on") { if (!showPhoto()) el.dataset.mode = "photo"; } }, 8000);

    (async () => {
      try {
        const r = await createRoom(stage, { background: "#1d1916", dusk: true, exposure: 1.05 });
        if (!alive) { r.dispose(); return; }
        await Promise.race([r.ready, new Promise((ok) => setTimeout(ok, 3500))]);
        if (!alive) { r.dispose(); return; }
        room = r; disposeRoom = r.dispose;
        addEventListener("resize", r.resize);
        if (el.dataset.photo === "on") { setCanReplay(true); return; } // fallback already showed the photo
        t0 = performance.now();
      } catch {
        if (!showPhoto()) el.dataset.mode = "photo";
      }
    })();

    const HERO = { pos: [7.4, 5.4, 9.9], look: [-0.2, 0.6, -0.7] };
    const PLAN = { pos: [0.1, 13, 0.12], look: [0.1, 0, 0.1] };
    const INSIDE = { pos: [1.7, 1.45, 2.4], look: [-0.5, 1.0, -1.7] };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const now = performance.now();
      const t = (now - t0) / 1000;
      const scroll = Math.min(1, Math.max(0, scrollY / Math.max(1, el.clientHeight)));
      if (!pointer) {
        if (calm) { target.x = 0; target.y = 0; }
        else { target.x = Math.sin(now / 1000 * 0.21) * 0.6; target.y = Math.cos(now / 1000 * 0.15) * 0.3; }
      }
      look.x += (target.x - look.x) * 0.045; look.y += (target.y - look.y) * 0.045;
      const photoOn = el.dataset.photo === "on";
      const photoSettled = photoOn && now - revealAt > 1900;

      // 3D model, until the curtain has fully covered it
      if (room && !photoSettled) {
        const { renderer, scene, camera, build } = room;
        const p = Math.min(1, t / BUILD_SECONDS);
        const bp = p < 1 ? 0.5 - Math.cos(p * Math.PI) / 2 : 1;
        build(bp);
        if (!photoOn) {
          const ph = bp < 0.16 ? 0 : bp < 0.44 ? 1 : bp < 0.74 ? 2 : 3;
          if (ph !== lastPhase) { lastPhase = ph; setPhase(ph); }
        }
        const a = sm(0.1, 0.55, bp);
        let pos = lerp3(PLAN.pos, HERO.pos, a), lk = lerp3(PLAN.look, HERO.look, a);
        const s = sm(0, 0.9, scroll);
        pos = lerp3(pos, INSIDE.pos, s); lk = lerp3(lk, INSIDE.look, s);
        const idle = sm(0.85, 1, bp);
        const yaw = (look.x * 0.16) * idle * (1 - s * 0.7);
        const dx = pos[0] - lk[0], dz = pos[2] - lk[2];
        const cos = Math.cos(yaw), sin = Math.sin(yaw);
        const k = camera.aspect < 0.7 ? 2.05 : camera.aspect < 1 ? 1.6 : camera.aspect < 1.3 ? 1.15 : 1;
        const kk = 1 + (k - 1) * (1 - s);
        camera.position.set(lk[0] + (dx * cos - dz * sin) * kk, lk[1] + (pos[1] - lk[1]) * kk - look.y * 0.35 * idle, lk[2] + (dx * sin + dz * cos) * kk);
        camera.lookAt(lk[0], lk[1], lk[2]);
        const W = renderer.domElement.width, H = renderer.domElement.height;
        if (camera.aspect >= 1) camera.setViewOffset(W, H, -0.2 * W * (1 - s), 0.04 * H * (1 - s), W, H);
        else camera.setViewOffset(W, H, 0, 0.23 * H * (1 - s), W, H);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        if (el.dataset.gl !== "on") el.dataset.gl = "on";
        if (!built && p >= 1) { built = true; setTimeout(() => { if (alive && built) showPhoto(); }, 700); }
      }

      // finished space with depth
      if (depth && photoReady && (photoOn || el.dataset.mode === "photo")) {
        const intro = photoOn ? 1 - sm(0, 1800, now - revealAt) : 0;
        depth.draw(look, scroll, intro);
      }
    };
    raf = requestAnimationFrame(tick);
    const onResize = () => depth?.resize();
    addEventListener("resize", onResize);

    return () => {
      alive = false; clearTimeout(fallback); cancelAnimationFrame(raf); io.disconnect();
      removeEventListener("pointermove", onMove); removeEventListener("resize", onResize);
      if (room) removeEventListener("resize", room.resize);
      disposeRoom?.();
    };
  }, []);

  return (
    <div ref={box} className="hero-media" data-hero-media>
      <picture>
        <img src={largest("sala-vista")} srcSet={srcSet("sala-vista")} sizes="100vw" alt={alt} fetchPriority="high" decoding="async" style={{ objectPosition: `${FOCUS_X * 100}% 50%` }} />
      </picture>
      <div ref={stageRef} className="hero-stage" aria-hidden="true" />
      <canvas ref={photoRef} className="hero-photo" aria-hidden="true" />
      <p className="hero-phase" aria-hidden="true">
        {PHASES.map((p, i) => (
          <span key={p} data-on={i <= phase ? "" : undefined}>{p}</span>
        ))}
      </p>
      <button type="button" className="hero-replay" data-show={canReplay ? "" : undefined} onClick={() => replayRef.current()} tabIndex={canReplay ? 0 : -1}>
        <span aria-hidden="true">↺</span> Rever a maquete 3D
      </button>
    </div>
  );
}
