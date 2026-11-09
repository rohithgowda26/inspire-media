/**
 * Physically simulated velvet stage curtains (Verlet cloth) rendered with WebGL.
 *
 * Each curtain is a grid of particles hanging from rings on a rail. The cloth is ~1.5× wider than
 * the space it hangs in (like real stage curtains), so it naturally falls into deep folds. Opening
 * slides the rings to the sides: the cloth bunches up, swings and settles by itself.
 * Shading: velvet (dark facing you, bright crimson sheen on the turning folds), ambient occlusion in
 * the fold valleys, a warm spotlight from above, gold trim on the leading edge and a gold hem.
 * The gathered valance with swags, gold rope and fringe is drawn in a second pass.
 */

export type Cloth = { open: (durationMs: number) => void; stop: () => void };

/* ───────────────────────── shaders ───────────────────────── */

const CLOTH_VS = `
attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUv;
uniform vec2 uRes;
varying vec3 vNor; varying vec2 vUv; varying vec3 vPos;
void main(){
  vNor = aNor; vUv = aUv; vPos = aPos;
  gl_Position = vec4(aPos.x / uRes.x * 2.0 - 1.0, 1.0 - aPos.y / uRes.y * 2.0, -aPos.z / 2000.0, 1.0);
}`;

const CLOTH_FS = `
precision highp float;
varying vec3 vNor; varying vec2 vUv; varying vec3 vPos;
uniform vec2 uRes; uniform float uTrim; uniform float uFold;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
void main(){
  vec3 n = normalize(vNor);
  if (!gl_FrontFacing) n = -n;
  if (n.z < 0.0) n = -n;
  // fine pile texture perturbs the normal a little
  float g = noise(vUv * vec2(900.0, 40.0));
  n = normalize(n + vec3((g - 0.5) * 0.08, 0.0, 0.0));
  vec3 L = normalize(vec3(-0.28, -0.62, 0.74));          // key light: above, slightly left, in front (y is down)
  float wrap = clamp((dot(n, L) + 0.25) / 1.25, 0.0, 1.0);
  float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 2.0);       // velvet sheen on turning folds
  float ao = mix(0.38, 1.0, smoothstep(-uFold, uFold * 0.8, vPos.z));
  float v = vPos.y / uRes.y;
  float spot = mix(1.18, 0.5, smoothstep(0.12, 1.0, v)) * (0.85 + 0.15 * (1.0 - abs(vPos.x / uRes.x - 0.5) * 2.0));
  vec3 base = vec3(0.47, 0.018, 0.05);
  vec3 col = base * (0.12 + 1.15 * wrap) * ao + vec3(0.95, 0.20, 0.27) * rim * 0.62 * ao;
  col += vec3(1.0, 0.55, 0.5) * pow(max(dot(reflect(-L, n), vec3(0,0,1)), 0.0), 18.0) * 0.06;
  col *= spot * (0.94 + 0.06 * g);
  // gold trim on the leading edge
  float t = smoothstep(1.0 - uTrim, 1.0 - uTrim * 0.8, vUv.x);
  if (t > 0.0) {
    float d = max(dot(n, L), 0.0);
    vec3 gold = vec3(0.80, 0.58, 0.24) * (0.3 + 0.9 * d) + vec3(1.0, 0.9, 0.62) * pow(d, 12.0) * 0.8;
    gold *= 0.88 + 0.12 * sin(vPos.y * 0.9);               // braid
    col = mix(col, gold * spot, t);
  }
  // gold hem
  float hem = smoothstep(0.972, 0.978, vUv.y);
  col = mix(col, vec3(0.78, 0.56, 0.24) * (0.35 + 0.7 * wrap) * spot, hem * 0.9);
  gl_FragColor = vec4(col, 1.0);
}`;

const QUAD_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

// valance (pelmet) with swags, gold rope and fringe
const VAL_FS = `
precision highp float;
uniform vec2 R; uniform float D;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
const vec3 GOLD = vec3(0.84, 0.61, 0.26);
void main(){
  float x = gl_FragCoord.x, y = R.y - gl_FragCoord.y;
  float swags = R.x / D < 700.0 ? 3.0 : 5.0;
  float s = fract(x / (R.x / swags));
  float base = max(R.y * 0.07, 46.0 * D), droop = max(R.y * 0.05, 26.0 * D);
  float bottom = base + droop * sin(3.14159 * s);
  float fl = 15.0 * D;
  if (y > bottom + fl) {
    // soft shadow the valance throws on the cloth below
    float sh = 1.0 - smoothstep(bottom + fl, bottom + fl + 40.0 * D, y);
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.45 * sh); return;
  }
  if (y > bottom + 3.0 * D) {
    float col = floor(x / (2.4 * D));
    float t = (y - bottom - 3.0 * D) / (fl - 3.0 * D);
    float len = 0.75 + 0.25 * hash(vec2(col, 2.0));
    float a = step(0.4, fract(x / (2.4 * D))) * step(t, len) * (1.0 - 0.6 * t);
    vec3 g = GOLD * (0.65 + 0.5 * (1.0 - t)) * (0.8 + 0.4 * hash(vec2(col, 3.0)));
    gl_FragColor = vec4(g * a, a); return;
  }
  if (y > bottom - 3.0 * D) {
    float tw = sin((x + y * 1.7) / (2.0 * D));
    vec3 g = GOLD * (0.55 + 0.55 * tw) + vec3(1.0, 0.9, 0.6) * pow(max(tw, 0.0), 8.0) * 0.6;
    gl_FragColor = vec4(g, 1.0); return;
  }
  float t = y / bottom;
  float ph = t * 4.5 * 6.28318 + noise(vec2(x / (70.0 * D), t * 2.0)) * 1.3;
  float h = sin(ph);
  float edgeAo = 0.5 + 0.5 * sin(3.14159 * s);
  vec3 n = normalize(vec3(0.0, cos(ph) * 1.3 * (0.5 + 0.5 * edgeAo), 1.0));
  vec3 L = normalize(vec3(-0.28, -0.62, 0.74));
  float wrap = clamp((dot(n, L) + 0.25) / 1.25, 0.0, 1.0);
  float rim = pow(1.0 - n.z, 2.0);
  float ao = (0.45 + 0.55 * smoothstep(-1.0, 1.0, h)) * (0.5 + 0.5 * edgeAo);
  vec3 c = vec3(0.47, 0.018, 0.05) * (0.15 + 1.1 * wrap) * ao + vec3(0.95, 0.2, 0.27) * rim * 0.6 * ao;
  c *= 0.94 + 0.06 * noise(vec2(x * 0.5, y * 0.05));
  if (y < 7.0 * D) c = GOLD * (0.6 + 0.6 * smoothstep(0.0, 3.5 * D, y) * smoothstep(7.0 * D, 3.5 * D, y));
  gl_FragColor = vec4(c, 1.0);
}`;

/* ───────────────────────── simulation ───────────────────────── */

type Panel = {
  side: 1 | -1; // 1 = left curtain, -1 = right
  C: number;
  Rw: number;
  pos: Float32Array; // x,y,z
  prev: Float32Array;
  rings: number[]; // particle indices pinned to rings (top row)
  ringX0: number[]; // ring x when closed (distance from the outer edge)
  ringZ: number[];
  isRing: Uint8Array; // 1 if the top-row column hangs from a ring
};

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function makePanel(side: 1 | -1, W: number, H: number, C: number, Rw: number, railY: number, fullness: number, ringEvery: number): Panel {
  const span = W / 2 + 6; // closed: a little overlap in the middle
  const rest = (span * fullness) / (C - 1);
  const dy = (H + 12 - railY) / (Rw - 1);
  const pos = new Float32Array(C * Rw * 3);
  // start already folded: zig-zag between rings with the right arc length
  const ringSpacingCols = ringEvery;
  const compressed = span / (C - 1);
  const amp = 0.5 * Math.sqrt(Math.max(0, rest * rest - compressed * compressed)) * ringSpacingCols / Math.PI * 1.4;
  for (let r = 0; r < Rw; r++)
    for (let c = 0; c < C; c++) {
      const i = (r * C + c) * 3;
      const xo = compressed * c; // distance from outer edge
      pos[i] = side === 1 ? xo : W - xo;
      pos[i + 1] = railY + dy * r;
      pos[i + 2] = Math.sin((c / ringSpacingCols) * Math.PI) * amp * (1 - 0.25 * (r / Rw));
    }
  const rings: number[] = [];
  const ringX0: number[] = [];
  const ringZ: number[] = [];
  for (let c = 0; c < C; c += ringEvery) {
    rings.push(c);
    ringX0.push(compressed * c);
    ringZ.push(pos[c * 3 + 2]);
  }
  if (rings[rings.length - 1] !== C - 1) {
    rings.push(C - 1);
    ringX0.push(compressed * (C - 1));
    ringZ.push(0);
  }
  const isRing = new Uint8Array(C);
  rings.forEach((c) => (isRing[c] = 1));
  return { side, C, Rw, pos, prev: pos.slice(), rings, ringX0, ringZ, isRing };
}

export function stepPanel(P: Panel, W: number, H: number, railY: number, restX: number, restY: number, open: number, gatherW: number, t: number, dt: number) {
  const { C, Rw, pos, prev } = P;
  const N = C * Rw;
  const g = 2600;
  // integrate
  for (let k = 0; k < N; k++) {
    const i = k * 3;
    const r = (k / C) | 0;
    const wind = Math.sin(t * 0.9 + r * 0.07 + P.side) * 14 + Math.sin(t * 2.3 + (k % C) * 0.2) * 6;
    const weight = r >= Rw - 2 ? 3 : 1; // weighted hem
    const damp = 0.985 - 0.012 * (r / Rw); // heavier, slower cloth towards the floor
    for (let a = 0; a < 3; a++) {
      const p = pos[i + a];
      const v = (p - prev[i + a]) * damp;
      prev[i + a] = p;
      pos[i + a] = p + v + (a === 1 ? g * weight * dt * dt : a === 2 ? wind * dt * dt : 0);
    }
  }
  // rings: slide along the rail
  const e = ease(open);
  const span0 = P.ringX0[P.ringX0.length - 1];
  const span1 = gatherW;
  const pin = () => {
    for (let j = 0; j < P.rings.length; j++) {
      const c = P.rings[j];
      const f = P.ringX0[j] / span0;
      const xo = f * (span0 + (span1 - span0) * e);
      const i = c * 3;
      pos[i] = P.side === 1 ? xo : W - xo;
      pos[i + 1] = railY;
      pos[i + 2] = P.ringZ[j] * (1 + e * 0.6);
      prev[i] = pos[i];
      prev[i + 1] = pos[i + 1];
      prev[i + 2] = pos[i + 2];
    }
  };
  pin();
  const ring = P.isRing;
  const solve = (a: number, b: number, rest: number, stiff: number, onlyStretch: boolean, pinA: boolean, pinB: boolean) => {
    const ia = a * 3, ib = b * 3;
    const dx = pos[ib] - pos[ia], dy = pos[ib + 1] - pos[ia + 1], dz = pos[ib + 2] - pos[ia + 2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
    if (onlyStretch && d < rest) return;
    const diff = ((d - rest) / d) * stiff;
    const wa = pinA ? 0 : pinB ? 1 : 0.5;
    const wb = pinB ? 0 : pinA ? 1 : 0.5;
    pos[ia] += dx * diff * wa; pos[ia + 1] += dy * diff * wa; pos[ia + 2] += dz * diff * wa;
    pos[ib] -= dx * diff * wb; pos[ib + 1] -= dy * diff * wb; pos[ib + 2] -= dz * diff * wb;
  };
  for (let it = 0; it < 5; it++) {
    for (let r = 0; r < Rw; r++)
      for (let c = 0; c < C; c++) {
        const k = r * C + c;
        const top = r === 0;
        const pinned = top && ring[c] === 1;
        if (c < C - 1) solve(k, k + 1, restX, 1, false, pinned, top && ring[c + 1] === 1);
        if (r < Rw - 1) solve(k, k + C, restY, 1, r < Rw - 6, pinned, false); // hem rows stay straight
        if (c < C - 2) solve(k, k + 2, restX * 2, 0.08, false, pinned, top && ring[c + 2] === 1); // bending: keeps folds round
        if (r < Rw - 2) solve(k, k + 2 * C, restY * 2, 0.5, true, pinned, false);
      }
    pin();
  }
  // keep cloth in front of the backdrop, and above the floor
  for (let k = 0; k < N; k++) {
    const i = k * 3;
    if (pos[i + 1] > H + 14) pos[i + 1] = H + 14;
    if (pos[i + 2] < -260) pos[i + 2] = -260;
  }
}

/* ───────────────────────── renderer ───────────────────────── */

export function startCloth(canvas: HTMLCanvasElement, onReady?: () => void): Cloth | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true, depth: true }) as WebGLRenderingContext | null;
  if (!gl) return null;

  const program = (vs: string, fs: string) => {
    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("link");
    return p;
  };
  let clothProg: WebGLProgram, valProg: WebGLProgram;
  try {
    clothProg = program(CLOTH_VS, CLOTH_FS);
    valProg = program(QUAD_VS, VAL_FS);
  } catch (e) {
    console.error("[curtains]", e);
    return null;
  }

  const W = window.innerWidth;
  const H = window.innerHeight;
  const small = W < 700;
  const dpr = Math.min(window.devicePixelRatio || 1, W * H > 1_600_000 ? 1.25 : 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);

  const C = small ? 44 : 84;
  const Rw = small ? 40 : 50;
  const ringEvery = small ? 3 : 4;
  const fullness = small ? 1.35 : 1.55;
  const railY = Math.max(H * 0.04, 22);
  const span = W / 2 + 6;
  const restX = (span * fullness) / (C - 1);
  const restY = (H + 12 - railY) / (Rw - 1);
  const gatherW = small ? Math.max(W * 0.04, 14) : Math.max(W * 0.08, 70);
  const panels = [makePanel(1, W, H, C, Rw, railY, fullness, ringEvery), makePanel(-1, W, H, C, Rw, railY, fullness, ringEvery)];

  // mesh buffers
  const NV = C * Rw;
  const verts = new Float32Array(NV * 2 * 8);
  const idx: number[] = [];
  for (let p = 0; p < 2; p++)
    for (let r = 0; r < Rw - 1; r++)
      for (let c = 0; c < C - 1; c++) {
        const a = p * NV + r * C + c;
        idx.push(a, a + 1, a + C, a + 1, a + C + 1, a + C);
      }
  const vbo = gl.createBuffer();
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, verts.byteLength, gl.DYNAMIC_DRAW);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(clothProg, "aPos");
  const aNor = gl.getAttribLocation(clothProg, "aNor");
  const aUv = gl.getAttribLocation(clothProg, "aUv");
  const aQuad = gl.getAttribLocation(valProg, "p");

  const fillVerts = () => {
    for (let p = 0; p < 2; p++) {
      const P = panels[p];
      const pos = P.pos;
      for (let r = 0; r < Rw; r++)
        for (let c = 0; c < C; c++) {
          const k = r * C + c;
          const i = k * 3;
          const l = c > 0 ? k - 1 : k, rr = c < C - 1 ? k + 1 : k;
          const u = r > 0 ? k - C : k, d = r < Rw - 1 ? k + C : k;
          const tx = pos[rr * 3] - pos[l * 3], ty = pos[rr * 3 + 1] - pos[l * 3 + 1], tz = pos[rr * 3 + 2] - pos[l * 3 + 2];
          const bx = pos[d * 3] - pos[u * 3], by = pos[d * 3 + 1] - pos[u * 3 + 1], bz = pos[d * 3 + 2] - pos[u * 3 + 2];
          let nx = ty * bz - tz * by, ny = tz * bx - tx * bz, nz = tx * by - ty * bx;
          const len = Math.hypot(nx, ny, nz) || 1;
          nx /= len; ny /= len; nz /= len;
          if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
          const o = (p * NV + k) * 8;
          verts[o] = pos[i]; verts[o + 1] = pos[i + 1]; verts[o + 2] = pos[i + 2] + (p === 0 ? 30 : 0); // left overlaps in front
          verts[o + 3] = nx; verts[o + 4] = ny; verts[o + 5] = nz;
          verts[o + 6] = c / (C - 1); verts[o + 7] = r / (Rw - 1);
        }
    }
  };

  const draw = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // cloth
    gl.useProgram(clothProg);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);
    fillVerts();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, verts);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(aNor);
    gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 32, 24);
    gl.uniform2f(gl.getUniformLocation(clothProg, "uRes"), W, H);
    gl.uniform1f(gl.getUniformLocation(clothProg, "uTrim"), 12 / (span * fullness));
    gl.uniform1f(gl.getUniformLocation(clothProg, "uFold"), 40);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(aNor);
    gl.disableVertexAttribArray(aUv);
    // valance on top
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(valProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(aQuad);
    gl.vertexAttribPointer(aQuad, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(gl.getUniformLocation(valProg, "R"), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(valProg, "D"), dpr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // the cloth settles into its folds over the first few frames (in small chunks, so the page never freezes)
  const SUB = 1 / 120;
  let simT = 0;
  const SETTLE = small ? 36 : 44;
  let settled = 0;

  // (test hook: lets an automated check fast-forward the physics on a slow machine)
  const hook = (window as unknown as { __clothTest?: { maxSteps: number; maxDt: number } }).__clothTest;
  const maxSteps = hook?.maxSteps ?? 4;
  const maxDt = hook?.maxDt ?? 0.05;
  let openStart = -1;
  let openDur = 2600;
  let raf = 0;
  let last = performance.now();
  let acc = 0;
  let settledAt = -1;
  let ready = false;
  const frame = (now: number) => {
    if (settled < SETTLE) {
      const t0 = performance.now();
      while (settled < SETTLE && performance.now() - t0 < 14) {
        simT += SUB;
        for (const P of panels) stepPanel(P, W, H, railY, restX, restY, 0, gatherW, simT, SUB);
        settled++;
      }
      last = now;
      raf = requestAnimationFrame(frame);
      return;
    }
    acc += Math.max(0, Math.min((now - last) / 1000, maxDt));
    last = now;
    // opening follows simulation time, so a slow device plays it in slow motion instead of glitching
    const openP = openStart < 0 ? 0 : ((simT - openStart) * 1000) / openDur;
    let steps = 0;
    while (acc >= SUB && steps < maxSteps) {
      simT += SUB;
      for (const P of panels) stepPanel(P, W, H, railY, restX, restY, Math.min(openP, 1), gatherW, simT, SUB);
      acc -= SUB;
      steps++;
    }
    if (steps === maxSteps) acc = 0; // device too slow: don't spiral
    draw();
    if (!ready) {
      ready = true;
      onReady?.();
    }
    // fully open and swung out → hold the frame, free CPU/GPU for the fireworks
    if (openP >= 1.6 && settledAt < 0) settledAt = now;
    if (settledAt > 0 && now - settledAt > 2200) return;
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    open: (ms) => {
      if (openStart < 0) {
        openStart = simT;
        openDur = ms;
      }
    },
    stop: () => cancelAnimationFrame(raf),
  };
}
