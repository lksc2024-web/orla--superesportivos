// Store UI: product grids, quick view, bag (kept in this browser) and checkout message for WhatsApp.
(() => {
  const PRODUCTS = [
    { id: "perf-oud", cat: "perfume", name: "Oud Al Layl", note: "Oud, couro e baunilha", price: 289, tag: "Mais pedido", opts: ["100 ml"] },
    { id: "perf-amber", cat: "perfume", name: "Amber Sahra", note: "Âmbar, mel e especiarias", price: 249, opts: ["100 ml"] },
    { id: "perf-taif", cat: "perfume", name: "Rosa de Taif", note: "Rosa, almíscar e açafrão", price: 269, opts: ["100 ml"] },
    { id: "perf-bakhoor", cat: "perfume", name: "Bakhoor Noir", note: "Incenso, oud e patchouli", price: 319, tag: "Intenso", opts: ["100 ml"] },
    { id: "perf-zafaran", cat: "perfume", name: "Zafaran Gold", note: "Açafrão, âmbar e madeira", price: 299, opts: ["100 ml"] },
    { id: "perf-jasmin", cat: "perfume", name: "Jasmim de Medina", note: "Jasmim, flor de laranjeira e musk", price: 229, opts: ["100 ml"] },
    { id: "tenis-midnight", cat: "shoe", name: "Runner Oceano", note: "Malha respirável, solado macio", price: 299, tag: "Destaque", opts: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43"] },
    { id: "tenis-beach", cat: "shoe", name: "Runner Rosé", note: "Malha respirável, solado macio", price: 299, opts: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43"] },
    { id: "tenis-street", cat: "shoe", name: "Runner Preto", note: "Malha respirável, solado macio", price: 299, opts: ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43"] },
    // jewellery: real stock photos cut out from the packaging (native pixels, w/h = file size); price on request
    { id: "pulseira-elos-dourada", cat: "jewel", real: [194, 255], name: "Pulseira de elos dourados", note: "Elos longos com esferas, banho dourado", price: null, tag: "Destaque", opts: ["Única"] },
    { id: "anel-dourado-texturizado", cat: "jewel", real: [110, 116], name: "Anel texturizado", note: "Aro aberto com relevo, dourado", price: null, opts: ["Único"] },
    { id: "ear-cuffs-dourados", cat: "jewel", real: [81, 283], name: "Kit de ear cuffs", note: "Seis peças douradas, encaixe na orelha", price: null, opts: ["Kit"] },
    { id: "anel-dourado-largo", cat: "jewel", real: [113, 110], name: "Anel aro duplo", note: "Aro aberto em duas linhas, dourado", price: null, opts: ["Único"] },
    { id: "anel-dourado-fino", cat: "jewel", real: [107, 103], name: "Anel aro fino", note: "Linhas finas paralelas, dourado", price: null, opts: ["Único"] },
  ];
  const CAT = { perfume: "Perfume árabe", shoe: "Tênis", jewel: "Bijuteria" };
  const OPT_LABEL = { perfume: "Volume", shoe: "Numeração", jewel: "Tamanho" };
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const img = (p) => (p.real ? `/img/bijus/${p.id}.webp` : `/img/${p.id}.webp`);
  const priceTxt = (p, q = 1) => (p.price == null ? "Sob consulta" : brl(p.price * q));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // grids
  for (const grid of $$(".grid[data-cat]")) {
    for (const p of PRODUCTS.filter((x) => x.cat === grid.dataset.cat)) {
      const el = document.createElement("article");
      el.className = "card";
      el.innerHTML = `
        <button class="card-media" type="button" data-qv="${p.id}" aria-label="Ver ${p.name}">
          ${p.real
            ? `<img src="${img(p)}" alt="${p.name}, foto da peça" loading="lazy" width="${p.real[0]}" height="${p.real[1]}" style="--w:${p.real[0]}px">`
            : `<img src="${img(p)}" alt="Ilustração 3D: ${p.name}" loading="lazy" width="800" height="1000">`}
          ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ""}
        </button>
        <div class="card-row"><div><h3>${p.name}</h3><div class="note">${p.note}</div></div><span class="price${p.price == null ? " ask" : ""}">${priceTxt(p)}</span></div>
        <button class="add" type="button" data-qv="${p.id}">${p.opts.length > 1 ? "Escolher" : "Adicionar"}</button>`;
      grid.appendChild(el);
    }
  }

  // bag
  const KEY = "ambar-sacola";
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { bag = []; }
  if (!Array.isArray(bag)) bag = [];
  bag = bag.filter((b) => PRODUCTS.some((x) => x.id === b.id)); // drop items from older versions of the preview
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} };
  function add(id, opt) {
    const hit = bag.find((b) => b.id === id && b.opt === opt);
    if (hit) hit.q += 1; else bag.push({ id, opt, q: 1 });
    save(); paint();
  }
  function paint() {
    const n = bag.reduce((a, b) => a + b.q, 0);
    $("#count").textContent = n;
    const box = $("#items");
    if (!bag.length) { box.innerHTML = `<div class="empty">Sua sacola está vazia.</div>`; $("#total").textContent = brl(0); $("#checkout").disabled = true; return; }
    $("#checkout").disabled = false;
    box.innerHTML = "";
    let total = 0, ask = 0;
    bag.forEach((b, i) => {
      const p = PRODUCTS.find((x) => x.id === b.id); if (!p) return;
      if (p.price == null) ask += b.q; else total += p.price * b.q;
      const row = document.createElement("div");
      row.className = "line";
      row.innerHTML = `<img src="${img(p)}" alt=""${p.real ? ' class="real"' : ""}>
        <div><div class="t">${p.name}</div><div class="v">${OPT_LABEL[p.cat]}: ${b.opt}</div>
        <div class="qty"><button type="button" data-i="${i}" data-d="-1" aria-label="Diminuir">−</button><span>${b.q}</span><button type="button" data-i="${i}" data-d="1" aria-label="Aumentar">+</button></div></div>
        <span class="price${p.price == null ? " ask" : ""}">${priceTxt(p, b.q)}</span>`;
      box.appendChild(row);
    });
    $("#total").textContent = ask ? (total ? `${brl(total)} + sob consulta` : "Sob consulta") : brl(total);
  }
  $("#items").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    const it = bag[+b.dataset.i]; it.q += +b.dataset.d;
    if (it.q <= 0) bag.splice(+b.dataset.i, 1);
    save(); paint();
  });
  const drawer = $("#drawer"), scrim = $("#scrim");
  const openBag = () => { drawer.classList.add("open"); scrim.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); };
  const closeBag = () => { drawer.classList.remove("open"); scrim.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); };
  $("#open-cart").addEventListener("click", openBag);
  $("#close-cart").addEventListener("click", closeBag);
  scrim.addEventListener("click", closeBag);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeBag(); });

  $("#checkout").addEventListener("click", () => {
    if (!bag.length) return;
    const lines = ["Olá! Quero fazer este pedido pela loja Âmbar:", ""];
    let total = 0, ask = false;
    for (const b of bag) {
      const p = PRODUCTS.find((x) => x.id === b.id); if (!p) continue;
      if (p.price == null) ask = true; else total += p.price * b.q;
      lines.push(`• ${b.q}x ${p.name} (${OPT_LABEL[p.cat].toLowerCase()} ${b.opt}): ${p.price == null ? "valor a confirmar" : brl(p.price * b.q)}`);
    }
    lines.push("", ask ? (total ? `Total: ${brl(total)} + itens com valor a confirmar` : "Pode me passar os valores?") : `Total: ${brl(total)}`);
    const url = `https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;
    window.__lastOrder = url;
    window.open(url, "_blank", "noopener");
  });

  // quick view
  const qv = $("#qv");
  let cur = null, curOpt = null;
  function openQV(id) {
    const p = PRODUCTS.find((x) => x.id === id); if (!p) return;
    cur = p; curOpt = p.opts.length === 1 ? p.opts[0] : null;
    const qi = $("#qv-img");
    qi.src = img(p); qi.alt = p.real ? `${p.name}, foto da peça` : `Ilustração 3D: ${p.name}`;
    qi.classList.toggle("real", !!p.real); qi.style.padding = "";
    $("#qv-cat").textContent = CAT[p.cat];
    $("#qv-title").textContent = p.name;
    $("#qv-desc").textContent = p.note + ".";
    $("#qv-price").textContent = p.price == null ? "Valor sob consulta" : brl(p.price);
    $("#qv-opt-label").textContent = OPT_LABEL[p.cat];
    $("#qv-msg").textContent = "";
    const box = $("#qv-opts"); box.innerHTML = "";
    for (const o of p.opts) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = o; b.setAttribute("aria-pressed", String(o === curOpt));
      b.addEventListener("click", () => { curOpt = o; $$("button", box).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); $("#qv-msg").textContent = ""; });
      box.appendChild(b);
    }
    if (typeof qv.showModal === "function") qv.showModal(); else qv.setAttribute("open", "");
    if (p.real) {
      // show the photo at up to 1.6x its own pixels, centred, instead of stretching it to the frame
      const r = qi.getBoundingClientRect(), k = Math.min(1.6, (r.width * 0.8) / p.real[0], (r.height * 0.8) / p.real[1]);
      qi.style.padding = `${Math.max(0, (r.height - p.real[1] * k) / 2)}px ${Math.max(0, (r.width - p.real[0] * k) / 2)}px`;
    }
  }
  document.addEventListener("click", (e) => { const t = e.target.closest("[data-qv]"); if (t) openQV(t.dataset.qv); });
  $("#qv-close").addEventListener("click", () => qv.close());
  qv.addEventListener("click", (e) => { if (e.target === qv) qv.close(); });
  $("#qv-add").addEventListener("click", () => {
    if (!curOpt) { $("#qv-msg").textContent = `Escolha ${OPT_LABEL[cur.cat].toLowerCase()} antes de adicionar.`; return; }
    add(cur.id, curOpt);
    qv.close(); openBag();
  });

  // header: light over the shelves, dark over the 3D stages; nav follows the section
  const top = $("#top");
  const shelves = $$(".shelf"), stages = $$(".stage");
  function headerState() {
    const y = 34;
    const over = [...shelves, ...stages, $(".foot")].find((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    const light = over && (over.classList.contains("shelf") || over.classList.contains("stage-light"));
    top.classList.toggle("light", !!light);
    top.classList.toggle("solid", !light && scrollY > 30);
    const sec = over ? (over.id || "").replace("loja-", "") : "";
    $$(".top nav a[data-sec]").forEach((a) => a.classList.toggle("on", a.dataset.sec === sec));
  }
  addEventListener("scroll", headerState, { passive: true });

  // stage captions and meters also run here, so the text still shows if the 3D module can't load
  const stageEls = $$(".stage");
  function stageText() {
    for (const el of stageEls) {
      const r = el.getBoundingClientRect(), p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      for (const st of $$(".step", el)) st.classList.toggle("on", p >= +st.dataset.from && p < +st.dataset.to);
      const bar = $(".meter .bar i", el); if (bar) bar.style.transform = `scaleX(${p})`;
    }
  }
  addEventListener("scroll", stageText, { passive: true }); stageText();

  // jewellery vitrine: each photo is a layer; scroll, pointer (or device tilt) and a slow drift move them by depth
  const vit = $("#bijus"), stageEl = $("#jstage");
  if (vit && stageEl) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const amp = reduce ? 0.35 : 1;
    const figs = $$(".jp", stageEl).map((f) => {
      const im = $("img", f);
      f.style.setProperty("--w", im.getAttribute("width") + "px");
      f.style.setProperty("--h", im.getAttribute("height") + "px");
      f.style.setProperty("--src", `url("${im.getAttribute("src")}")`);
      f.style.setProperty("--d", f.dataset.depth);
      return { f, d: +f.dataset.depth, grp: f.dataset.grp, seed: Math.random() * 6.28 };
    });
    let tx = 0, ty = 0, px = 0, py = 0;
    addEventListener("pointermove", (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
    addEventListener("deviceorientation", (e) => {
      if (e.gamma == null) return;
      tx = Math.max(-0.5, Math.min(0.5, e.gamma / 50)); ty = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60));
    }, { passive: true });
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    let on = false;
    new IntersectionObserver(([en]) => { on = en.isIntersecting; }).observe(vit);
    const t0 = performance.now();
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!on) return;
      const t = (now - t0) / 1000;
      px += (tx - px) * 0.06; py += (ty - py) * 0.06;
      const r = vit.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      const enter = sm(-0.9, 0, -r.top / innerHeight);          // 0 while the section slides in, 1 once pinned
      const focus = sm(0.42, 0.6, p);                            // second step: rings and cuffs come forward
      const sweep = -40 + ((p * 1.6 + t * 0.07) % 1) * 180;      // light band across the gold
      for (const o of figs) {
        const x = (-px * 34 * o.d + Math.sin(t * 0.5 + o.seed) * 3) * amp;
        const y = ((0.5 - p) * 140 * (o.d - 0.9) + -py * 22 * o.d + Math.cos(t * 0.45 + o.seed) * 4 + (1 - enter) * 90 * o.d) * amp;
        const rot = (px * 4 * o.d + Math.sin(t * 0.3 + o.seed) * 0.8) * amp;
        const sc = o.grp === "a" ? 1 - 0.05 * focus : 1 + 0.08 * focus;
        o.f.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        o.f.style.setProperty("--g", (sweep - o.d * 18).toFixed(1));
      }
      stageEl.style.setProperty("--lx", (px * 18).toFixed(2));
      stageEl.style.setProperty("--ly", (py * 14 - 6 + p * 10).toFixed(2));
    })(t0);
  }
  headerState();
  paint();
})();
