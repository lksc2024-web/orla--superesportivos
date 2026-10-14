"use client";

import { useEffect, useRef, useState } from "react";
import { nav, whatsappHref } from "@/lib/site";

export default function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const el = ref.current!;
    let lastY = scrollY;
    const onScroll = () => {
      const y = scrollY;
      const hero = document.getElementById("inicio");
      const past = hero ? y > hero.offsetHeight - 80 : y > 40;
      el.dataset.tone = past ? "solid" : "clear";
      el.dataset.hidden = String(past && y > lastY + 4 && !document.body.dataset.menu);
      if (y < lastY - 4 || !past) el.dataset.hidden = "false";
      lastY = y;
      // section in view for aria-current
      let cur = "";
      for (const n of nav) {
        const s = document.querySelector(n.href);
        if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = n.href;
      }
      setActive(cur);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.dataset.menu = open ? "1" : "";
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={ref} className="site-header" data-tone="clear">
      <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
        <a href="#inicio" className="flex items-baseline gap-3 no-underline" aria-label="FM Arquitetura e Interiores, início">
          <span className="display text-[28px] leading-none italic">FM</span>
          <span className="label hidden text-[10.5px] opacity-80 sm:inline">Arquitetura e Interiores</span>
        </a>
        <nav aria-label="Seções" className="hidden items-center gap-8 text-[14.5px] lg:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="ulink" aria-current={active === n.href ? "true" : undefined}>{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href={whatsappHref} target="_blank" rel="noopener" className="ulink hidden text-[14.5px] md:inline">Fale sobre seu projeto</a>
          <button
            type="button"
            className="relative h-11 w-11 lg:hidden"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`absolute left-2.5 right-2.5 h-px bg-current transition-transform duration-500 ${open ? "top-1/2 rotate-45" : "top-[17px]"}`} />
            <span className={`absolute left-2.5 right-2.5 h-px bg-current transition-transform duration-500 ${open ? "top-1/2 -rotate-45" : "top-[26px]"}`} />
          </button>
        </div>
      </div>
      <div
        id="menu"
        className={`fixed inset-x-0 bottom-0 top-[var(--header-h)] bg-paper text-ink transition-[opacity,visibility] duration-500 lg:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      >
        <nav aria-label="Menu" className="wrap flex flex-col gap-1 pt-8">
          {nav.map((n, i) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="display border-b border-line py-4 text-[2.1rem] leading-tight no-underline transition-transform duration-700"
              style={{ transform: open ? "none" : "translateY(14px)", transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
            >
              {n.label}
            </a>
          ))}
          <a href={whatsappHref} target="_blank" rel="noopener" className="btn btn-plum mt-8 self-start" onClick={() => setOpen(false)}>
            Fale sobre seu projeto <span className="arr" aria-hidden="true">→</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
