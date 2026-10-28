// One WebGL canvas behind three pinned stages.
// Perfume and shoes: the store's own photos, each with a depth map, drawn by a shader so the near parts
// (bottle, shoe) move more than the background: real parallax driven by the scroll.
// Jewellery: real photos in layers, handled in app.js.
import * as THREE from "three";

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

const PHOTO_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const PHOTO_FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uImgA, uDepA, uImgB, uDepB;
uniform vec2 uRes, uResA, uResB, uLook, uCenA, uCenB;
uniform float uZoomA, uZoomB, uMix, uContain, uFeather, uLight, uShadeLeft, uShadeBottom;
uniform vec3 uBg;
vec2 fit(vec2 uv, vec2 ires, float zoom, vec2 c){
  float rs = uRes.x / uRes.y, ri = ires.x / ires.y;
  vec2 cover = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  vec2 contain = rs > ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  vec2 s = mix(cover, contain, uContain) / zoom;
  return (uv - 0.5) * s + c;
}
vec3 layer(sampler2D img, sampler2D dep, vec2 ires, float zoom, vec2 c){
  vec2 uv = fit(vUv, ires, zoom, c);
  float d = texture2D(dep, clamp(uv, 0.001, 0.999)).r;
  // near pixels slide further than far ones: the parallax
  vec2 q = uv + uLook * vec2(0.022, 0.016) * (d - 0.42);
  vec3 col = texture2D(img, clamp(q, 0.001, 0.999)).rgb;
  // a soft light passing over the near surfaces
  float band = exp(-pow((q.x * 0.85 + q.y * 0.45 - uLight) * 6.0, 2.0));
  col += col * band * smoothstep(0.45, 0.85, d) * 0.35;
  if (uFeather > 0.0) {
    float a = smoothstep(0.0, uFeather * 0.5, q.x) * smoothstep(1.0, 1.0 - uFeather * 0.5, q.x) * smoothstep(0.0, uFeather * 1.3, q.y) * smoothstep(1.0, 1.0 - uFeather * 1.3, q.y);
    col = mix(uBg, col, a);
  } else if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) col = uBg;
  return col;
}
void main(){
  vec3 col = layer(uImgA, uDepA, uResA, uZoomA, uCenA);
  if (uMix > 0.001) col = mix(col, layer(uImgB, uDepB, uResB, uZoomB, uCenB), uMix);
  // reading shade behind the text, and a light vignette
  col *= 1.0 - uShadeLeft * smoothstep(0.62, 0.0, vUv.x) * 0.75;
  col *= 1.0 - uShadeBottom * smoothstep(0.5, 0.0, vUv.y) * 0.8;
  vec2 v = vUv - 0.5; col *= 1.0 - dot(v, v) * 0.55;
  gl_FragColor = vec4(col, 1.0);
}`;

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
  const flat = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const loader = new THREE.TextureLoader();
  const tex = (src, depth) => {
    const t = loader.load(src, () => { t.userData.ok = true; });
    t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4;
    t.userData.depth = depth; return t;
  };
  const photoSet = (name) => ({ img: tex(`/img/stage/${name}.webp`), dep: tex(`/img/stage/${name}-d.webp`, true) });
  const sizeOf = (t) => t.image ? new THREE.Vector2(t.image.naturalWidth || t.image.width, t.image.naturalHeight || t.image.height) : new THREE.Vector2(1, 1);

  function photoScene(bg) {
    const scene = new THREE.Scene();
    const mat = new THREE.ShaderMaterial({
      vertexShader: PHOTO_VERT, fragmentShader: PHOTO_FRAG, depthTest: false, depthWrite: false, toneMapped: false,
      uniforms: {
        uImgA: { value: null }, uDepA: { value: null }, uImgB: { value: null }, uDepB: { value: null },
        uRes: { value: new THREE.Vector2(1, 1) }, uResA: { value: new THREE.Vector2(1, 1) }, uResB: { value: new THREE.Vector2(1, 1) },
        uLook: { value: new THREE.Vector2() }, uCenA: { value: new THREE.Vector2(0.5, 0.5) }, uCenB: { value: new THREE.Vector2(0.5, 0.5) },
        uZoomA: { value: 1 }, uZoomB: { value: 1 }, uMix: { value: 0 }, uContain: { value: 0 }, uFeather: { value: 0 }, uLight: { value: -1 },
        uShadeLeft: { value: 0 }, uShadeBottom: { value: 0 }, uBg: { value: new THREE.Color(bg) },
      },
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); quad.frustumCulled = false; scene.add(quad);
    return { scene, u: mat.uniforms, flat: true };
  }
  const ready = (s) => s.img.userData.ok && s.dep.userData.ok;

  // ---------- featured perfume: Sauvage ----------
  const perfume = (() => {
    const ph = photoScene("#07090d"), u = ph.u;
    const sv = photoSet("sauvage");
    let eased = 0;
    return {
      ...ph,
      update(p, t, dt) {
        if (!ready(sv)) return { wait: true };
        eased += (p - eased) * (1 - Math.exp(-dt * 6));
        const e = eased, m = small();
        u.uImgA.value = sv.img; u.uDepA.value = sv.dep; u.uResA.value = sizeOf(sv.img); u.uMix.value = 0;
        // the whole scene at the side of the text, then a slow push towards the bottle as you scroll
        const push = smooth(0, 1, e);
        if (m) { u.uZoomA.value = 1.25 + 0.3 * push; u.uCenA.value.set(0.585, 0.30 + 0.05 * push); }
        else { const z = 1.0 + 0.14 * push, rs = innerWidth / innerHeight, sx = (rs / 0.94) / z; u.uZoomA.value = z; u.uCenA.value.set(0.5 - 0.2 * sx, 0.5 + 0.03 * push); }
        u.uLook.value.set(Math.sin(t * 0.32) * 0.35 + (e - 0.5) * 2.2, Math.cos(t * 0.26) * 0.25 - (e - 0.5) * 0.9);
        u.uLight.value = -0.2 + smooth(0.08, 0.7, e) * 1.9;
        u.uContain.value = 1; u.uFeather.value = 0.14;
        u.uShadeLeft.value = m ? 0 : 0.5; u.uShadeBottom.value = m ? 0.5 : 0;
        return {};
      },
    };
  })();

  // ---------- featured shoes: one per category ----------
  const SHOES = ["s-tenis", "s-sandalia", "s-sapatilha", "s-rasteira", "s-salto"].map(photoSet);
  const shoe = (() => {
    const ph = photoScene("#1a120c"), u = ph.u;
    let eased = 0;
    const place = (q, m) => {
      // where the photo sits: right side on desktop (text on the left), upper half on phones (text below)
      const zoom = m ? 1.04 : 0.66;
      const sx = m ? 0.5 : 0.21, sy = m ? 0.06 : 0.46;
      return { zoom: zoom * (1 + 0.1 * q), cx: sx + (q - 0.5) * 0.06, cy: sy };
    };
    return {
      ...ph,
      update(p, t, dt) {
        if (!SHOES.every(ready)) return { wait: true };
        eased += (p - eased) * (1 - Math.exp(-dt * 6));
        const n = SHOES.length, x = clamp(eased * n, 0, n - 0.0001), i = Math.floor(x), q = x - i;
        const m = small();
        const A = SHOES[i], B = SHOES[Math.min(n - 1, i + 1)];
        const mix = i < n - 1 ? smooth(0.72, 1, q) : 0;
        const a = place(q, m), b = place(0, m);
        u.uImgA.value = A.img; u.uDepA.value = A.dep; u.uResA.value = sizeOf(A.img);
        u.uImgB.value = B.img; u.uDepB.value = B.dep; u.uResB.value = sizeOf(B.img);
        u.uZoomA.value = a.zoom * (1 + 0.08 * mix); u.uCenA.value.set(a.cx + mix * 0.08, a.cy);
        u.uZoomB.value = b.zoom * (0.92 + 0.08 * mix); u.uCenB.value.set(b.cx - (1 - mix) * 0.08, b.cy);
        u.uMix.value = mix;
        u.uLook.value.set(Math.sin(t * 0.4) * 0.35 + (q - 0.5) * 2.4, Math.cos(t * 0.3) * 0.25 + (q - 0.5) * -0.6);
        u.uLight.value = -0.3 + q * 1.9;
        u.uContain.value = 1; u.uFeather.value = 0.12;
        u.uShadeLeft.value = m ? 0 : 0.6; u.uShadeBottom.value = m ? 0.6 : 0;
        return {};
      },
    };
  })();

  const SCENES = { perfume, shoe }; // the jewellery stage is real photos in the DOM (app.js), not WebGL
  let W = 0, H = 0;
  function resize() { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); }
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
    if (out.wait) return;
    if (S.flat) {
      S.u.uRes.value.set(W, H);
      renderer.render(S.scene, flat);
    } else {
      const f = small() ? S.frame.tall : S.frame.wide;
      const look = new THREE.Vector3(...f.look), pos = new THREE.Vector3(...f.pos);
      camera.fov = f.fov; camera.aspect = W / H;
      camera.setViewOffset(W, H, f.shift[0] * W, f.shift[1] * H, W, H);
      camera.position.copy(pos); camera.lookAt(look);
      camera.updateProjectionMatrix();
      const ppu = renderer.getPixelRatio() * H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
      S.scene.traverse((o) => { if (o.isPoints) o.material.uniforms.scale.value = ppu; });
      renderer.render(S.scene, camera);
    }
    if (!shown) { shown = true; document.body.classList.add("gl-on"); }
  });
}
