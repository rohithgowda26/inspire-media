/**
 * Realistic aerial fireworks ("sky shots") on two canvases:
 *  - sparks: rockets with ember tails, bursts (peony, chrysanthemum, gold willow, crackle, ring)
 *    drawn additively; the canvas fades a little each frame so sparks leave long-exposure streaks.
 *  - air: the soft flash that lights the sky at each burst, and drifting smoke lit by the colour.
 * Time-based physics, so it looks the same on fast and slow devices.
 */

type Spark = {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; color: string;
  drag: number; grav: number; kind: "star" | "ember" | "willow" | "glitter";
  trail?: boolean; crackleAt?: number;
};
type Rocket = { x: number; y: number; vx: number; vy: number; apex: number; shell: Shell; color: string; alt: string; age: number };
type Shell = "peony" | "chrysanthemum" | "willow" | "crackle" | "ring";
type Puff = { x: number; y: number; r: number; vx: number; vy: number; life: number; max: number; tint: string };
type Flash = { x: number; y: number; life: number; max: number; color: string; size: number };

const COLORS: [string, string][] = [
  ["#4f8bff", "#cfe0ff"], // electric blue (site accent) with ice
  ["#ffcf73", "#fff3d6"], // gold
  ["#287bff", "#ffffff"], // deep blue with white
  ["#ff5a5f", "#ffd27a"], // festive red with gold
  ["#b8d2ff", "#4f8bff"], // ice with blue
];

export function startSkyShots(sparkCanvas: HTMLCanvasElement, airCanvas: HTMLCanvasElement, opts: { durationMs: number; onDone?: () => void }) {
  const sc = sparkCanvas.getContext("2d");
  const ac = airCanvas.getContext("2d");
  if (!sc || !ac) {
    opts.onDone?.();
    return () => {};
  }
  let W = 0, H = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    for (const [c, x] of [[sparkCanvas, sc], [airCanvas, ac]] as const) {
      c.width = W * dpr;
      c.height = H * dpr;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };
  resize();
  window.addEventListener("resize", resize);
  const small = W < 700;
  const S = small ? 0.8 : 1.35; // burst size scale

  // pre-rendered glow sprites per colour
  const sprites = new Map<string, HTMLCanvasElement>();
  const sprite = (color: string) => {
    let s = sprites.get(color);
    if (s) return s;
    s = document.createElement("canvas");
    s.width = s.height = 64;
    const x = s.getContext("2d")!;
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.12, color);
    g.addColorStop(0.35, hexA(color, 0.35));
    g.addColorStop(1, hexA(color, 0));
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
    sprites.set(color, s);
    return s;
  };
  const smokeSprite = (() => {
    const s = document.createElement("canvas");
    s.width = s.height = 128;
    const x = s.getContext("2d")!;
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(200,205,220,0.5)");
    g.addColorStop(0.5, "rgba(170,180,200,0.18)");
    g.addColorStop(1, "rgba(150,160,180,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    return s;
  })();

  const rockets: Rocket[] = [];
  const sparks: Spark[] = [];
  const puffs: Puff[] = [];
  const flashes: Flash[] = [];
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];

  // choreography: opening volley, a steady show, then a finale
  const shells: Shell[] = ["peony", "chrysanthemum", "willow", "crackle", "ring"];
  const plan: { at: number; x: number; shell: Shell }[] = [];
  const D = opts.durationMs;
  plan.push({ at: 0, x: 0.3, shell: "chrysanthemum" }, { at: 250, x: 0.7, shell: "peony" });
  let t = 900;
  let i = 0;
  while (t < D - 2600) {
    plan.push({ at: t, x: Math.random() < 0.5 ? rand(0.1, 0.38) : rand(0.62, 0.9), shell: shells[i++ % shells.length] });
    t += rand(420, 760);
  }
  [0.22, 0.5, 0.78, 0.36, 0.64].forEach((x, k) => plan.push({ at: D - 2400 + k * 140, x, shell: k === 1 ? "willow" : pick(shells) }));
  plan.sort((a, b) => a.at - b.at);

  const launch = (xf: number, shell: Shell) => {
    const [color, alt] = shell === "willow" ? ["#ffcf73", "#fff3d6"] : pick(COLORS);
    const apex = rand(H * 0.13, H * 0.33);
    const x = W * xf;
    const h = H - apex;
    const vy = -Math.sqrt(2 * 520 * h) * rand(0.97, 1.02); // reach the apex under drag-free gravity 520
    rockets.push({ x, y: H + 8, vx: rand(-18, 18), vy, apex, shell, color, alt, age: 0 });
  };

  const burst = (r: Rocket) => {
    const n = Math.round((r.shell === "willow" ? 90 : r.shell === "ring" ? 70 : 120) * (small ? 0.7 : 1));
    const speed = (r.shell === "willow" ? 170 : r.shell === "ring" ? 230 : 260) * S * rand(0.9, 1.1);
    const tilt = rand(0.25, 0.6);
    const rot = rand(0, Math.PI);
    for (let k = 0; k < n; k++) {
      let vx: number, vy: number;
      if (r.shell === "ring") {
        const a = (k / n) * Math.PI * 2;
        const cx = Math.cos(a) * speed, cy = Math.sin(a) * speed * tilt;
        vx = cx * Math.cos(rot) - cy * Math.sin(rot);
        vy = cx * Math.sin(rot) + cy * Math.cos(rot);
      } else {
        // uniform sphere projected to 2D (denser at the rim, like real shells)
        const u = rand(-1, 1), a = rand(0, Math.PI * 2);
        const rr = Math.sqrt(1 - u * u);
        vx = Math.cos(a) * rr * speed;
        vy = Math.sin(a) * rr * speed;
      }
      const color = Math.random() < 0.75 ? r.color : r.alt;
      if (r.shell === "willow")
        sparks.push({ x: r.x, y: r.y, vx, vy, life: 0, max: rand(2.6, 3.4), size: rand(1.2, 1.8), color, drag: 1.6, grav: 70, kind: "willow", trail: true });
      else
        sparks.push({
          x: r.x, y: r.y, vx, vy, life: 0, max: rand(1.3, 1.9), size: rand(1.4, 2.2), color, drag: 1.25, grav: 95, kind: "star",
          trail: r.shell === "chrysanthemum",
          crackleAt: r.shell === "crackle" ? rand(0.9, 1.3) : undefined,
        });
    }
    flashes.push({ x: r.x, y: r.y, life: 0, max: 0.55, color: r.color, size: speed * 2.6 });
    for (let k = 0; k < 7; k++)
      puffs.push({ x: r.x + rand(-40, 40) * S, y: r.y + rand(-30, 30) * S, r: rand(50, 90) * S, vx: rand(-8, 8) + 6, vy: rand(-6, 2), life: 0, max: rand(4, 6), tint: r.color });
  };

  const maxDt = (window as unknown as { __clothTest?: { maxDt: number } }).__clothTest?.maxDt ?? 0.05; // test hook
  let raf = 0;
  let last = performance.now();
  const start = last;
  let planned = 0;

  const frame = (now: number) => {
    const dt = Math.max(0, Math.min((now - last) / 1000, maxDt));
    last = now;
    const tt = now - start;
    while (planned < plan.length && tt >= plan[planned].at) launch(plan[planned].x, plan[planned++].shell);

    // long-exposure fade
    sc.globalCompositeOperation = "destination-out";
    sc.fillStyle = `rgba(0,0,0,${Math.min(1, 9 * dt)})`;
    sc.fillRect(0, 0, W, H);
    sc.globalCompositeOperation = "lighter";

    // rockets
    for (let k = rockets.length - 1; k >= 0; k--) {
      const r = rockets[k];
      r.age += dt;
      r.vy += 520 * dt;
      r.x += (r.vx + Math.sin(r.age * 22) * 10) * dt;
      r.y += r.vy * dt;
      // ember tail
      if (Math.random() < 0.9)
        sparks.push({ x: r.x, y: r.y + 4, vx: rand(-14, 14), vy: rand(20, 70), life: 0, max: rand(0.35, 0.7), size: rand(0.8, 1.4), color: "#ffcf86", drag: 2.5, grav: 60, kind: "ember" });
      sc.globalAlpha = 1;
      sc.drawImage(sprite("#ffd9a0"), r.x - 6, r.y - 6, 12, 12);
      if (r.vy >= -30 || r.y <= r.apex) {
        burst(r);
        rockets.splice(k, 1);
      }
    }

    // sparks
    for (let k = sparks.length - 1; k >= 0; k--) {
      const p = sparks[k];
      p.life += dt;
      if (p.life >= p.max) {
        sparks.splice(k, 1);
        continue;
      }
      const f = Math.exp(-p.drag * dt);
      p.vx *= f;
      p.vy = p.vy * f + p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const k01 = p.life / p.max;
      let a = p.kind === "willow" ? 1 - k01 * k01 : (1 - k01) * (1 - k01 * 0.5);
      if (p.kind === "star" && k01 > 0.55) a *= 0.55 + 0.45 * Math.random(); // shimmer as they burn out
      if (p.crackleAt && p.life > p.crackleAt) {
        // crackle: pops into glitter
        for (let q = 0; q < 4; q++)
          sparks.push({ x: p.x, y: p.y, vx: rand(-60, 60), vy: rand(-60, 60), life: 0, max: rand(0.12, 0.28), size: rand(1, 1.6), color: "#fff6dc", drag: 3, grav: 0, kind: "glitter" });
        sparks.splice(k, 1);
        continue;
      }
      if (p.trail && Math.random() < 0.35)
        sparks.push({ x: p.x, y: p.y, vx: p.vx * 0.05, vy: p.vy * 0.05, life: 0, max: rand(0.25, 0.5), size: p.size * 0.7, color: p.kind === "willow" ? "#ffb85a" : p.color, drag: 3, grav: 30, kind: "ember" });
      const s = (p.kind === "glitter" ? 5 : p.kind === "ember" ? 4 : 7) * p.size;
      sc.globalAlpha = Math.max(0, a);
      sc.drawImage(sprite(p.color), p.x - s / 2, p.y - s / 2, s, s);
    }
    sc.globalAlpha = 1;

    // air: sky flashes and smoke
    ac.clearRect(0, 0, W, H);
    ac.globalCompositeOperation = "lighter";
    for (let k = flashes.length - 1; k >= 0; k--) {
      const f = flashes[k];
      f.life += dt;
      if (f.life >= f.max) {
        flashes.splice(k, 1);
        continue;
      }
      const a = (1 - f.life / f.max) ** 2 * 0.32;
      const g = ac.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
      g.addColorStop(0, hexA(f.color, a));
      g.addColorStop(1, hexA(f.color, 0));
      ac.fillStyle = g;
      ac.fillRect(f.x - f.size, f.y - f.size, f.size * 2, f.size * 2);
    }
    ac.globalCompositeOperation = "source-over";
    for (let k = puffs.length - 1; k >= 0; k--) {
      const p = puffs[k];
      p.life += dt;
      if (p.life >= p.max) {
        puffs.splice(k, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += 10 * dt;
      const k01 = p.life / p.max;
      ac.globalAlpha = Math.sin(Math.min(k01 * 3, 1) * Math.PI * 0.5) * (1 - k01) * 0.22;
      ac.drawImage(smokeSprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    ac.globalAlpha = 1;

    const done = planned >= plan.length && rockets.length === 0 && sparks.length === 0 && tt > D;
    if (done) {
      opts.onDone?.();
      return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
