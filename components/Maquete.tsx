"use client";

import { useEffect, useRef } from "react";
import { steps } from "@/lib/site";

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
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
        dispose = await start(host, progress, reduce);
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
          <ol className="relative mt-0 grid lg:mt-10 lg:gap-6">
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
          <p className="display mt-6 hidden max-w-[34ch] text-[1.15rem] italic leading-snug text-plum lg:mt-12 lg:block">“Cada projeto da FM nasce da escuta, da rotina e da história de quem vai vivê-lo.”</p>
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

async function start(host: HTMLElement, progress: () => number, reduce: boolean): Promise<() => void> {
  const THREE = await import("three");
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const { DRACOLoader } = await import("three/examples/jsm/loaders/DRACOLoader.js");
  const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");

  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");

  const small = () => innerWidth < 1024;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.5 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const PAPER = new THREE.Color("#efe8dd");
  scene.background = PAPER;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pm.dispose();

  const hemi = new THREE.HemisphereLight("#fff4e6", "#b9a68f", 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffe2bf", 2.6);
  sun.position.set(-8, 5.5, -2.5);
  sun.target.position.set(0.5, 0, -0.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small() ? 1024 : 2048, small() ? 1024 : 2048);
  const sc = sun.shadow.camera as InstanceType<typeof THREE.OrthographicCamera>;
  sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6; sc.near = 1; sc.far = 25;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  scene.add(sun, sun.target);

  // clay ↔ material blend, shared by every material in the model
  const uClay = { value: 1 };
  const CLAY = "vec3(0.93, 0.915, 0.89)";
  const clayify = (m: InstanceType<typeof THREE.Material>) => {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uClay = uClay;
      sh.fragmentShader = "uniform float uClay;\n" + sh.fragmentShader.replace(
        "#include <map_fragment>",
        `#include <map_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, ${CLAY}, uClay);`,
      );
    };
    m.needsUpdate = true;
  };

  // ----- room shell (cutaway: floor, back wall, window wall) -----
  const X0 = -3.2, X1 = 3.2, Z0 = -3.0, Z1 = 3.2, HT = 2.85, T = 0.16;
  const plankTex = (() => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 512;
    const g = c.getContext("2d")!;
    const rows = 16;
    for (let r = 0; r < rows; r++) {
      let x = (r % 3) * -90;
      while (x < 512) {
        const w = 220 + ((r * 37 + x) % 120);
        const l = 58 + ((r * 13 + x) % 9);
        g.fillStyle = `hsl(32 38% ${l}%)`; g.fillRect(x, r * 32, w, 32);
        g.fillStyle = "rgba(60,40,20,.25)"; g.fillRect(x, r * 32, 1.5, 32);
        x += w;
      }
      g.fillStyle = "rgba(60,40,20,.22)"; g.fillRect(0, r * 32, 512, 1);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 2.2); t.anisotropy = 4;
    return t;
  })();
  const floorMat = new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.55 });
  clayify(floorMat);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 0.08, Z1 - Z0), floorMat);
  floor.position.set((X0 + X1) / 2, -0.04, (Z0 + Z1) / 2); floor.receiveShadow = true; scene.add(floor);

  // walls start as plan lines (ink) and rise into plaster
  const INK = new THREE.Color("#24211f"), PLASTER = new THREE.Color("#ece6dc");
  const wallMat = new THREE.MeshStandardMaterial({ color: INK.clone(), roughness: 0.92 });
  const walls = new THREE.Group(); scene.add(walls);
  const wall = (w: number, d: number, x: number, z: number, h = HT, y0 = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.geometry.translate(0, h / 2 + y0, 0);
    m.position.set(x, 0, z); m.castShadow = m.receiveShadow = true; walls.add(m);
    return m;
  };
  wall(X1 - X0 + T, T, (X0 + X1) / 2, Z0 - T / 2);              // back
  const WZ0 = -2.3, WZ1 = 1.5, WH = 2.62;                        // window on the left wall
  wall(T, WZ0 - Z0, X0 - T / 2, (Z0 + WZ0) / 2);
  wall(T, Z1 - WZ1, X0 - T / 2, (WZ1 + Z1) / 2);
  wall(T, WZ1 - WZ0, X0 - T / 2, (WZ0 + WZ1) / 2, HT - WH, WH);
  const frameMat = new THREE.MeshStandardMaterial({ color: "#2b2a28", roughness: 0.45, metalness: 0.5 });
  clayify(frameMat);
  for (let i = 0; i <= 3; i++) {
    const z = WZ0 + ((WZ1 - WZ0) * i) / 3;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, WH, 0.045), frameMat);
    b.geometry.translate(0, WH / 2, 0); b.position.set(X0 - T / 2, 0, z); b.castShadow = true; walls.add(b);
  }
  // slatted wood wall behind the sofa
  const slatMat = new THREE.MeshStandardMaterial({ color: "#7d5436", roughness: 0.55 });
  clayify(slatMat);
  const slatGeo = new THREE.BoxGeometry(0.04, HT, 0.03); slatGeo.translate(0, HT / 2, 0);
  const nSl = Math.floor((1.95 + 1.75) / 0.062);
  const slats = new THREE.InstancedMesh(slatGeo, slatMat, nSl);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < nSl; i++) { mtx.makeTranslation(-1.75 + i * 0.062 + 0.02, 0, Z0 + 0.016); slats.setMatrixAt(i, mtx); }
  slats.castShadow = slats.receiveShadow = true; walls.add(slats);

  // ----- furniture -----
  const furniture: { obj: InstanceType<typeof THREE.Object3D>; delay: number; y: number }[] = [];
  const addF = (obj: InstanceType<typeof THREE.Object3D>, delay: number) => {
    obj.traverse((o) => {
      const mesh = o as InstanceType<typeof THREE.Mesh>;
      if (mesh.isMesh) {
        mesh.castShadow = mesh.receiveShadow = true;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach(clayify);
      }
    });
    obj.visible = false;
    furniture.push({ obj, delay, y: obj.position.y });
    scene.add(obj);
  };
  const rug = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.012, 2.3), new THREE.MeshStandardMaterial({ color: "#d9cdb9", roughness: 1 }));
  rug.position.set(0.2, 0.006, -1.25); addF(rug, 0);
  const stone = new THREE.MeshStandardMaterial({ color: "#d8c9b1", roughness: 0.6 });
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.34, 64), stone);
  table.position.set(0.15, 0.17, -1.15); addF(table, 0.35);
  const side = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 48), new THREE.MeshStandardMaterial({ color: "#5e3e29", roughness: 0.5 }));
  side.position.set(0.85, 0.13, -1.45); addF(side, 0.45);
  const lamp = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: "#2b2a28", roughness: 0.4, metalness: 0.6 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.45, 12), dark); pole.position.y = 0.75;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 32), dark); base.position.y = 0.015;
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 0.3, 48, 1, true), new THREE.MeshStandardMaterial({ color: "#efe4d2", roughness: 0.9, side: THREE.DoubleSide, emissive: "#ffcf96", emissiveIntensity: 0 }));
  shade.position.y = 1.55;
  lamp.add(pole, base, shade); lamp.position.set(2.55, 0, -2.35); addF(lamp, 0.6);

  const draco = new DRACOLoader(); draco.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/");
  const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
  const glb = (name: string) => loader.loadAsync(`/3d/${name}.glb`).then((g) => g.scene);
  const recolor = (root: InstanceType<typeof THREE.Object3D>, key: string, hex: string) => root.traverse((o) => {
    const mesh = o as InstanceType<typeof THREE.Mesh>;
    if (!mesh.isMesh) return;
    for (const m of (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as InstanceType<typeof THREE.MeshPhysicalMaterial>[]) {
      if (m.name.toLowerCase().includes(key)) { m.color = new THREE.Color(hex); if (m.sheenColor) m.sheenColor = new THREE.Color(hex); }
    }
  });
  const placed = Promise.all([
    glb("GlamVelvetSofa").then((s) => { recolor(s, "fabric", "#4a2241"); s.position.set(0.15, 0, -2.35); addF(s, 0.1); }),
    glb("ChairDamaskPurplegold").then((s) => { s.scale.setScalar(1.08); s.position.set(-1.55, 0, -0.75); s.rotation.y = THREE.MathUtils.degToRad(68); addF(s, 0.2); }),
    glb("SheenChair").then((s) => { recolor(s, "fabric", "#cdbca3"); s.scale.setScalar(1.08); s.position.set(1.95, 0, -0.55); s.rotation.y = THREE.MathUtils.degToRad(-72); addF(s, 0.3); }),
    glb("DiffuseTransmissionPlant").then((s) => { s.scale.setScalar(1.9); s.position.set(-2.55, 0, -2.45); s.rotation.y = 0.35; addF(s, 0.5); }),
  ]);
  placed.catch(() => {});

  // ----- camera path -----
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
  const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const lerp3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
  const PLAN = { pos: [0.1, 12.5, 0.12], look: [0.1, 0, 0.1] };
  const ISO = { pos: [6.4, 5.8, 7.6], look: [-0.1, 0.55, -0.6] };
  const END = { pos: [4.7, 3.1, 7.5], look: [-0.2, 0.9, -0.8] };

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  resize();
  addEventListener("resize", resize);

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(host);

  let shown = false, raf = 0;
  const clock = new THREE.Clock();
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    const p = reduce ? 1 : progress();
    const rise = sm(0.16, 0.42, p), drop = sm(0.44, 0.72, p), mat = sm(0.74, 0.95, p);
    // walls: plan line → full height, ink → plaster
    walls.scale.y = 0.012 + rise * 0.988;
    wallMat.color.copy(INK).lerp(PLASTER, sm(0.18, 0.36, p));
    slats.visible = rise > 0.6;
    // furniture lands one by one
    for (const f of furniture) {
      const k = sm(f.delay * 0.6, f.delay * 0.6 + 0.4, drop);
      f.obj.visible = k > 0.001;
      f.obj.position.y = f.y + (1 - k) * 1.6;
    }
    uClay.value = 1 - mat;
    (shade.material as InstanceType<typeof THREE.MeshStandardMaterial>).emissiveIntensity = mat * 1.4;
    scene.background = PAPER;
    hemi.intensity = 0.9 - mat * 0.15;
    sun.intensity = 1.2 + rise * 1.4;
    // camera: top-down plan → three-quarter → closer, with a slow breath
    const a = sm(0.12, 0.46, p), b = sm(0.7, 1, p);
    let pos = lerp3(PLAN.pos, ISO.pos, a), look = lerp3(PLAN.look, ISO.look, a);
    pos = lerp3(pos, END.pos, b); look = lerp3(look, END.look, b);
    const portrait = camera.aspect < 1;
    const k = portrait ? 1.55 : camera.aspect < 1.35 ? 1.15 : 1;
    const breathe = reduce ? 0 : Math.sin(t * 0.3) * 0.18 * a;
    camera.position.set(look[0] + (pos[0] - look[0]) * k + breathe, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k);
    camera.lookAt(look[0], look[1], look[2]);
    renderer.render(scene, camera);
    if (!shown) { shown = true; host.dataset.gl = "on"; }
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", resize);
    renderer.dispose(); renderer.domElement.remove();
  };
}
