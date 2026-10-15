// Photo with a depth map drawn by a tiny WebGL shader: near pixels move more than far ones,
// which gives the flat image real parallax with the pointer and the scroll.

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uImg, uDepth;
uniform vec2 uRes, uImgRes, uLook;
uniform float uScroll, uFocus, uIntro, uPan, uPanFrom, uPanTo, uZoom;
// visible window of the image (cover), zoomed, sliding across it with uPan: a panorama of the room
vec2 view(vec2 uv){
  float rs = uRes.x / uRes.y, ri = uImgRes.x / uImgRes.y;
  vec2 s = (rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0)) / (uZoom + uIntro * 0.08);
  float cx = mix(uPanFrom, uPanTo, uPan);
  cx = clamp(cx, s.x * 0.5 + 0.002, 1.0 - s.x * 0.5 - 0.002);
  float cy = clamp(0.5 + uScroll * 0.03, s.y * 0.5, 1.0 - s.y * 0.5);
  return (uv - 0.5) * s + vec2(cx, cy);
}
void main(){
  vec2 uv = view(vUv);
  uv.y = 1.0 - uv.y;
  float d = texture2D(uDepth, uv).r;
  // near things slide more than the far view: the depth that makes the pan read as walking past
  vec2 shift = (uLook * vec2(0.018, 0.011) + vec2(-uPan * 0.05, -uScroll * 0.02)) * (d - uFocus);
  vec2 q = clamp(uv + shift, 0.001, 0.999);
  gl_FragColor = vec4(texture2D(uImg, q).rgb, 1.0);
}`;

export type DepthLayer = {
  ready: Promise<void>;
  draw: (look: { x: number; y: number }, opts: { pan: number; scroll: number; intro: number; from: number; to: number; zoom: number }) => void;
  resize: () => void;
};

export function createDepthLayer(canvas: HTMLCanvasElement, src: string, depthSrc: string): DepthLayer | null {
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  if (!gl) return null;
  const sh = (type: number, code: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, code); gl.compileShader(s); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = U("uRes"), uImgRes = U("uImgRes"), uLook = U("uLook"), uScroll = U("uScroll"), uFocus = U("uFocus"), uIntro = U("uIntro");
  const uPan = U("uPan"), uPanFrom = U("uPanFrom"), uPanTo = U("uPanTo"), uZoom = U("uZoom");
  gl.uniform1i(U("uImg"), 0); gl.uniform1i(U("uDepth"), 1);

  const tex = (img: HTMLImageElement, unit: number) => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  const load = (s: string) => new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.decoding = "async"; i.onload = () => ok(i); i.onerror = bad; i.src = s; });

  let imgW = 1, imgH = 1, loaded = false;
  const ready = Promise.all([load(src), load(depthSrc)]).then(([c, d]) => {
    tex(c, 0); tex(d, 1); imgW = c.naturalWidth; imgH = c.naturalHeight; loaded = true;
  });

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  const draw: DepthLayer["draw"] = (look, o) => {
    if (!loaded) return;
    gl.uniform2f(uRes, canvas.width, canvas.height); gl.uniform2f(uImgRes, imgW, imgH);
    gl.uniform2f(uLook, look.x, look.y); gl.uniform1f(uScroll, o.scroll); gl.uniform1f(uFocus, 0.45);
    gl.uniform1f(uIntro, o.intro); gl.uniform1f(uPan, o.pan); gl.uniform1f(uPanFrom, o.from); gl.uniform1f(uPanTo, o.to); gl.uniform1f(uZoom, o.zoom);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  return { ready, draw, resize };
}
