// Procedural 3D props for the store: Arabic-style perfume bottles and jewellery.
// Units: a bottle is about 1.2 tall; jewellery about 1 across.
export function goldMat(THREE, tone = "#d6a54e") {
  return new THREE.MeshPhysicalMaterial({ color: tone, metalness: 1, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.1 });
}

function star8(THREE, r1, r2) {
  const s = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + Math.PI / 16, r = i % 2 ? r2 : r1;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i ? s.lineTo(x, y) : s.moveTo(x, y);
  }
  s.closePath();
  return s;
}

// opts: shape 'oct' | 'round' | 'slim'; glass, liquid, gold colours; cap 'crown' | 'dome' | 'block'
export function makePerfume(THREE, opts = {}) {
  const o = Object.assign({ shape: "oct", glass: "#f3e3c8", liquid: "#c9822b", gold: "#d6a54e", cap: "crown" }, opts);
  const seg = o.shape === "round" ? 64 : 8;
  const g = new THREE.Group();
  const gold = goldMat(THREE, o.gold);
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#ffffff", metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.22, ior: 1.52,
    attenuationColor: new THREE.Color(o.glass), attenuationDistance: 2.2, clearcoat: 1, clearcoatRoughness: 0.02,
    specularIntensity: 1, envMapIntensity: 1.4, flatShading: seg === 8,
  });
  const liquid = new THREE.MeshPhysicalMaterial({ color: o.liquid, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, flatShading: seg === 8 });

  const W = o.shape === "slim" ? 0.3 : 0.42, H = o.shape === "slim" ? 0.82 : 0.62;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.9, W, H, seg, 1), glass);
  body.position.y = H / 2; g.add(body);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.42, W * 0.9, 0.12, seg, 1), glass);
  shoulder.position.y = H + 0.06; g.add(shoulder);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(W, W * 1.02, 0.06, seg, 1), glass);
  base.position.y = 0.03; g.add(base);
  const juice = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.7, W * 0.76, H * 0.68, seg, 1), liquid);
  juice.position.y = 0.1 + (H * 0.68) / 2; g.add(juice);

  // gold band at the shoulder and an eight-point star medallion on the front
  const goldFront = gold.clone(); goldFront.transparent = true;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(W * 0.905, W * 0.905, 0.045, seg, 1, true), goldFront);
  band.position.y = H - 0.02; g.add(band);
  const medal = new THREE.Mesh(new THREE.ExtrudeGeometry(star8(THREE, 0.11, 0.075), { depth: 0.02, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 2 }), goldFront);
  const front = seg === 8 ? Math.cos(Math.PI / 8) * W * 0.95 : W * 0.95;
  medal.position.set(0, H * 0.52, front); g.add(medal);
  const medalIn = new THREE.Mesh(new THREE.CircleGeometry(0.045, 32), new THREE.MeshPhysicalMaterial({ color: "#7a1f2b", roughness: 0.15, clearcoat: 1, transparent: true }));
  medalIn.position.set(0, H * 0.52, front + 0.032); g.add(medalIn);

  // neck, collar and spray nozzle
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.07, 32), gold);
  neck.position.y = H + 0.155; g.add(neck);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32), gold);
  collar.position.y = H + 0.2; g.add(collar);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.07, 24), gold);
  nozzle.position.y = H + 0.26; g.add(nozzle);
  const tip = new THREE.Vector3(0, H + 0.28, 0.05);

  // cap
  const cap = new THREE.Group();
  const capY = H + 0.17;
  if (o.cap === "crown") {
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.14, 8), gold); c1.position.y = 0.07; cap.add(c1);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.018, 10, 48), gold); ring.rotation.x = Math.PI / 2; ring.position.y = 0.14; cap.add(ring);
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), new THREE.MeshPhysicalMaterial({ color: o.gold, metalness: 1, roughness: 0.16, flatShading: true }));
    ball.position.y = 0.27; cap.add(ball);
    const collar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.06, 8), gold); collar2.position.y = 0.44; cap.add(collar2);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.26, 8), new THREE.MeshPhysicalMaterial({ color: o.gold, metalness: 1, roughness: 0.16, flatShading: true }));
    fin.position.y = 0.6; cap.add(fin);
    const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshPhysicalMaterial({ color: "#8e1b2c", roughness: 0, transmission: 0.6, thickness: 0.2, ior: 2, clearcoat: 1, flatShading: true }));
    jewel.position.set(0, 0.27, 0.16); cap.add(jewel);
  } else if (o.cap === "dome") {
    const pts = [[0, 0], [0.15, 0], [0.16, 0.06], [0.13, 0.1], [0.2, 0.22], [0.18, 0.34], [0.09, 0.44], [0.04, 0.5], [0.05, 0.56], [0, 0.62]].map(([x, y]) => new THREE.Vector2(x, y));
    const d = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), gold); cap.add(d);
  } else {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.3), new THREE.MeshPhysicalMaterial({ color: "#1b1410", roughness: 0.25, clearcoat: 1 }));
    b.position.y = 0.2; cap.add(b);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.32), gold); trim.position.y = 0.04; cap.add(trim);
  }
  cap.position.y = capY; g.add(cap);
  return { group: g, cap, capY, tip, height: H + 0.8 };
}

// type: 'hoop' | 'necklace' | 'ring' | 'bracelet' | 'pearl' | 'drop'
export function makeJewel(THREE, type, opts = {}) {
  const o = Object.assign({ gold: "#d9ae5a", gem: "#2f8f6b" }, opts);
  const g = new THREE.Group();
  const gold = goldMat(THREE, o.gold);
  const gem = new THREE.MeshPhysicalMaterial({ color: o.gem, metalness: 0, roughness: 0, transmission: 0.9, thickness: 0.4, ior: 2.1, clearcoat: 1, flatShading: true, attenuationColor: new THREE.Color(o.gem), attenuationDistance: 0.4 });
  const pearl = new THREE.MeshPhysicalMaterial({ color: "#f4efe6", roughness: 0.18, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color("#ffd9e6"), iridescence: 0.6 });
  if (type === "hoop") {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 24, 96), gold); g.add(hoop);
    const bail = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 10, 24), gold); bail.position.y = -0.48; g.add(bail);
    const drop = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), gem); drop.scale.set(0.85, 1.45, 0.85); drop.position.y = -0.73; g.add(drop);
    for (let i = -3; i <= 3; i++) { const a = -Math.PI / 2 + i * 0.16; const st = new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 0), gem); st.position.set(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0.04); g.add(st); }
    g.userData.gem = drop;
  } else if (type === "necklace") {
    const curve = new THREE.CatmullRomCurve3([[-0.9, 0.55, 0], [-0.7, 0.05, 0.05], [-0.35, -0.35, 0.08], [0, -0.48, 0.1], [0.35, -0.35, 0.08], [0.7, 0.05, 0.05], [0.9, 0.55, 0]].map((p) => new THREE.Vector3(...p)));
    const n = 70;
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = curve.getPoint(t), d = curve.getTangent(t);
      const link = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 16), gold);
      link.position.copy(p); link.lookAt(p.clone().add(d)); link.rotateY(Math.PI / 2); if (i % 2) link.rotateX(Math.PI / 2);
      g.add(link);
    }
    const medal = new THREE.Mesh(new THREE.ExtrudeGeometry(star8(THREE, 0.16, 0.11), { depth: 0.03, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 2 }), gold);
    medal.position.set(0, -0.7, 0.08); g.add(medal);
    const stone = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), gem); stone.position.set(0, -0.7, 0.14); g.add(stone);
    g.userData.gem = stone;
  } else if (type === "ring") {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 24, 96), gold); g.add(band);
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.04, 0.08, 16), gold); seat.position.y = 0.4; g.add(seat);
    const stone = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 1), gem); stone.scale.set(1, 0.8, 1); stone.position.y = 0.53; g.add(stone);
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; const pr = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.14, 8), gold); pr.position.set(Math.cos(a) * 0.1, 0.5, Math.sin(a) * 0.1); pr.rotation.z = Math.cos(a) * -0.3; pr.rotation.x = Math.sin(a) * 0.3; g.add(pr); }
    g.userData.gem = stone;
  } else if (type === "bracelet") {
    const n = 28;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), i % 7 === 0 ? gem : gold); b.position.set(Math.cos(a) * 0.48, Math.sin(a) * 0.48, 0); g.add(b); }
    g.rotation.x = -0.9;
  } else if (type === "pearl") {
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 32), pearl); p.position.set(s * 0.3, 0, 0); g.add(p);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.06, 24), gold); cup.position.set(s * 0.3, 0.21, 0); g.add(cup);
    }
  } else if (type === "drop") {
    for (const s of [-1, 1]) {
      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.014, 10, 48, Math.PI * 1.3), gold); hook.position.set(s * 0.34, 0.42, 0); hook.rotation.z = Math.PI * 0.85; g.add(hook);
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 10), gold); bar.position.set(s * 0.34, 0.16, 0); g.add(bar);
      const st = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 8), gem); st.scale.set(0.75, 1.25, 0.75); st.position.set(s * 0.34, -0.12, 0); g.add(st);
    }
  }
  return g;
}

// photo-studio reflections, warm or cool
export function studioEnv(THREE, renderer, warm = true, roomColor = null) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 30), new THREE.MeshBasicMaterial({ color: roomColor ?? (warm ? 0x120d0a : 0x0d0e10), side: THREE.BackSide }));
  room.position.y = 5; env.add(room);
  const panel = (w, d, x, y, z, c, k, ry = 0, rx = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m);
  };
  panel(10, 1.2, 0, 8, 0, "#ffffff", 6, 0, Math.PI / 2);
  panel(3, 8, -9, 3, 3, warm ? "#ffcf8a" : "#ffffff", 5, Math.PI / 2.6);
  panel(3, 8, 9, 3, 3, "#ffffff", 3, -Math.PI / 2.6);
  panel(8, 3, 0, 2, -12, warm ? "#ff9f4a" : "#9fb8ff", 1.6);
  panel(6, 6, 0, 3, 12, "#ffffff", 1.2, Math.PI);
  const pm = new THREE.PMREMGenerator(renderer);
  const t = pm.fromScene(env, 0.03).texture; pm.dispose(); return t;
}

// KHR_materials_variants: switch the sneaker colourway by name
export async function setVariant(gltf, name) {
  const ext = gltf.userData?.gltfExtensions?.KHR_materials_variants;
  if (!ext) return;
  const idx = ext.variants.findIndex((v) => v.name.toLowerCase() === String(name).toLowerCase());
  const jobs = [];
  gltf.scene.traverse((o) => {
    const map = o.isMesh && o.userData?.gltfExtensions?.KHR_materials_variants;
    if (!map) return;
    if (!o.userData.origMaterial) o.userData.origMaterial = o.material;
    const m = map.mappings.find((mm) => mm.variants.includes(idx));
    if (m) jobs.push(gltf.parser.getDependency("material", m.material).then((mat) => { o.material = mat; gltf.parser.assignFinalMaterial(o); }));
    else o.material = o.userData.origMaterial;
  });
  await Promise.all(jobs);
}
