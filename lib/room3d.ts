// Shared real-time living room (the same study as the hero render), used by the hero and the method section.
// build(p): 0 = plan lines, ~0.4 walls up, ~0.7 furniture in white, 1 = materials and colour.
import type * as T from "three";

type Three = typeof import("three");

export type Room = {
  THREE: Three;
  renderer: T.WebGLRenderer;
  scene: T.Scene;
  camera: T.PerspectiveCamera;
  build: (p: number) => void;
  /** compile every shader now (all objects shown once), so nothing stalls when furniture appears later */
  prepare: () => void;
  ready: Promise<void>;
  resize: () => void;
  dispose: () => void;
};

export const sm = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const lerp3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

export async function createRoom(host: HTMLElement, opts: { background: string; dpr?: number; exposure?: number; dusk?: boolean }): Promise<Room> {
  const THREE = await import("three");
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const { DRACOLoader } = await import("three/examples/jsm/loaders/DRACOLoader.js");
  const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");

  const probe = document.createElement("canvas");
  if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) throw new Error("no webgl");

  const small = innerWidth < 1024;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, opts.dpr ?? (small ? 1.5 : 1.5)));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // shadows are only re-rendered when the model changes (see build), not on every camera frame
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.background);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = opts.dusk ? 0.4 : 0.55;
  pm.dispose();

  const hemi = new THREE.HemisphereLight("#fff4e6", "#b9a68f", 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffe2bf", 2.6);
  sun.position.set(-8, 5.5, -2.5);
  sun.target.position.set(0.5, 0, -0.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 1536, small ? 1024 : 1536);
  const sc = sun.shadow.camera;
  sc.left = -6; sc.right = 6; sc.top = 6; sc.bottom = -6; sc.near = 1; sc.far = 25;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  const lampLight = new THREE.PointLight("#ffc78f", 0, 6, 1.6);
  lampLight.position.set(2.55, 1.5, -2.35);
  scene.add(lampLight);

  // clay ↔ material blend, shared by every material in the model
  const uClay = { value: 1 };
  const clayify = (m: T.Material) => {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uClay = uClay;
      sh.fragmentShader = "uniform float uClay;\n" + sh.fragmentShader.replace(
        "#include <map_fragment>",
        "#include <map_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.915, 0.89), uClay);",
      );
    };
    m.needsUpdate = true;
  };

  // ----- shell: floor, back wall, window wall (cutaway) -----
  const X0 = -3.2, X1 = 3.2, Z0 = -3.0, Z1 = 3.2, HT = 2.85, TH = 0.16;
  const plankTex = (() => {
    const c = document.createElement("canvas"); c.width = 512; c.height = 512;
    const g = c.getContext("2d")!;
    for (let r = 0; r < 16; r++) {
      let x = (r % 3) * -90;
      while (x < 512) {
        const w = 220 + ((r * 37 + x) % 120), l = 58 + ((r * 13 + x) % 9);
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

  const INK = new THREE.Color("#24211f"), PLASTER = new THREE.Color("#ece6dc");
  const wallMat = new THREE.MeshStandardMaterial({ color: INK.clone(), roughness: 0.92 });
  const walls = new THREE.Group(); scene.add(walls);
  const wall = (w: number, d: number, x: number, z: number, h = HT, y0 = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.geometry.translate(0, h / 2 + y0, 0);
    m.position.set(x, 0, z); m.castShadow = m.receiveShadow = true; walls.add(m);
  };
  wall(X1 - X0 + TH, TH, (X0 + X1) / 2, Z0 - TH / 2);
  const WZ0 = -2.3, WZ1 = 1.5, WH = 2.62;
  wall(TH, WZ0 - Z0, X0 - TH / 2, (Z0 + WZ0) / 2);
  wall(TH, Z1 - WZ1, X0 - TH / 2, (WZ1 + Z1) / 2);
  wall(TH, WZ1 - WZ0, X0 - TH / 2, (WZ0 + WZ1) / 2, HT - WH, WH);
  const frameMat = new THREE.MeshStandardMaterial({ color: "#2b2a28", roughness: 0.45, metalness: 0.5 });
  clayify(frameMat);
  for (let i = 0; i <= 3; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, WH, 0.045), frameMat);
    b.geometry.translate(0, WH / 2, 0); b.position.set(X0 - TH / 2, 0, WZ0 + ((WZ1 - WZ0) * i) / 3); b.castShadow = true; walls.add(b);
  }
  const slatMat = new THREE.MeshStandardMaterial({ color: "#7d5436", roughness: 0.55 });
  clayify(slatMat);
  const slatGeo = new THREE.BoxGeometry(0.04, HT, 0.03); slatGeo.translate(0, HT / 2, 0);
  const nSl = Math.floor((1.95 + 1.75) / 0.062);
  const slats = new THREE.InstancedMesh(slatGeo, slatMat, nSl);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < nSl; i++) { mtx.makeTranslation(-1.75 + i * 0.062 + 0.02, 0, Z0 + 0.016); slats.setMatrixAt(i, mtx); }
  slats.castShadow = slats.receiveShadow = true; walls.add(slats);
  // warm cove line in front of the slats (the ceiling itself is cut away)
  const cove = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: "#ffd3a0" }));
  cove.position.set(0.1, HT - 0.12, Z0 + 0.12); walls.add(cove);

  // ----- furniture -----
  const furniture: { obj: T.Object3D; delay: number; y: number }[] = [];
  const addF = (obj: T.Object3D, delay: number) => {
    obj.traverse((o) => {
      const mesh = o as T.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = mesh.receiveShadow = true;
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(clayify);
      }
    });
    obj.visible = false;
    furniture.push({ obj, delay, y: obj.position.y });
    scene.add(obj);
  };
  const rug = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.012, 2.3), new THREE.MeshStandardMaterial({ color: "#d9cdb9", roughness: 1 }));
  rug.position.set(0.2, 0.006, -1.25); addF(rug, 0);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.34, 64), new THREE.MeshStandardMaterial({ color: "#d8c9b1", roughness: 0.6 }));
  table.position.set(0.15, 0.17, -1.15); addF(table, 0.35);
  const side = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 48), new THREE.MeshStandardMaterial({ color: "#5e3e29", roughness: 0.5 }));
  side.position.set(0.85, 0.13, -1.45); addF(side, 0.45);
  const lamp = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: "#2b2a28", roughness: 0.4, metalness: 0.6 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.45, 12), dark); pole.position.y = 0.75;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 32), dark); base.position.y = 0.015;
  const shadeMat = new THREE.MeshStandardMaterial({ color: "#efe4d2", roughness: 0.9, side: THREE.DoubleSide, emissive: "#ffcf96", emissiveIntensity: 0 });
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 0.3, 48, 1, true), shadeMat);
  shade.position.y = 1.55;
  lamp.add(pole, base, shade); lamp.position.set(2.55, 0, -2.35); addF(lamp, 0.6);

  const draco = new DRACOLoader(); draco.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/");
  const loader = new GLTFLoader(); loader.setDRACOLoader(draco);
  const glb = (name: string) => loader.loadAsync(`/3d/${name}.glb`).then((g) => g.scene);
  const recolor = (root: T.Object3D, key: string, hex: string) => root.traverse((o) => {
    const mesh = o as T.Mesh;
    if (!mesh.isMesh) return;
    for (const m of (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as T.MeshPhysicalMaterial[]) {
      if (m.name.toLowerCase().includes(key)) { m.color = new THREE.Color(hex); if (m.sheenColor) m.sheenColor = new THREE.Color(hex); }
    }
  });
  const ready = Promise.all([
    glb("GlamVelvetSofa").then((s) => { recolor(s, "fabric", "#4a2241"); s.position.set(0.15, 0, -2.35); addF(s, 0.1); }),
    glb("ChairDamaskPurplegold").then((s) => { s.scale.setScalar(1.08); s.position.set(-1.55, 0, -0.75); s.rotation.y = THREE.MathUtils.degToRad(68); addF(s, 0.2); }),
    glb("SheenChair").then((s) => { recolor(s, "fabric", "#cdbca3"); s.scale.setScalar(1.08); s.position.set(1.95, 0, -0.55); s.rotation.y = THREE.MathUtils.degToRad(-72); addF(s, 0.3); }),
    glb("DiffuseTransmissionPlant").then((s) => { s.scale.setScalar(1.9); s.position.set(-2.55, 0, -2.45); s.rotation.y = 0.35; addF(s, 0.5); }),
  ]).then(() => undefined);
  ready.catch(() => {});

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);

  let lastP = -1;
  const build = (p: number) => {
    if (Math.abs(p - lastP) < 0.0004) return;
    lastP = p;
    renderer.shadowMap.needsUpdate = true;
    const rise = sm(0.16, 0.42, p), drop = sm(0.44, 0.72, p), mat = sm(0.74, 0.95, p);
    walls.scale.y = 0.012 + rise * 0.988;
    wallMat.color.copy(INK).lerp(PLASTER, sm(0.18, 0.36, p));
    slats.visible = rise > 0.02;
    cove.visible = mat > 0.3;
    for (const f of furniture) {
      const k = sm(f.delay * 0.6, f.delay * 0.6 + 0.4, drop);
      f.obj.visible = k > 0.001;
      f.obj.position.y = f.y + (1 - k) * 1.6;
    }
    uClay.value = 1 - mat;
    shadeMat.emissiveIntensity = mat * 1.4;
    lampLight.intensity = opts.dusk ? mat * 2.2 : mat * 0.6;
    hemi.intensity = (opts.dusk ? 0.75 : 0.9) - mat * 0.15;
    sun.intensity = 1.2 + rise * (opts.dusk ? 1.7 : 1.4);
  };
  build(0);

  const prepare = () => {
    const hidden: T.Object3D[] = [];
    scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });
    renderer.compile(scene, camera);
    hidden.forEach((o) => { o.visible = false; });
    renderer.shadowMap.needsUpdate = true;
  };

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix();
  };
  resize();

  const dispose = () => { renderer.dispose(); renderer.domElement.remove(); };
  return { THREE, renderer, scene, camera, build, prepare, ready, resize, dispose };
}
