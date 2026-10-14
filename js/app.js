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
    { id: "biju-argola", cat: "jewel", name: "Argola com gota", note: "Banho dourado, pedra verde", price: 89, tag: "Destaque", opts: ["Par"] },
    { id: "biju-colar", cat: "jewel", name: "Colar estrela", note: "Corrente veneziana, pingente com pedra", price: 119, opts: ["45 cm", "60 cm"] },
    { id: "biju-anel", cat: "jewel", name: "Anel solitário", note: "Zircônia, banho dourado", price: 69, opts: ["14", "16", "18", "20", "22"] },
    { id: "biju-pulseira", cat: "jewel", name: "Pulseira de esferas", note: "Esferas douradas e azuis, elástica", price: 59, opts: ["Única"] },
    { id: "biju-perola", cat: "jewel", name: "Brinco de pérola", note: "Pérola sintética, base dourada", price: 49, opts: ["Par"] },
    { id: "biju-gota", cat: "jewel", name: "Brinco gota violeta", note: "Pedra lapidada, haste dourada", price: 79, opts: ["Par"] },
  ];
  const CAT = { perfume: "Perfume árabe", shoe: "Tênis", jewel: "Bijuteria" };
  const OPT_LABEL = { perfume: "Volume", shoe: "Numeração", jewel: "Tamanho" };
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // grids
  for (const grid of $$(".grid[data-cat]")) {
    for (const p of PRODUCTS.filter((x) => x.cat === grid.dataset.cat)) {
      const el = document.createElement("article");
      el.className = "card";
      el.innerHTML = `
        <button class="card-media" type="button" data-qv="${p.id}" aria-label="Ver ${p.name}">
          <img src="/img/${p.id}.webp" alt="Ilustração 3D: ${p.name}" loading="lazy" width="800" height="1000">
          ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ""}
        </button>
        <div class="card-row"><div><h3>${p.name}</h3><div class="note">${p.note}</div></div><span class="price">${brl(p.price)}</span></div>
        <button class="add" type="button" data-qv="${p.id}">${p.opts.length > 1 ? "Escolher" : "Adicionar"}</button>`;
      grid.appendChild(el);
    }
  }

  // bag
  const KEY = "ambar-sacola";
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { bag = []; }
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
    let total = 0;
    bag.forEach((b, i) => {
      const p = PRODUCTS.find((x) => x.id === b.id); if (!p) return;
      total += p.price * b.q;
      const row = document.createElement("div");
      row.className = "line";
      row.innerHTML = `<img src="/img/${p.id}.webp" alt="">
        <div><div class="t">${p.name}</div><div class="v">${OPT_LABEL[p.cat]}: ${b.opt}</div>
        <div class="qty"><button type="button" data-i="${i}" data-d="-1" aria-label="Diminuir">−</button><span>${b.q}</span><button type="button" data-i="${i}" data-d="1" aria-label="Aumentar">+</button></div></div>
        <span class="price">${brl(p.price * b.q)}</span>`;
      box.appendChild(row);
    });
    $("#total").textContent = brl(total);
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
    let total = 0;
    for (const b of bag) {
      const p = PRODUCTS.find((x) => x.id === b.id); if (!p) continue;
      total += p.price * b.q;
      lines.push(`• ${b.q}x ${p.name} (${OPT_LABEL[p.cat].toLowerCase()} ${b.opt}): ${brl(p.price * b.q)}`);
    }
    lines.push("", `Total: ${brl(total)}`);
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
    $("#qv-img").src = `/img/${p.id}.webp`; $("#qv-img").alt = `Ilustração 3D: ${p.name}`;
    $("#qv-cat").textContent = CAT[p.cat];
    $("#qv-title").textContent = p.name;
    $("#qv-desc").textContent = p.note + ".";
    $("#qv-price").textContent = brl(p.price);
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
    const light = over && over.classList.contains("shelf");
    top.classList.toggle("light", !!light);
    top.classList.toggle("solid", !light && scrollY > 30);
    const sec = over ? (over.id || "").replace("loja-", "") : "";
    $$(".top nav a[data-sec]").forEach((a) => a.classList.toggle("on", a.dataset.sec === sec));
  }
  addEventListener("scroll", headerState, { passive: true });
  headerState();
  paint();
})();
