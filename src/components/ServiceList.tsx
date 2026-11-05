"use client";

import { useEffect, useRef } from "react";
import { prefillLead } from "@/lib/events";
import { serviceList } from "@/lib/site";

const items = serviceList.items;

const SIZE: Record<string, string> = {
  xl: "text-[34px] sm:text-[60px] lg:text-[88px]",
  lg: "text-[26px] sm:text-[44px] lg:text-[62px]",
  md: "text-[20px] sm:text-[32px] lg:text-[44px]",
};

const STYLE: Record<string, string> = {
  solid: "text-white",
  outline:
    "text-transparent [-webkit-text-stroke:1.5px_#e8dcc4] hover:text-cream",
  cream:
    "rounded-full bg-cream px-[0.55em] py-[0.12em] text-[#0a1020] shadow-[0_0_50px_-10px_rgb(232_220_196/0.6)]",
  blue: "rounded-full bg-primary px-[0.55em] py-[0.12em] text-white shadow-[0_0_50px_-10px_rgb(23_71_255/0.8)]",
  glass:
    "rounded-full border border-white/15 bg-white/[0.05] px-[0.6em] py-[0.15em] text-ice backdrop-blur-md",
  glow: "text-cream [text-shadow:0_0_28px_rgb(232_220_196/0.45)]",
};

type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  hover: boolean;
};

/**
 * Services as floating headlines: each name drifts on its own path, bounces off the edges and
 * off the other names, and slides away from the cursor. Hover stops a word; click opens the
 * contact form with that service selected. Static layout for visitors who prefer reduced motion.
 */
export function ServiceList() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    let W = field.clientWidth;
    let H = field.clientHeight;
    const pointer = { x: -9999, y: -9999 };
    let visible = false;

    // Take over from the % starting positions: from here on, transforms move the words.
    const bodies: Body[] = items.map((it, i) => {
      const el = els.current[i]!;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const angle = (i * 137.5 * Math.PI) / 180; // spread directions evenly (golden angle)
      const speed = 22 + ((i * 7) % 5) * 6;
      el.style.left = "0px";
      el.style.top = "0px";
      return {
        x: Math.min(Math.max(0, (it.x / 100) * W), Math.max(0, W - w)),
        y: Math.min(Math.max(0, (it.y / 100) * H), Math.max(0, H - h)),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w,
        h,
        hover: false,
      };
    });

    const measure = () => {
      W = field.clientWidth;
      H = field.clientHeight;
      bodies.forEach((b, i) => {
        const el = els.current[i]!;
        b.w = el.offsetWidth;
        b.h = el.offsetHeight;
        b.x = Math.min(b.x, Math.max(0, W - b.w));
        b.y = Math.min(b.y, Math.max(0, H - b.h));
      });
    };

    const enter = (i: number) => () => (bodies[i].hover = true);
    const leave = (i: number) => () => (bodies[i].hover = false);
    const handlers = bodies.map((_, i) => [enter(i), leave(i)] as const);
    handlers.forEach(([on, off], i) => {
      els.current[i]!.addEventListener("pointerenter", on);
      els.current[i]!.addEventListener("pointerleave", off);
    });

    const onMove = (e: PointerEvent) => {
      const r = field.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onOut = () => {
      pointer.x = pointer.y = -9999;
    };
    field.addEventListener("pointermove", onMove);
    field.addEventListener("pointerleave", onOut);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(field);
    const ro = new ResizeObserver(measure);
    ro.observe(field);

    let raf = 0;
    let last = performance.now();
    const MAX = 70;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) {
        for (const b of bodies) {
          if (b.hover) continue;
          // drift away from the cursor
          const cx = b.x + b.w / 2;
          const cy = b.y + b.h / 2;
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const dist = Math.hypot(dx, dy);
          const reach = 120 + Math.max(b.w, b.h) / 2;
          if (dist < reach && dist > 0.1) {
            const f = ((reach - dist) / reach) * 260 * dt;
            b.vx += (dx / dist) * f;
            b.vy += (dy / dist) * f;
          }
          // keep a calm cruising speed
          const sp = Math.hypot(b.vx, b.vy);
          if (sp > MAX) {
            b.vx *= 0.96;
            b.vy *= 0.96;
          } else if (sp < 18) {
            b.vx *= 1.03;
            b.vy *= 1.03;
          }
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          // bounce off the edges
          if (b.x < 0) ((b.x = 0), (b.vx = Math.abs(b.vx)));
          if (b.y < 0) ((b.y = 0), (b.vy = Math.abs(b.vy)));
          if (b.x + b.w > W)
            ((b.x = Math.max(0, W - b.w)), (b.vx = -Math.abs(b.vx)));
          if (b.y + b.h > H)
            ((b.y = Math.max(0, H - b.h)), (b.vy = -Math.abs(b.vy)));
        }
        // gently push overlapping words apart
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const a = bodies[i];
            const c = bodies[j];
            const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
            const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
            if (ox <= 0 || oy <= 0) continue;
            if (ox < oy) {
              const s = a.x < c.x ? -1 : 1;
              if (!a.hover)
                ((a.x += (s * ox) / 2), (a.vx = s * Math.abs(a.vx)));
              if (!c.hover)
                ((c.x -= (s * ox) / 2), (c.vx = -s * Math.abs(c.vx)));
            } else {
              const s = a.y < c.y ? -1 : 1;
              if (!a.hover)
                ((a.y += (s * oy) / 2), (a.vy = s * Math.abs(a.vy)));
              if (!c.hover)
                ((c.y -= (s * oy) / 2), (c.vy = -s * Math.abs(c.vy)));
            }
          }
        }
        bodies.forEach((b, i) => {
          els.current[i]!.style.transform =
            `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      field.removeEventListener("pointermove", onMove);
      field.removeEventListener("pointerleave", onOut);
      handlers.forEach(([on, off], i) => {
        els.current[i]?.removeEventListener("pointerenter", on);
        els.current[i]?.removeEventListener("pointerleave", off);
      });
    };
  }, []);

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative isolate overflow-x-clip px-4 py-20 sm:px-6 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -z-10 h-[620px] w-[min(1200px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.16),transparent)]"
      />

      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="services-title"
            className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-electric"
          >
            <span
              aria-hidden="true"
              className="h-px w-8 bg-gradient-to-r from-transparent to-electric"
            />
            {serviceList.eyebrow}
          </h2>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:block">
            {serviceList.hint}
          </p>
        </div>

        <div
          ref={fieldRef}
          className="relative mt-8 h-[560px] overflow-hidden rounded-[32px] border border-white/[0.06] bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:56px_56px] sm:h-[600px] lg:h-[660px]"
        >
          {/* Giant outlined word in the background */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[clamp(110px,22vw,330px)] uppercase leading-none text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.05)]"
          >
            What we do
          </span>

          <ul aria-label="Our services">
            {items.map((it, i) => (
              <li key={it.title}>
                <button
                  ref={(el) => {
                    els.current[i] = el;
                  }}
                  type="button"
                  onClick={() => prefillLead({ service: it.formValue })}
                  aria-label={`${it.title}: talk to us about it`}
                  className={`absolute cursor-pointer whitespace-nowrap font-semibold leading-[1.05] tracking-[-0.04em] outline-none transition-[filter,scale,color] duration-300 will-change-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-cream ${SIZE[it.size]} ${STYLE[it.style]}`}
                  style={{ left: `${it.x}%`, top: `${it.y}%` }}
                >
                  {it.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
