"use client";

import { useEffect, useRef } from "react";
import { steps } from "@/lib/site";
import { createRoom, lerp3, sm } from "@/lib/room3d";

/**
 * Scroll-driven study model of the living room:
 * plan lines → walls rise → furniture arrives in white → materials and colour.
 * three.js is loaded only when the section gets close to the viewport.
 */
export default function Maquete() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current!, host = stage.current!;
    const items = [...sec.querySelectorAll<HTMLElement>(".step-item")];
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const progress = () => {
      const r = sec.getBoundingClientRect();
      return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    };
    const syncSteps = () => {
      const p = progress();
      const i = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      items.forEach((el, k) => el.classList.toggle("on", k === i));
      sec.style.setProperty("--p", p.toFixed(4));
    };
    addEventListener("scroll", syncSteps, { passive: true });
    syncSteps();

    let dispose: (() => void) | null = null;
    let started = false;
    const io = new IntersectionObserver(async ([en]) => {
      if (!en.isIntersecting || started) return;
      started = true; io.disconnect();
      try {
        dispose = await start(host, progress, calm);
      } catch {
        /* poster stays */
      }
    }, { rootMargin: "800px 0px" });
    io.observe(sec);

    return () => { io.disconnect(); removeEventListener("scroll", syncSteps); dispose?.(); };
  }, []);

  return (
    <section ref={section} id="metodo" className="relative" style={{ height: "420vh" }} aria-labelledby="metodo-title">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden lg:flex-row">
        <div className="relative order-2 flex flex-1 flex-col justify-end px-[var(--gutter)] pb-8 pt-4 lg:order-1 lg:w-[38%] lg:flex-none lg:justify-center lg:py-0 lg:pl-[max(var(--gutter),calc((100vw-1360px)/2+var(--gutter)))] lg:pr-12">
          <p className="label hidden text-violet lg:block">Método</p>
          <h2 id="metodo-title" className="display mt-4 hidden text-[clamp(2.1rem,3.4vw,3.3rem)] leading-[1.04] lg:block">
            Do primeiro encontro <em>ao espaço pronto</em>
          </h2>
          <ol className="method-steps relative mt-0 grid lg:mt-10 lg:gap-6">
            {steps.map((s, i) => (
              <li key={s.n} className="step-item col-start-1 row-start-1 lg:row-auto [&:not(.on)]:max-lg:invisible" data-step={i}>
                <div className="flex items-center gap-3">
                  <span className="step-dot" aria-hidden="true" />
                  <span className="label text-mute">{s.n}</span>
                  <h3 className="display text-[1.55rem] leading-tight">{s.title}</h3>
                </div>
                <p className="mt-2 max-w-[38ch] pl-[21px] text-[15.5px] text-mute">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="method-quote display mt-6 hidden max-w-[34ch] text-[1.15rem] italic leading-snug text-plum lg:mt-12 lg:block">“Cada projeto da FM nasce da escuta, da rotina e da história de quem vai vivê-lo.”</p>
          <p className="mt-6 max-w-[44ch] text-[12.5px] leading-relaxed text-mute lg:mt-4">
            Visão conceitual da jornada do cliente. As etapas de cada projeto são combinadas diretamente com a FM Arquitetura.
          </p>
        </div>
        <div ref={stage} className="method-stage order-1 h-[58svh] flex-none lg:order-2 lg:h-auto lg:flex-1" aria-label="Maquete 3D ilustrativa de uma sala de estar, montada conforme a rolagem" role="img">
          <div className="poster" style={{ backgroundImage: "url(/img/maquete-poster.webp)" }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[calc(var(--header-h)+92px)] bg-gradient-to-b from-linen via-linen/85 to-transparent lg:hidden" />
          <div className="pointer-events-none absolute left-[var(--gutter)] top-[calc(var(--header-h)+8px)] z-10 lg:hidden">
            <p className="label text-violet">Método</p>
            <p className="display mt-1 text-[1.6rem] leading-tight">Do primeiro encontro <em>ao espaço pronto</em></p>
          </div>
          <div className="pointer-events-none absolute bottom-4 right-[var(--gutter)] z-10 h-px w-28 bg-line">
            <div className="h-px origin-left bg-plum" style={{ transform: "scaleX(var(--p, 0))" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

async function start(host: HTMLElement, progress: () => number, calm: boolean): Promise<() => void> {
  const room = await createRoom(host, { background: "#efe8dd" });
  const { renderer, scene, camera, build } = room;

  // camera: top-down plan → three-quarter → closer
  const PLAN = { pos: [0.1, 12.5, 0.12], look: [0.1, 0, 0.1] };
  const ISO = { pos: [6.4, 5.8, 7.6], look: [-0.1, 0.55, -0.6] };
  const END = { pos: [4.7, 3.1, 7.5], look: [-0.2, 0.9, -0.8] };

  addEventListener("resize", room.resize);
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(host);

  let shown = false, raf = 0;
  const t0 = performance.now();
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = (performance.now() - t0) / 1000;
    const p = progress();
    build(p);
    const a = sm(0.12, 0.46, p), b = sm(0.7, 1, p);
    let pos = lerp3(PLAN.pos, ISO.pos, a), look = lerp3(PLAN.look, ISO.look, a);
    pos = lerp3(pos, END.pos, b); look = lerp3(look, END.look, b);
    const k = camera.aspect < 1 ? 1.55 : camera.aspect < 1.35 ? 1.15 : 1;
    const breathe = calm ? 0 : Math.sin(t * 0.3) * 0.18 * a;
    camera.position.set(look[0] + (pos[0] - look[0]) * k + breathe, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k);
    camera.lookAt(look[0], look[1], look[2]);
    renderer.render(scene, camera);
    if (!shown) { shown = true; host.dataset.gl = "on"; }
  };
  raf = requestAnimationFrame(tick);

  return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", room.resize); room.dispose(); };
}
