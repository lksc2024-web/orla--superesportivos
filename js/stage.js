// One WebGL canvas behind the pinned 3D stages: perfume (cap opens and sprays) and sneaker.
// Each stage's scroll progress drives its scene; only the stage on screen is rendered.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { makePerfume, studioEnv, setVariant } from "./lib3d.js";

const canvas = document.getElementById("gl");
const small = () => innerWidth <= 760;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

const stages = [...document.querySelectorAll(".stage")].map((el) => ({
  el, kind: el.dataset.stage, steps: [...el.querySelectorAll(".step")], bar: el.querySelector(".meter .bar i"), p: 0,
}));

// step text and meters work even without WebGL
function readStages() {
  const vh = innerHeight;
  let best = null, bestCover = 0;
  for (const s of stages) {
    const r = s.el.getBoundingClientRect();
    s.p = clamp(-r.top / Math.max(1, r.height - vh));
    const cover = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    if (cover > bestCover) { bestCover = cover; best = s; }
    for (const st of s.steps) st.classList.toggle("on", s.p >= +st.dataset.from && s.p < +st.dataset.to);
    if (s.bar) s.bar.style.transform = `scaleX(${s.p})`;
  }
  return bestCover > 0 ? best : null;
}
addEventListener("scroll", readStages, { passive: true });
readStages();

let renderer;
try {
  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
} catch (e) {
  renderer = null; // posters stay visible
}

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, small() ? 1.25 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
  const envWarm = studioEnv(THREE, renderer, true);
  const envCool = studioEnv(THREE, renderer, false);

  function softTex(stops) {
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const dotTex = softTex([[0, "rgba(255,255,255,1)"], [0.35, "rgba(255,255,255,0.5)"], [1, "rgba(255,255,255,0)"]]);
  function floor(scene, glow, shadowScale) {
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: softTex([[0, glow], [1, "rgba(0,0,0,0)"]]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    pool.rotation.x = -Math.PI / 2; scene.add(pool);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: softTex([[0, "rgba(0,0,0,0.7)"], [0.5, "rgba(0,0,0,0.25)"], [1, "rgba(0,0,0,0)"]]), transparent: true, depthWrite: false, toneMapped: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; sh.scale.setScalar(shadowScale); scene.add(sh);
    return sh;
  }
  // particle system with per-particle size and alpha
  function particles(n, color, blending = THREE.AdditiveBlending) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(n), 1));
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(n), 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: dotTex }, color: { value: new THREE.Color(color) }, scale: { value: 300 } },
      vertexShader: `attribute float aSize; attribute float aAlpha; varying float vA; uniform float scale;
        void main(){ vA = aAlpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = aSize * scale / -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 color; varying float vA;
        void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(color, t.a * vA); }`,
      transparent: true, depthWrite: false, blending,
    });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
    return pts;
  }

  // ---------- perfume ----------
  const perfume = (() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#120d0a"); scene.environment = envWarm; scene.environmentIntensity = 1.2;
    const key = new THREE.DirectionalLight("#ffd9a8", 1.6); key.position.set(-2, 4, 3); scene.add(key);
    floor(scene, "rgba(255,190,120,0.18)", 2.2);
    const b = makePerfume(THREE, { shape: "oct", glass: "#f4e1c0", liquid: "#a5531a", cap: "crown" });
    const S = 1.35; b.group.scale.setScalar(S); scene.add(b.group);
    b.group.traverse((o) => { if (o.isMesh && o.material.transmission) { o.material.envMapIntensity = 0.5; o.material.clearcoat = 0.4; o.material.specularIntensity = 0.6; } });
    // the cap leaves the bottle, so it lives in world space
    b.group.remove(b.cap); b.cap.scale.setScalar(S); scene.add(b.cap);

    // spray
    const N = 1800, sp = particles(N, "#fbeedd", THREE.NormalBlending); scene.add(sp);
    const P = { pos: new Float32Array(N * 3), vel: new Float32Array(N * 3), age: new Float32Array(N).fill(99), life: new Float32Array(N), size: new Float32Array(N) };
    let head = 0;
    function emit(count, origin, dir) {
      for (let k = 0; k < count; k++) {
        const i = head; head = (head + 1) % N;
        const spread = 0.42, sx = (Math.random() - 0.5) * spread, sy = (Math.random() - 0.5) * spread, sz = (Math.random() - 0.5) * spread;
        const v = new THREE.Vector3(dir.x + sx, dir.y + sy, dir.z + sz).normalize().multiplyScalar(1.8 + Math.random() * 2.4);
        P.pos.set([origin.x, origin.y, origin.z], i * 3); P.vel.set([v.x, v.y, v.z], i * 3);
        P.age[i] = 0; P.life[i] = 1.3 + Math.random() * 1.6; P.size[i] = Math.random() < 0.05 ? 0.012 : 0.03 + Math.random() * 0.05;
      }
    }
    // floating gold dust for atmosphere
    const D = 260, dust = particles(D, "#e9c27a"); scene.add(dust);
    const dpos = dust.geometry.attributes.position.array, dsz = dust.geometry.attributes.aSize.array, dal = dust.geometry.attributes.aAlpha.array, dseed = new Float32Array(D);
    for (let i = 0; i < D; i++) { dpos.set([(Math.random() - 0.5) * 7, Math.random() * 4, (Math.random() - 0.5) * 4 - 0.5], i * 3); dsz[i] = 0.01 + Math.random() * 0.025; dseed[i] = Math.random() * 10; }

    const tipW = new THREE.Vector3(), dir = new THREE.Vector3();
    let sprayClock = 0, pulse = 0;
    return {
      scene,
      frame: { wide: { pos: [0, 1.45, 7.0], look: [0, 1.1, 0], fov: 30, shift: [-0.2, 0] }, tall: { pos: [0, 1.6, 8.4], look: [0, 1.25, 0], fov: 36, shift: [0, 0.2] } },
      update(p, t, dt) {
        const g = b.group;
        const spray = smooth(0.5, 0.56, p) * (1 - smooth(0.8, 0.86, p));
        g.rotation.y = 0.55 + p * 1.1 + Math.sin(t * 0.4) * 0.08 - spray * 0.4;
        g.rotation.z = -0.06 * spray;
        // cap: lifts off with a spin, then arcs down and lies on the floor beside the bottle
        const up = smooth(0.24, 0.36, p), aside = smooth(0.35, 0.5, p);
        const rest = small() ? [-0.8, 0.8] : [-1.35, 0.45];
        const liftY = (b.capY + up * 0.35) * S;
        b.cap.position.set(rest[0] * aside, liftY * (1 - aside) + 0.21 * aside + Math.sin(aside * Math.PI) * 0.35, rest[1] * aside);
        b.cap.rotation.set(0, g.rotation.y + up * Math.PI * 2 + aside * 0.8, aside * Math.PI / 2);
        // spray: steady mist plus a stronger burst on each press
        if (spray > 0.01) {
          sprayClock += dt;
          if (sprayClock > 1.1) { sprayClock = 0; pulse = 1; }
        } else { sprayClock = 0.9; }
        pulse = Math.max(0, pulse - dt * 3.2);
        g.updateMatrixWorld(true);
        tipW.copy(b.tip).applyMatrix4(g.matrixWorld);
        dir.set(0.55, 0.42, 0.75).normalize();
        if (spray > 0.01) emit(Math.floor((40 * spray + 220 * pulse) * dt * 10), tipW, dir);
        const pos = sp.geometry.attributes.position.array, sz = sp.geometry.attributes.aSize.array, al = sp.geometry.attributes.aAlpha.array;
        for (let i = 0; i < N; i++) {
          if (P.age[i] > P.life[i]) { al[i] = 0; continue; }
          P.age[i] += dt;
          const k = i * 3, drag = Math.exp(-dt * 1.7);
          P.vel[k] *= drag; P.vel[k + 1] = P.vel[k + 1] * drag + 0.18 * dt; P.vel[k + 2] *= drag;
          P.pos[k] += P.vel[k] * dt; P.pos[k + 1] += P.vel[k + 1] * dt; P.pos[k + 2] += P.vel[k + 2] * dt;
          pos[k] = P.pos[k]; pos[k + 1] = P.pos[k + 1]; pos[k + 2] = P.pos[k + 2];
          const a = P.age[i] / P.life[i];
          sz[i] = P.size[i] * (1 + a * 7);
          al[i] = Math.sin(Math.min(a * 6, 1) * Math.PI / 2) * (1 - a) * (1 - a) * (P.size[i] < 0.02 ? 0.9 : 0.22);
        }
        sp.geometry.attributes.position.needsUpdate = sp.geometry.attributes.aSize.needsUpdate = sp.geometry.attributes.aAlpha.needsUpdate = true;
        for (let i = 0; i < D; i++) {
          const k = i * 3; dpos[k + 1] += dt * 0.05; if (dpos[k + 1] > 4) dpos[k + 1] = 0;
          dal[i] = 0.25 + 0.25 * Math.sin(t * 1.3 + dseed[i]);
        }
        dust.geometry.attributes.position.needsUpdate = dust.geometry.attributes.aAlpha.needsUpdate = true;
        return { push: 0.06 * smooth(0.8, 1, p) };
      },
    };
  })();

  // ---------- sneaker ----------
  const shoe = (() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#15161a"); scene.environment = envCool; scene.environmentIntensity = 1.0;
    const key = new THREE.DirectionalLight("#ffffff", 2.2); key.position.set(-3, 5, 4); scene.add(key);
    const rim = new THREE.DirectionalLight("#c9a25a", 1.4); rim.position.set(4, 2, -3); scene.add(rim);
    const sh = floor(scene, "rgba(150,170,210,0.12)", 3);
    const holder = new THREE.Group(); scene.add(holder);
    let gltf = null;
    const d = new DRACOLoader(); d.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/");
    const l = new GLTFLoader(); l.setDRACOLoader(d);
    l.load("/shoe.glb", async (g) => { gltf = g; g.scene.scale.setScalar(7.2); holder.add(g.scene); await setVariant(g, "midnight"); });
    for (const btn of document.querySelectorAll(".chips3d button")) {
      btn.addEventListener("click", async () => {
        document.querySelectorAll(".chips3d button").forEach((x) => x.setAttribute("aria-pressed", String(x === btn)));
        if (gltf) await setVariant(gltf, btn.dataset.variant);
      });
    }
    return {
      scene,
      frame: { wide: { pos: [0, 1.35, 5.5], look: [0, 0.6, 0], fov: 30, shift: [-0.2, 0] }, tall: { pos: [0, 2.0, 8.2], look: [0, 0.7, 0], fov: 40, shift: [0, 0.2] } },
      update(p, t) {
        // a full turn with the scroll plus a few strides: heel-toe rock and small hops
        const strides = Math.sin(p * Math.PI * 6);
        const hop = Math.abs(strides) * 0.28 * (1 - smooth(0.85, 1, p));
        holder.rotation.y = -0.6 + p * Math.PI * 2 + t * 0.12;
        holder.rotation.z = strides * 0.1;
        holder.position.y = hop + Math.sin(t * 1.6) * 0.02;
        sh.scale.setScalar(3 - hop * 2.5);
        sh.material.opacity = 1 - hop * 1.6;
        return { push: 0 };
      },
    };
  })();

  const SCENES = { perfume, shoe }; // the jewellery stage is real photos in the DOM, not WebGL
  let W = 0, H = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
  }
  addEventListener("resize", resize); resize();

  const clock = new THREE.Clock();
  let shown = false;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (document.hidden) return;
    const active = readStages();
    if (!active) return;
    const S = SCENES[active.kind];
    if (!S) return;
    const out = S.update(active.p, t, dt) || {};
    const f = small() ? S.frame.tall : S.frame.wide;
    const look = new THREE.Vector3(...f.look), pos = new THREE.Vector3(...f.pos);
    pos.lerp(look, out.push || 0);
    camera.fov = f.fov; camera.aspect = W / H;
    camera.setViewOffset(W, H, f.shift[0] * W, f.shift[1] * H, W, H);
    camera.position.copy(pos); camera.lookAt(look);
    camera.updateProjectionMatrix();
    const ppu = renderer.getPixelRatio() * H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    S.scene.traverse((o) => { if (o.isPoints) o.material.uniforms.scale.value = ppu; });
    renderer.render(S.scene, camera);
    if (!shown) { shown = true; document.body.classList.add("gl-on"); }
  });
}
