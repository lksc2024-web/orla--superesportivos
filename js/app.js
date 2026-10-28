// Store UI: product grids, quick view, bag (kept in this browser) and checkout message for WhatsApp.
(() => {
  const NUM_F = ["33", "34", "35", "36", "37", "38", "39", "40"];
  const NUM_T = ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44"];
  const PRODUCTS = [
    // perfumes: the featured one first (shown wide), then the shelf
    { id: "sauvage", cat: "perfume", name: "Dior Sauvage", note: "Eau de Parfum", tag: "Destaque", opts: ["100 ml"], wide: true, price: null },
    { id: "p-chanel5", cat: "perfume", name: "Chanel Nº5", note: "Eau de Parfum", opts: ["100 ml"], price: null },
    { id: "p-bleu", cat: "perfume", name: "Bleu de Chanel", note: "Eau de Parfum", opts: ["100 ml"], price: null },
    { id: "p-eros", cat: "perfume", name: "Versace Eros", note: "Masculino", opts: ["100 ml"], price: null },
    { id: "p-oudwood", cat: "perfume", name: "Tom Ford Oud Wood", note: "Eau de Parfum", opts: ["100 ml"], price: null },
    { id: "p-libre", cat: "perfume", name: "Yves Saint Laurent Libre", note: "Feminino", opts: ["90 ml"], price: null },
    { id: "p-aventus", cat: "perfume", name: "Creed Aventus", note: "Masculino", opts: ["100 ml"], price: null },
    // shoes: per category, the featured photo first and the variations after it
    { id: "s-tenis", cat: "shoe", sub: "tenis", name: "Tênis branco clássico", note: "Couro, solado alto", tag: "Destaque", opts: NUM_T, price: null },
    { id: "m-tenis-1", cat: "shoe", sub: "tenis", name: "Tênis preto listrado", note: "Esportivo", opts: NUM_T, price: null },
    { id: "m-tenis-2", cat: "shoe", sub: "tenis", name: "Tênis cinza", note: "Casual", opts: NUM_T, price: null },
    { id: "m-tenis-3", cat: "shoe", sub: "tenis", name: "Tênis colorido", note: "Corrida", opts: NUM_T, price: null },
    { id: "s-sandalia", cat: "shoe", sub: "sandalia", name: "Sandália dourada de salto", note: "Tiras finas, fecho no tornozelo", tag: "Destaque", opts: NUM_F, price: null },
    { id: "m-sandalia-1", cat: "shoe", sub: "sandalia", name: "Sandália trançada off-white", note: "Salto baixo", opts: NUM_F, price: null },
    { id: "m-sandalia-2", cat: "shoe", sub: "sandalia", name: "Sandália preta de fivelas", note: "Salto bloco", opts: NUM_F, price: null },
    { id: "m-sandalia-3", cat: "shoe", sub: "sandalia", name: "Sandália dourada de tiras", note: "Salto bloco", opts: NUM_F, price: null },
    { id: "s-sapatilha", cat: "shoe", sub: "sapatilha", name: "Sapatilha matelassê nude", note: "Laço na frente", tag: "Destaque", opts: NUM_F, price: null },
    { id: "m-sapatilha-1", cat: "shoe", sub: "sapatilha", name: "Sapatilha preta verniz", note: "Laço na frente", opts: NUM_F, price: null },
    { id: "m-sapatilha-2", cat: "shoe", sub: "sapatilha", name: "Sapatilha vermelha verniz", note: "Laço na frente", opts: NUM_F, price: null },
    { id: "m-sapatilha-3", cat: "shoe", sub: "sapatilha", name: "Sapatilha onça", note: "Laço na frente", opts: NUM_F, price: null },
    { id: "s-rasteira", cat: "shoe", sub: "rasteira", name: "Rasteirinha dourada com brilho", note: "Tiras cruzadas", tag: "Destaque", opts: NUM_F, price: null },
    { id: "m-rasteira-1", cat: "shoe", sub: "rasteira", name: "Rasteirinha preta", note: "Tira no tornozelo", opts: NUM_F, price: null },
    { id: "m-rasteira-2", cat: "shoe", sub: "rasteira", name: "Rasteirinha branca", note: "Tiras largas", opts: NUM_F, price: null },
    { id: "m-rasteira-3", cat: "shoe", sub: "rasteira", name: "Rasteirinha dourada", note: "Tiras finas", opts: NUM_F, price: null },
    { id: "s-salto", cat: "shoe", sub: "salto", name: "Scarpin vermelho verniz", note: "Salto fino", tag: "Destaque", opts: NUM_F, price: null },
    { id: "m-salto-1", cat: "shoe", sub: "salto", name: "Scarpin preto verniz", note: "Salto fino", opts: NUM_F, price: null },
    { id: "m-salto-2", cat: "shoe", sub: "salto", name: "Scarpin nude", note: "Salto fino", opts: NUM_F, price: null },
    { id: "m-salto-3", cat: "shoe", sub: "salto", name: "Scarpin prata com brilho", note: "Salto fino", opts: NUM_F, price: null },
    // jewellery: cut out of the store's own photo (native pixels; real = file width/height); price on request
    {"id": "relogio-cravejado", "cat": "jewel", "sub": "relogio", "real": [129, 256], "name": "Relógio prata cravejado", "note": "Pulseira de aço, mostrador branco, aro com strass", "price": null, "opts": ["Única"]},
    {"id": "relogio-quadrado-preto", "cat": "jewel", "sub": "relogio", "real": [109, 184], "name": "Relógio quadrado mostrador preto", "note": "Caixa quadrada, mostrador preto, pulseira de aço", "price": null, "opts": ["Única"]},
    {"id": "colar-torcido-prata", "cat": "jewel", "sub": "colar", "real": [193, 246], "name": "Colar corrente torcida", "note": "Três voltas de corrente torcida, fecho retangular", "price": null, "opts": ["Única"]},
    {"id": "colar-pingente-cristal", "cat": "jewel", "sub": "colar", "real": [107, 297], "name": "Colar elos com pingente de cristal", "note": "Elos alongados, pingente redondo de cristal", "price": null, "opts": ["Única"]},
    {"id": "colar-medalhas-douradas", "cat": "jewel", "sub": "colar", "real": [128, 339], "name": "Colar de medalhas douradas", "note": "Duas voltas com medalhas e flor cravejada", "price": null, "opts": ["Única"]},
    {"id": "colar-elos-dourado-duplo", "cat": "jewel", "sub": "colar", "real": [191, 352], "name": "Colar duplo de elos dourados", "note": "Duas voltas de elos largos, banho dourado", "price": null, "tag": "Destaque", "opts": ["Única"]},
    {"id": "corrente-coracao", "cat": "jewel", "sub": "colar", "real": [144, 306], "name": "Corrente com coração", "note": "Corrente fina com pingente de coração", "price": null, "opts": ["Única"]},
    {"id": "pulseira-coracoes", "cat": "jewel", "sub": "pulseira", "real": [120, 297], "name": "Pulseira com corações", "note": "Elos com pingentes de coração e esfera", "price": null, "opts": ["Única"]},
    {"id": "corrente-flores", "cat": "jewel", "sub": "colar", "real": [124, 307], "name": "Corrente dupla com flores", "note": "Duas correntes finas com flores", "price": null, "opts": ["Única"]},
    {"id": "pulseira-grumet", "cat": "jewel", "sub": "pulseira", "real": [60, 309], "name": "Pulseira grumet prata", "note": "Elos grumet largos, prata", "price": null, "opts": ["Única"]},
    {"id": "corrente-coracao-vazado", "cat": "jewel", "sub": "colar", "real": [72, 276], "name": "Corrente com coração vazado", "note": "Corrente fina, coração vazado", "price": null, "opts": ["Única"]},
    {"id": "corrente-esferas", "cat": "jewel", "sub": "colar", "real": [86, 282], "name": "Corrente gravata com esferas", "note": "Modelo gravata com esferas", "price": null, "opts": ["Única"]},
    {"id": "corrente-trevo-dourada", "cat": "jewel", "sub": "colar", "real": [90, 265], "name": "Corrente dourada com trevo", "note": "Corrente dourada com trevo de cristal", "price": null, "opts": ["Única"]},
    {"id": "corrente-coracao-dourado", "cat": "jewel", "sub": "colar", "real": [116, 284], "name": "Corrente com coração dourado", "note": "Corrente prata com coração dourado", "price": null, "opts": ["Única"]},
    {"id": "pulseira-elos-argola", "cat": "jewel", "sub": "pulseira", "real": [129, 187], "name": "Pulseira de elos com argola", "note": "Elos mistos com argola cravejada", "price": null, "opts": ["Única"]},
    {"id": "pulseira-tubos", "cat": "jewel", "sub": "pulseira", "real": [141, 209], "name": "Pulseira de tubos com pingente", "note": "Tubos prata com pingente de cristal", "price": null, "opts": ["Única"]},
    {"id": "pulseira-cravejada", "cat": "jewel", "sub": "pulseira", "real": [205, 164], "name": "Pulseira cravejada", "note": "Corrente com trecho cravejado", "price": null, "opts": ["Única"]},
    {"id": "pulseira-elos-dupla", "cat": "jewel", "sub": "pulseira", "real": [195, 201], "name": "Pulseira dupla de elos", "note": "Duas voltas de elos", "price": null, "opts": ["Única"]},
    {"id": "pulseira-argola-prata", "cat": "jewel", "sub": "pulseira", "real": [184, 162], "name": "Pulseira de elos com aro", "note": "Elos com aro central cravejado", "price": null, "opts": ["Única"]},
    {"id": "pulseira-elos-prata", "cat": "jewel", "sub": "pulseira", "real": [135, 134], "name": "Pulseira de elos prata", "note": "Elos retangulares, prata", "price": null, "opts": ["Única"]},
    {"id": "pulseira-elos-dourada", "cat": "jewel", "sub": "pulseira", "real": [227, 149], "name": "Pulseira de elos dourada", "note": "Elos retangulares, banho dourado", "price": null, "opts": ["Única"]},
    {"id": "bracelete-prata", "cat": "jewel", "sub": "pulseira", "real": [217, 186], "name": "Bracelete prata", "note": "Bracelete aberto com elos", "price": null, "opts": ["Única"]},
    {"id": "bracelete-dourado", "cat": "jewel", "sub": "pulseira", "real": [196, 181], "name": "Bracelete dourado", "note": "Bracelete rígido, banho dourado", "price": null, "tag": "Destaque", "opts": ["Única"]},
    {"id": "aneis-dourados", "cat": "jewel", "sub": "anel", "real": [134, 88], "name": "Dupla de anéis dourados", "note": "Par de anéis dourados", "price": null, "opts": ["Único"]},
    {"id": "anel-elos-prata", "cat": "jewel", "sub": "anel", "real": [117, 88], "name": "Anel de elos prata", "note": "Anel de elos entrelaçados", "price": null, "opts": ["Único"]},
    {"id": "anel-aro-dourado", "cat": "jewel", "sub": "anel", "real": [110, 104], "name": "Anel aro duplo dourado", "note": "Aro aberto em duas linhas, dourado", "price": null, "opts": ["Único"]},
    {"id": "brinco-trevo-preto", "cat": "jewel", "sub": "brinco", "real": [130, 122], "name": "Brinco trevo preto", "note": "Trevo duplo preto contornado de strass", "price": null, "tag": "Destaque", "opts": ["Par"]},
    {"id": "brinco-perola-gancho", "cat": "jewel", "sub": "brinco", "real": [117, 142], "name": "Brinco de pérola com gancho", "note": "Pérola com gancho dourado", "price": null, "opts": ["Par"]},
    {"id": "brinco-perolas-longo", "cat": "jewel", "sub": "brinco", "real": [104, 212], "name": "Brinco longo de pérolas", "note": "Pérolas e cristais em queda", "price": null, "opts": ["Par"]},
    {"id": "kit-pontos-de-luz", "cat": "jewel", "sub": "brinco", "real": [153, 173], "name": "Kit de brincos ponto de luz", "note": "Pares de ponto de luz, cristal e ametista", "price": null, "opts": ["Kit"]},
    {"id": "argolas-prata", "cat": "jewel", "sub": "brinco", "real": [114, 66], "name": "Argolas prata", "note": "Argolas pequenas, prata", "price": null, "opts": ["Par"]},
    {"id": "argolas-cravejadas", "cat": "jewel", "sub": "brinco", "real": [152, 76], "name": "Argolas cravejadas", "note": "Argolas com cristais", "price": null, "opts": ["Par"]},
    {"id": "brinco-folha-prata", "cat": "jewel", "sub": "brinco", "real": [119, 149], "name": "Brinco folha prata", "note": "Folha prata polida", "price": null, "opts": ["Par"]},
    {"id": "brinco-gota-prata", "cat": "jewel", "sub": "brinco", "real": [102, 134], "name": "Brinco gota prata", "note": "Gota alongada, prata", "price": null, "opts": ["Par"]},
    {"id": "argolas-ovais", "cat": "jewel", "sub": "brinco", "real": [130, 134], "name": "Argolas ovais com pedra", "note": "Argolas ovais com pedra", "price": null, "opts": ["Par"]},
    {"id": "brinco-folhas-vazadas", "cat": "jewel", "sub": "brinco", "real": [94, 121], "name": "Brinco de folhas vazadas", "note": "Folhas vazadas em cascata", "price": null, "opts": ["Par"]},
    {"id": "brinco-folhas-cristal", "cat": "jewel", "sub": "brinco", "real": [85, 100], "name": "Brinco de folhas cristal", "note": "Folhas de cristal", "price": null, "opts": ["Par"]},
    {"id": "brinco-retangular-prata", "cat": "jewel", "sub": "brinco", "real": [90, 94], "name": "Brinco retangular prata", "note": "Retangular com esfera, prata", "price": null, "opts": ["Par"]},
    {"id": "brinco-flor", "cat": "jewel", "sub": "brinco", "real": [42, 86], "name": "Brincos de flor", "note": "Flores pequenas, prata", "price": null, "opts": ["Par"]},
    {"id": "brinco-pedra-da-lua", "cat": "jewel", "sub": "brinco", "real": [102, 56], "name": "Brinco pedra da lua", "note": "Pedra leitosa com borda dourada", "price": null, "opts": ["Par"]},
    {"id": "brinco-triangulo-cristal", "cat": "jewel", "sub": "brinco", "real": [80, 51], "name": "Brinco triângulo cristal", "note": "Cristal triangular, base dourada", "price": null, "opts": ["Par"]},
    {"id": "kit-cristais", "cat": "jewel", "sub": "brinco", "real": [111, 136], "name": "Kit de brincos de cristal", "note": "Pontos de luz de cristal", "price": null, "opts": ["Kit"]},
    {"id": "kit-ametista", "cat": "jewel", "sub": "brinco", "real": [114, 134], "name": "Kit de brincos ametista", "note": "Pontos de luz cor ametista", "price": null, "opts": ["Kit"]},
  ];
  const CAT = { perfume: "Perfume importado", shoe: "Calçado", jewel: "Bijuteria" };
  const SUBS = [["tenis", "Tênis", "Estilo e performance"], ["sandalia", "Sandálias", "Leveza e sofisticação"], ["sapatilha", "Sapatilhas", "Conforto e elegância"], ["rasteira", "Rasteirinhas", "Praticidade com estilo"], ["salto", "Saltos", "Elegância em alta"]];
  const OPT_LABEL = { perfume: "Volume", shoe: "Numeração", jewel: "Tamanho" };
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const img = (p) => (p.real ? `/img/bijus/${p.id}.webp` : `/img/p/${p.id}.webp`);
  const priceTxt = (p, q = 1) => (p.price == null ? "Sob consulta" : brl(p.price * q));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // grids
  function card(p) {
    const el = document.createElement("article");
    el.className = "card" + (p.wide ? " wide" : "");
    if (p.sub) el.dataset.sub = p.sub;
    el.innerHTML = `
      <button class="card-media" type="button" data-qv="${p.id}" aria-label="Ver ${p.name}">
        ${p.real
          ? `<img src="${img(p)}" alt="${p.name}, foto da peça" loading="lazy" width="${p.real[0]}" height="${p.real[1]}" style="--w:${p.real[0]}px">`
          : `<img src="${img(p)}" alt="${p.name}" loading="lazy">`}
        ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ""}
      </button>
      <div class="card-row"><div><h3>${p.name}</h3><div class="note">${p.note}</div></div><span class="price${p.price == null ? " ask" : ""}">${priceTxt(p)}</span></div>
      <button class="add" type="button" data-qv="${p.id}">${p.opts.length > 1 ? "Escolher" : "Adicionar"}</button>`;
    return el;
  }
  for (const grid of $$(".grid[data-cat]")) for (const p of PRODUCTS.filter((x) => x.cat === grid.dataset.cat)) grid.appendChild(card(p));
  const rows = $("[data-shoes]");
  if (rows) for (const [sub, title, line] of SUBS) {
    const box = document.createElement("div");
    box.innerHTML = `<div class="shoe-row-head" id="cat-${sub}"><h3>${title}</h3><span>${line}</span></div><div class="shoe-track"></div>`;
    for (const p of PRODUCTS.filter((x) => x.cat === "shoe" && x.sub === sub)) box.querySelector(".shoe-track").appendChild(card(p));
    rows.appendChild(box);
  }

  // jewellery filter
  for (const b of $$(".cats button")) {
    b.addEventListener("click", () => {
      $$(".cats button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      for (const c of $$(".grid-bijus .card")) c.hidden = !!b.dataset.sub && c.dataset.sub !== b.dataset.sub;
    });
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
    qi.src = img(p); qi.alt = p.real ? `${p.name}, foto da peça` : p.name;
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
    const light = over && over.classList.contains("shelf") && !over.classList.contains("shelf-dark");
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
    // the main necklace hangs from its clasp: each scroll gives it a push and a damped spring swings it back
    let sw = 0, swv = 0, lastY = scrollY, lastT = performance.now();
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
      const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      const dy = scrollY - lastY; lastY = scrollY;
      swv += Math.max(-90, Math.min(90, dy)) * 0.9 * amp;
      swv += (-sw * 38 - swv * 3.2) * dt; sw += swv * dt;
      for (const o of figs) {
        const x = (-px * 34 * o.d + Math.sin(t * 0.5 + o.seed) * 3) * amp;
        const y = ((0.5 - p) * 140 * (o.d - 0.9) + -py * 22 * o.d + Math.cos(t * 0.45 + o.seed) * 4 + (1 - enter) * 90 * o.d) * amp;
        const rot = (px * 4 * o.d + Math.sin(t * 0.3 + o.seed) * 0.8) * amp + (o.grp === "a" ? sw : 0);
        // pieces turn in depth: the main necklace makes a full turn with the scroll, the others sway
        const ry = o.grp === "a" ? p * 360 + Math.sin(t * 0.6) * 6 : (Math.sin(t * 0.55 + o.seed) * 22 + (p - 0.5) * 40 * o.d) * amp;
        const sc = o.grp === "a" ? 1 - 0.05 * focus : 1 + 0.08 * focus;
        o.f.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) perspective(900px) rotateY(${ry.toFixed(2)}deg) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        o.f.style.filter = `brightness(${(0.82 + 0.18 * Math.abs(Math.cos(ry * Math.PI / 180))).toFixed(3)})`;
        o.f.style.setProperty("--g", (sweep - o.d * 18).toFixed(1));
      }
      stageEl.style.setProperty("--lx", (px * 18).toFixed(2));
      stageEl.style.setProperty("--ly", (py * 14 - 6 + p * 10).toFixed(2));
    })(t0);
  }
  headerState();
  paint();
})();
