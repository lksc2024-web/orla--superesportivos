"use client";

import { useEffect } from "react";

/**
 * Page-level scroll effects, wired to plain DOM markers so sections stay server-rendered:
 *  [data-reveal]          fades/clips in once
 *  [data-parallax]        image drifts inside its frame
 *  .manifesto .w          words light up with progress
 *  [data-pillars]         sticky editorial: active pillar swaps the image
 *  [data-svc]             service rows show a floating preview under the cursor
 *  [data-hero-copy]       hero text drifts and fades as you leave
 */
export default function Effects() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("is-ready");

    // reveals
    // clip-revealed frames start fully clipped, which Chrome treats as not intersecting:
    // watch their parent instead and reveal the frame through this map
    const watched = new Map<Element, Element>();
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        (watched.get(e.target) ?? e.target).classList.add("in");
        io.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      const target = el.getAttribute("data-reveal") === "clip" && el.parentElement ? el.parentElement : el;
      watched.set(target, el);
      io.observe(target);
    });

    const parallax = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
    const words = [...document.querySelectorAll<HTMLElement>(".manifesto .w")];
    const manifesto = document.querySelector<HTMLElement>(".manifesto");
    const pillarsRoot = document.querySelector<HTMLElement>("[data-pillars]");
    const pillars = pillarsRoot ? [...pillarsRoot.querySelectorAll<HTMLElement>(".pillar")] : [];
    const figures = pillarsRoot ? [...pillarsRoot.querySelectorAll<HTMLElement>(".pillar-media figure")] : [];
    const heroCopy = document.querySelector<HTMLElement>("[data-hero-copy]");
    const heroMedia = document.querySelector<HTMLElement>("[data-hero-media]");

    let current = -1;
    const setPillar = (i: number) => {
      if (i === current) return;
      figures.forEach((f, k) => { f.classList.toggle("was", k === current); f.classList.toggle("on", k === i); });
      pillars.forEach((p, k) => p.classList.toggle("on", k === i));
      current = i;
    };
    setPillar(0);

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = innerHeight;
      if (!reduce) {
        for (const el of parallax) {
          const r = el.parentElement!.getBoundingClientRect();
          if (r.bottom < -100 || r.top > vh + 100) continue;
          const k = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1..1
          el.style.transform = `translate3d(0, ${(-k * 7).toFixed(2)}%, 0)`;
        }
        if (heroCopy && heroMedia) {
          const h = heroMedia.clientHeight, y = Math.min(scrollY, h);
          heroCopy.style.transform = `translate3d(0, ${(y * 0.35).toFixed(1)}px, 0)`;
          heroCopy.style.opacity = String(1 - Math.min(1, y / (h * 0.65)));
        }
      }
      if (manifesto && words.length) {
        const r = manifesto.getBoundingClientRect();
        const p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.82 - r.top) / (r.height * 0.9)));
        const n = Math.round(p * words.length);
        words.forEach((w, i) => w.classList.toggle("on", i < n));
      }
      if (pillars.length) {
        let pick = 0;
        pillars.forEach((p, i) => { if (p.getBoundingClientRect().top < vh * 0.55) pick = i; });
        setPillar(pick);
      }
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();

    // service preview following the cursor
    const peek = document.querySelector<HTMLElement>(".svc-peek");
    const peekImg = peek?.querySelector("img");
    const rows = [...document.querySelectorAll<HTMLElement>("[data-svc]")];
    const pos = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let peekRaf = 0;
    const follow = () => {
      cur.x += (pos.x - cur.x) * 0.16; cur.y += (pos.y - cur.y) * 0.16;
      if (peek) { peek.style.left = `${cur.x}px`; peek.style.top = `${cur.y}px`; }
      peekRaf = requestAnimationFrame(follow);
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !peek || !peekImg) return;
      const src = (e.currentTarget as HTMLElement).dataset.svc!;
      peekImg.src = src;
      pos.x = cur.x = e.clientX; pos.y = cur.y = e.clientY;
      peek.classList.add("on");
      if (!peekRaf && !reduce) peekRaf = requestAnimationFrame(follow);
    };
    const move = (e: PointerEvent) => { pos.x = e.clientX + 40; pos.y = e.clientY; if (reduce && peek) { peek.style.left = `${pos.x}px`; peek.style.top = `${pos.y}px`; } };
    const leave = () => { peek?.classList.remove("on"); cancelAnimationFrame(peekRaf); peekRaf = 0; };
    rows.forEach((r) => { r.addEventListener("pointerenter", enter); r.addEventListener("pointermove", move); r.addEventListener("pointerleave", leave); });

    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll);
      rows.forEach((r) => { r.removeEventListener("pointerenter", enter); r.removeEventListener("pointermove", move); r.removeEventListener("pointerleave", leave); });
      cancelAnimationFrame(peekRaf);
    };
  }, []);

  return null;
}
