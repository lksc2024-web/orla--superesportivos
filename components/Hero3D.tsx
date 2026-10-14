"use client";

import { useEffect, useRef, useState } from "react";
import { largest, srcSet } from "@/lib/site";
import { createRoom, lerp3, sm } from "@/lib/room3d";

const PHASES = ["Planta", "Volume", "Mobiliário", "Materiais e luz"];

/**
 * Opening scene: the living room assembles itself on load (plan → walls → furniture → materials),
 * then follows the pointer and, on scroll, the camera moves down into the room.
 * The photoreal render stays underneath as the fallback (no WebGL, reduced motion, slow load).
 */
export default function Hero3D({ alt }: { alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(-1);

  useEffect(() => {
    const el = box.current!, stage = stageRef.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.mode = "3d";
    let alive = true, raf = 0;
    let cleanup: (() => void) | null = null;
    // if the scene is not up in time, the photo takes over
    const fallback = setTimeout(() => { if (el.dataset.gl !== "on") el.dataset.mode = "photo"; }, 6000);

    (async () => {
      const room = await createRoom(stage, { background: "#1d1916", dusk: true, exposure: 1.05 });
      if (!alive) { room.dispose(); return; }
      const { renderer, scene, camera, build } = room;
      // wait for the furniture (max 3.5 s) so nothing pops in late
      await Promise.race([room.ready, new Promise((r) => setTimeout(r, 3500))]);
      if (!alive) { room.dispose(); return; }

      const PLAN = { pos: [0.1, 13, 0.12], look: [0.1, 0, 0.1] };
      const HERO = { pos: [7.4, 5.4, 9.9], look: [-0.2, 0.6, -0.7] };
      const INSIDE = { pos: [1.7, 1.45, 2.4], look: [-0.5, 1.0, -1.7] };

      const target = { x: 0, y: 0 }, look = { x: 0, y: 0 };
      let pointer = false;
      const onMove = (e: PointerEvent) => { if (e.pointerType !== "mouse") return; pointer = true; target.x = (e.clientX / innerWidth) * 2 - 1; target.y = (e.clientY / innerHeight) * 2 - 1; };
      addEventListener("pointermove", onMove, { passive: true });
      const onResize = () => room.resize();
      addEventListener("resize", onResize);
      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
      io.observe(el);

      const DURATION = 5.6;
      const t0 = performance.now();
      let shown = false, lastPhase = -1;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden) return;
        const t = (performance.now() - t0) / 1000;
        const p = Math.min(1, t / DURATION);
        const bp = p < 1 ? 0.5 - Math.cos(p * Math.PI) / 2 : 1;
        build(bp);
        const ph = bp < 0.16 ? 0 : bp < 0.44 ? 1 : bp < 0.74 ? 2 : 3;
        if (ph !== lastPhase) { lastPhase = ph; setPhase(ph); }

        // build camera: plan → three-quarter
        const a = sm(0.1, 0.55, bp);
        let pos = lerp3(PLAN.pos, HERO.pos, a), lk = lerp3(PLAN.look, HERO.look, a);
        // scroll: dolly into the room at eye level
        const s = sm(0, 0.9, Math.min(1, scrollY / Math.max(1, el.clientHeight)));
        pos = lerp3(pos, INSIDE.pos, s); lk = lerp3(lk, INSIDE.look, s);
        // idle drift and pointer orbit once built
        const idle = sm(0.85, 1, bp);
        if (!pointer) { target.x = Math.sin(t * 0.19) * 0.6; target.y = Math.cos(t * 0.13) * 0.3; }
        look.x += (target.x - look.x) * 0.04; look.y += (target.y - look.y) * 0.04;
        const yaw = (look.x * 0.16 + Math.sin(t * 0.11) * 0.03) * idle * (1 - s * 0.7);
        const dx = pos[0] - lk[0], dz = pos[2] - lk[2];
        const cos = Math.cos(yaw), sin = Math.sin(yaw);
        const k = camera.aspect < 0.7 ? 2.05 : camera.aspect < 1 ? 1.6 : camera.aspect < 1.3 ? 1.15 : 1;
        const kk = 1 + (k - 1) * (1 - s);
        camera.position.set(lk[0] + (dx * cos - dz * sin) * kk, lk[1] + (pos[1] - lk[1]) * kk - look.y * 0.35 * idle, lk[2] + (dx * sin + dz * cos) * kk);
        camera.lookAt(lk[0], lk[1], lk[2]);
        // frame the model away from the headline: right on wide screens, up on phones
        const W = renderer.domElement.width, H = renderer.domElement.height;
        if (camera.aspect >= 1) camera.setViewOffset(W, H, -0.2 * W * (1 - s), 0.04 * H * (1 - s), W, H);
        else camera.setViewOffset(W, H, 0, 0.23 * H * (1 - s), W, H);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        if (!shown) { shown = true; el.dataset.gl = "on"; }
      };
      raf = requestAnimationFrame(tick);
      cleanup = () => { removeEventListener("pointermove", onMove); removeEventListener("resize", onResize); io.disconnect(); room.dispose(); };
    })().catch(() => { el.dataset.mode = "photo"; });

    return () => { alive = false; clearTimeout(fallback); cancelAnimationFrame(raf); cleanup?.(); };
  }, []);

  return (
    <div ref={box} className="hero-media" data-hero-media>
      <picture>
        <source media="(max-aspect-ratio: 9/10)" srcSet={srcSet("hero-m")} sizes="100vw" />
        <img src={largest("hero")} srcSet={srcSet("hero")} sizes="100vw" alt={alt} fetchPriority="high" decoding="async" />
      </picture>
      <div ref={stageRef} className="hero-stage" aria-hidden="true" />
      <p className="hero-phase" aria-hidden="true">
        {PHASES.map((p, i) => (
          <span key={p} data-on={i <= phase ? "" : undefined}>{p}</span>
        ))}
      </p>
    </div>
  );
}
