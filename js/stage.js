// One WebGL canvas behind the pinned stages (perfume, shoes). The jewellery stage is DOM photos (app.js).
// Every object is built from the store's own photos:
//  - Sauvage: a 3D bottle whose front is the photo of the bottle, a cap wrapped with the photo of the cap,
//    dark glass sides; it turns, the cap comes off and lands beside it, and it sprays.
//  - Shoes: each cut-out photo on a relief mesh (its depth map pushes the near parts forward), so it turns,
//    rocks heel-to-toe and hops like it is walking; one per category, in order.
// Backgrounds are the photos' own backdrops with the product removed and softened.
import * as THREE from "three";
import { studioEnv } from "./lib3d.js";

const canvas = document.getElementById("gl");
const small = () => innerWidth <= 760;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

const stages = [...document.querySelectorAll(".stage")].map((el) => ({
  el, kind: el.dataset.stage, steps: [...el.querySelectorAll(".step")], bar: el.querySelector(".meter .bar i"), p: 0,
}));
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

// full-screen photo backdrop: cover fit, two images cross-fading, soft vignette and a reading shade
const BACK_FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uA, uB; uniform vec2 uRes, uResA, uResB, uOff; uniform float uMix, uZoom, uShadeLeft, uShadeBottom, uDim;
vec2 cover(vec2 uv, vec2 ires){
  float rs = uRes.x / uRes.y, ri = ires.x / ires.y;
  vec2 s = (rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0)) / uZoom;
  vec2 c = clamp(vec2(0.5) + uOff, s * 0.5, 1.0 - s * 0.5);
  return (uv - 0.5) * s + c;
}
void main(){
  vec3 col = texture2D(uA, cover(vUv, uResA)).rgb;
  if (uMix > 0.001) col = mix(col, texture2D(uB, cover(vUv, uResB)).rgb, uMix);
  col *= uDim;
  col *= 1.0 - uShadeLeft * smoothstep(0.6, 0.0, vUv.x) * 0.7;
  col *= 1.0 - uShadeBottom * smoothstep(0.5, 0.0, vUv.y) * 0.8;
  vec2 v = vUv - 0.5; col *= 1.0 - dot(v, v) * 0.7;
  gl_FragColor = vec4(col, 1.0);
}`;

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.autoClear = false;
  const loader = new THREE.TextureLoader();
  let pending = 0;
  const tex = (src, opt = {}) => {
    pending++;
    const t = loader.load(src, () => { t.userData.ok = true; pending--; }, undefined, () => { pending--; });
    t.colorSpace = opt.raw ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const size = (t) => new THREE.Vector2(t.image?.naturalWidth || t.image?.width || 1, t.image?.naturalHeight || t.image?.height || 1);
  const ok = (...ts) => ts.every((t) => t.userData.ok);
  const env = studioEnv(THREE, renderer, true);

  // backdrop
  const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const backMat = new THREE.ShaderMaterial({
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: BACK_FRAG, depthTest: false, depthWrite: false,
    uniforms: { uA: { value: null }, uB: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uResA: { value: new THREE.Vector2(1, 1) }, uResB: { value: new THREE.Vector2(1, 1) },
      uOff: { value: new THREE.Vector2() }, uMix: { value: 0 }, uZoom: { value: 1 }, uShadeLeft: { value: 0 }, uShadeBottom: { value: 0 }, uDim: { value: 1 } },
  });
  const backScene = new THREE.Scene();
  const bq = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), backMat); bq.frustumCulled = false; backScene.add(bq);
  const B = backMat.uniforms;
  const setBack = (a, b, mix, o) => {
    B.uA.value = a; B.uResA.value = size(a); B.uB.value = b || a; B.uResB.value = size(b || a); B.uMix.value = mix;
    B.uZoom.value = o.zoom ?? 1; B.uOff.value.set(o.ox ?? 0, o.oy ?? 0); B.uShadeLeft.value = o.left ?? 0; B.uShadeBottom.value = o.bottom ?? 0; B.uDim.value = o.dim ?? 1;
  };

  // soft round sprite for mist, dust and shadows
  function softTex(stops) {
    const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const dotTex = softTex([[0, "rgba(255,255,255,1)"], [0.35, "rgba(255,255,255,0.5)"], [1, "rgba(255,255,255,0)"]]);
  const shadowTex = softTex([[0, "rgba(0,0,0,0.75)"], [0.5, "rgba(0,0,0,0.3)"], [1, "rgba(0,0,0,0)"]]);
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
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; return pts;
  }
  const shadowDisc = () => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.002; return m;
  };

  // ---------- Sauvage ----------
  const perfume = (() => {
    const scene = new THREE.Scene(); scene.environment = env; scene.environmentIntensity = 0.9;
    const bgWide = tex("/img/stage/sv-bg-wide.webp", { raw: true }), bgTall = tex("/img/stage/sv-bg.webp", { raw: true });
    const bodyTex = tex("/img/stage/sv-body.webp"), capTex = tex("/img/stage/sv-cap.webp");
    capTex.wrapS = THREE.MirroredRepeatWrapping; capTex.repeat.set(2, 1); capTex.offset.set(0.5, 0);

    // proportions taken from the photo: body 996 x 1409 px, cap 501 x 530 px (1 unit = body width)
    const BW = 1.0, BH = 1.415, BD = 0.46, CR = 0.2515, CH = 0.532;
    const g = new THREE.Group(); scene.add(g);
    const glass = new THREE.MeshPhysicalMaterial({ color: "#0a1226", roughness: 0.06, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2 });
    const shape = new THREE.Shape();
    const w = BW - 0.08, h = BH - 0.08, r = 0.06, x0 = -w / 2, y0 = 0.04;
    shape.moveTo(x0 + r, y0); shape.lineTo(x0 + w - r, y0); shape.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    shape.lineTo(x0 + w, y0 + h - r); shape.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
    shape.lineTo(x0 + r, y0 + h); shape.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r); shape.lineTo(x0, y0 + r); shape.quadraticCurveTo(x0, y0, x0 + r, y0);
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: BD - 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 6, curveSegments: 12 }), glass);
    body.position.z = -(BD - 0.08) / 2; g.add(body);
    // the photo of the bottle, on the front and (darker) on the back
    const front = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: bodyTex, transparent: true, alphaTest: 0.03, toneMapped: false }));
    front.position.set(0, BH / 2, BD / 2 + 0.003); g.add(front);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: bodyTex, transparent: true, alphaTest: 0.03, color: "#1b1e27", toneMapped: false }));
    back.position.set(0, BH / 2, -BD / 2 - 0.003); back.rotation.y = Math.PI; back.scale.x = -1; g.add(back);
    // light passing over the glass as it turns
    const sheenMat = new THREE.ShaderMaterial({
      uniforms: { map: { value: bodyTex }, uPos: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform sampler2D map; uniform float uPos; varying vec2 vUv;
        void main(){ float a = texture2D(map, vUv).a; float b = exp(-pow((vUv.x * 0.9 + vUv.y * 0.35 - uPos) * 7.0, 2.0)); gl_FragColor = vec4(vec3(0.75, 0.82, 1.0) * b * a * 0.32, 1.0); }`,
    });
    const sheen = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), sheenMat); sheen.position.copy(front.position); sheen.position.z += 0.002; g.add(sheen);
    // reflection on the wet ground, fading downwards
    const reflMat = new THREE.ShaderMaterial({
      uniforms: { map: { value: bodyTex } }, transparent: true, depthWrite: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform sampler2D map; varying vec2 vUv;
        void main(){ vec4 c = texture2D(map, vec2(vUv.x, 1.0 - vUv.y)); float f = smoothstep(0.55, 1.0, vUv.y); gl_FragColor = vec4(c.rgb * 0.9, c.a * f * 0.32); }`,
    });
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(BW, BH), reflMat); refl.position.set(0, -BH / 2 - 0.004, BD / 2); g.add(refl);
    // sprayer under the cap
    const chrome = new THREE.MeshPhysicalMaterial({ color: "#d9dde4", metalness: 1, roughness: 0.12, envMapIntensity: 1.4 });
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.05, 40), chrome); collar.position.y = BH + 0.025; g.add(collar);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.11, 32), chrome); stem.position.y = BH + 0.1; g.add(stem);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.09, 32), new THREE.MeshPhysicalMaterial({ color: "#111317", metalness: 0.4, roughness: 0.2, clearcoat: 1 })); head.position.y = BH + 0.2; g.add(head);
    const tip = new THREE.Vector3(-0.07, BH + 0.205, 0.04);
    // cap: the photo of the ribbed cap wrapped around a turned profile with a domed top
    const prof = [];
    for (let i = 0; i <= 40; i++) {
      const y = (i / 40) * CH, dome = 0.055;
      const rr = y < CH - dome ? CR : CR * Math.sqrt(Math.max(0, 1 - Math.pow((y - (CH - dome)) / dome, 2)));
      prof.push(new THREE.Vector2(Math.max(0.0001, rr), y));
    }
    const cap = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), new THREE.MeshBasicMaterial({ map: capTex, toneMapped: false }));
    scene.add(cap);
    const capRest = new THREE.Vector3(0, BH, 0);
    const sh = shadowDisc(); sh.scale.set(1.9, 1.1, 1); scene.add(sh);
    const capSh = shadowDisc(); capSh.scale.set(0.7, 0.45, 1); scene.add(capSh);

    // mist
    const N = 1600, sp = particles(N, "#eef2ff", THREE.NormalBlending); scene.add(sp);
    const P = { pos: new Float32Array(N * 3), vel: new Float32Array(N * 3), age: new Float32Array(N).fill(99), life: new Float32Array(N), size: new Float32Array(N) };
    let headI = 0;
    function emit(count, o, d) {
      for (let k = 0; k < count; k++) {
        const i = headI; headI = (headI + 1) % N;
        const s = 0.4, v = new THREE.Vector3(d.x + (Math.random() - 0.5) * s, d.y + (Math.random() - 0.5) * s, d.z + (Math.random() - 0.5) * s).normalize().multiplyScalar(1.6 + Math.random() * 2.2);
        P.pos.set([o.x, o.y, o.z], i * 3); P.vel.set([v.x, v.y, v.z], i * 3);
        P.age[i] = 0; P.life[i] = 1.2 + Math.random() * 1.5; P.size[i] = Math.random() < 0.06 ? 0.012 : 0.03 + Math.random() * 0.05;
      }
    }
    // dust drifting in the evening light
    const D = 180, dust = particles(D, "#ffcf8f"); scene.add(dust);
    const dpos = dust.geometry.attributes.position.array, dsz = dust.geometry.attributes.aSize.array, dal = dust.geometry.attributes.aAlpha.array, dseed = new Float32Array(D);
    for (let i = 0; i < D; i++) { dpos.set([(Math.random() - 0.5) * 6, Math.random() * 3.4, (Math.random() - 0.5) * 3 - 0.6], i * 3); dsz[i] = 0.01 + Math.random() * 0.022; dseed[i] = Math.random() * 10; }

    const tipW = new THREE.Vector3(), dirW = new THREE.Vector3();
    let clockS = 0.9, pulse = 0, eased = 0;
    return {
      scene,
      frame: { wide: { look: [0, 0.98, 0], h: 2.85, fov: 24, sx: 0.67, sy: 0.5 }, tall: { look: [0, 0.98, 0], h: 4.4, fov: 30, sx: 0.5, sy: 0.63 } },
      ready: () => ok(bgWide, bgTall, bodyTex, capTex),
      update(p, t, dt) {
        eased += (p - eased) * (1 - Math.exp(-dt * 6)); const e = eased;
        const m = small();
        setBack(m ? bgTall : bgWide, null, 0, { zoom: 1.04 + 0.08 * e, ox: m ? 0.06 : 0.02 + 0.02 * e, oy: 0.02, left: m ? 0 : 0.85, bottom: m ? 0.9 : 0.15, dim: 0.95 });
        // a full turn first, then the cap comes off, it sprays, and the cap goes back on
        const turn = smooth(0.02, 0.36, e) * Math.PI * 2;
        const up = smooth(0.38, 0.47, e) * (1 - smooth(0.88, 0.97, e));
        const aside = smooth(0.45, 0.56, e) * (1 - smooth(0.84, 0.93, e));
        const spray = smooth(0.58, 0.62, e) * (1 - smooth(0.8, 0.84, e));
        g.rotation.y = turn + Math.sin(t * 0.45) * 0.06 + aside * 0.32 - spray * 0.28;
        g.rotation.z = -0.04 * spray;
        const rest = m ? new THREE.Vector3(-0.85, 0, 0.75) : new THREE.Vector3(-1.25, 0, 0.5);
        cap.position.set(rest.x * aside, (capRest.y + up * 0.38) * (1 - aside) + CR * aside + Math.sin(aside * Math.PI) * 0.45, rest.z * aside);
        cap.rotation.set(0, g.rotation.y + up * Math.PI * 2 + aside * 0.6, aside * Math.PI / 2);
        capSh.position.set(cap.position.x, 0.003, cap.position.z); capSh.material.opacity = aside;
        sh.material.opacity = 0.9;
        sheenMat.uniforms.uPos.value = -0.4 + ((turn / (Math.PI * 2)) * 1.8 + t * 0.05) % 2.2;
        if (spray > 0.01) { clockS += dt; if (clockS > 1.1) { clockS = 0; pulse = 1; } } else clockS = 0.9;
        pulse = Math.max(0, pulse - dt * 3.2);
        g.updateMatrixWorld(true);
        tipW.copy(tip).applyMatrix4(g.matrixWorld);
        dirW.set(-0.7, 0.35, 0.62).normalize();
        if (spray > 0.01) emit(Math.floor((36 * spray + 200 * pulse) * dt * 10), tipW, dirW);
        const pos = sp.geometry.attributes.position.array, sz = sp.geometry.attributes.aSize.array, al = sp.geometry.attributes.aAlpha.array;
        for (let i = 0; i < N; i++) {
          if (P.age[i] > P.life[i]) { al[i] = 0; continue; }
          P.age[i] += dt;
          const k = i * 3, drag = Math.exp(-dt * 1.7);
          P.vel[k] *= drag; P.vel[k + 1] = P.vel[k + 1] * drag + 0.16 * dt; P.vel[k + 2] *= drag;
          P.pos[k] += P.vel[k] * dt; P.pos[k + 1] += P.vel[k + 1] * dt; P.pos[k + 2] += P.vel[k + 2] * dt;
          pos[k] = P.pos[k]; pos[k + 1] = P.pos[k + 1]; pos[k + 2] = P.pos[k + 2];
          const a = P.age[i] / P.life[i];
          sz[i] = P.size[i] * (1 + a * 7);
          al[i] = Math.sin(Math.min(a * 6, 1) * Math.PI / 2) * (1 - a) * (1 - a) * (P.size[i] < 0.02 ? 0.9 : 0.24);
        }
        sp.geometry.attributes.position.needsUpdate = sp.geometry.attributes.aSize.needsUpdate = sp.geometry.attributes.aAlpha.needsUpdate = true;
        for (let i = 0; i < D; i++) { const k = i * 3; dpos[k + 1] += dt * 0.05; if (dpos[k + 1] > 3.4) dpos[k + 1] = 0; dal[i] = 0.22 + 0.22 * Math.sin(t * 1.3 + dseed[i]); }
        dust.geometry.attributes.position.needsUpdate = dust.geometry.attributes.aAlpha.needsUpdate = true;
        return {};
      },
    };
  })();

  // ---------- shoes ----------
  const SHOE_NAMES = ["s-tenis", "s-sandalia", "s-sapatilha", "s-rasteira", "s-salto"];
  const shoe = (() => {
    const scene = new THREE.Scene();
    const items = SHOE_NAMES.map((n) => ({ img: tex(`/img/stage/${n}-cut.webp`), dep: tex(`/img/stage/${n}-d.webp`, { raw: true }), bg: tex(`/img/stage/${n}-bg.webp`, { raw: true }) }));
    const W0 = 2.5;
    for (const it of items) {
      it.group = new THREE.Group(); scene.add(it.group);
      it.mat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, map: it.img, emissiveMap: it.img, displacementMap: it.dep, displacementScale: 0.34, displacementBias: -0.12, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, toneMapped: false });
      it.mesh = null;
      it.shadow = shadowDisc(); scene.add(it.shadow);
    }
    const build = (it) => {
      if (it.mesh || !ok(it.img, it.dep)) return;
      const s = size(it.img), h = W0 * s.y / s.x;
      it.mesh = new THREE.Mesh(new THREE.PlaneGeometry(W0, h, 220, Math.round(220 * h / W0)), it.mat);
      it.mesh.position.y = h / 2; it.h = h; it.group.add(it.mesh);
    };
    let eased = 0;
    return {
      scene,
      frame: { wide: { look: [0, 0.62, 0], h: 2.6, fov: 26, sx: 0.66, sy: 0.48 }, tall: { look: [0, 0.62, 0], h: 5.4, fov: 30, sx: 0.5, sy: 0.6 } },
      ready: () => items.every((it) => ok(it.img, it.dep, it.bg)),
      update(p, t, dt) {
        items.forEach(build);
        eased += (p - eased) * (1 - Math.exp(-dt * 6));
        const n = items.length, x = clamp(eased * n, 0, n - 0.0001), i = Math.floor(x), q = x - i;
        const m = small();
        const out = i < n - 1 ? smooth(0.8, 1, q) : 0;
        setBack(items[i].bg, items[Math.min(n - 1, i + 1)].bg, out, { zoom: 1.08, ox: (q - 0.5) * 0.04, oy: 0, left: m ? 0 : 0.75, bottom: m ? 0.9 : 0, dim: 0.85 });
        items.forEach((it, k) => {
          const mesh = it.mesh; if (!mesh) return;
          const on = k === i || (k === i + 1 && out > 0);
          it.group.visible = on; it.shadow.visible = on;
          if (!on) return;
          // local time inside this shoe's part of the scroll; the next shoe comes in as this one leaves
          const lq = k === i ? q : 0, inn = k === i ? (i === 0 ? 1 : smooth(0, 0.16, q)) : out, gone = k === i ? out : 0;
          const steps = Math.sin(lq * Math.PI * 4);
          const hop = Math.abs(steps) * 0.16 * inn * (1 - gone);
          const yaw = -0.62 + lq * 1.25 + Math.sin(t * 0.55 + k) * 0.08;
          it.group.position.set((1 - inn) * 3.2 - gone * 3.4, hop, 0);
          it.group.rotation.set(0, yaw * inn + (1 - inn) * 0.9 - gone * 0.8, 0);
          mesh.rotation.z = steps * 0.06 * (1 - gone);
          it.mat.opacity = Math.min(inn, 1 - gone * 0.9);
          it.mat.emissiveIntensity = 1 - Math.abs(Math.sin(it.group.rotation.y)) * 0.28;
          it.shadow.position.set(it.group.position.x, 0.003, 0.05);
          it.shadow.scale.set(W0 * 0.95 * (1 - hop * 0.9), 0.9 * (1 - hop * 0.9), 1);
          it.shadow.material.opacity = (0.85 - hop * 2) * it.mat.opacity;
        });
        return {};
      },
    };
  })();

  const SCENES = { perfume, shoe };
  const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 100);
  let W = 0, H = 0;
  function resize() { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); }
  addEventListener("resize", resize); resize();

  // place the object: f.h = world height that fills the screen, (sx, sy) = where the look point lands on screen
  function frameCamera(f) {
    const d = f.h / (2 * Math.tan(THREE.MathUtils.degToRad(f.fov) / 2));
    camera.fov = f.fov; camera.aspect = W / H;
    camera.setViewOffset(W, H, -(f.sx - 0.5) * W, (f.sy - 0.5) * H, W, H);
    camera.position.set(f.look[0], f.look[1] + d * 0.06, f.look[2] + d);
    camera.lookAt(f.look[0], f.look[1], f.look[2]);
    camera.updateProjectionMatrix();
  }

  const clock = new THREE.Clock();
  let shown = false;
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (document.hidden) return;
    const active = readStages();
    if (!active) return;
    const S = SCENES[active.kind];
    if (!S || !S.ready()) return;
    S.update(active.p, t, dt);
    renderer.clear();
    B.uRes.value.set(W, H);
    renderer.render(backScene, flat);
    renderer.clearDepth();
    frameCamera(small() ? S.frame.tall : S.frame.wide);
    const ppu = renderer.getPixelRatio() * H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    S.scene.traverse((o) => { if (o.isPoints) o.material.uniforms.scale.value = ppu; });
    renderer.render(S.scene, camera);
    if (!shown) { shown = true; document.body.classList.add("gl-on"); }
  });
}
