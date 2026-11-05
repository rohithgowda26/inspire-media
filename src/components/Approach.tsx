"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { journey } from "@/lib/site";
import { Reveal } from "./ui/Reveal";

const phases = journey.phases;
const N = phases.length;
const pad = (n: number) => String(n).padStart(2, "0");

type Geometry = { w: number; h: number; r: number; step: number; stage: number; top: number };
const DESKTOP: Geometry = { w: 280, h: 204, r: 660, step: 19, stage: 500, top: 36 };
const MOBILE: Geometry = { w: 228, h: 182, r: 470, step: 25, stage: 420, top: 28 };

/** Move to the next phase automatically every … ms (paused while hovered, dragged or off-screen). */
const AUTOPLAY_MS = 2000;

/**
 * "How we plan & deliver": eight phase cards on a rotating arc (wheel).
 * Drag, click a card, use the arrows/dots or the keyboard (← →) to move through it.
 */
export function Approach() {
  const [geo, setGeo] = useState<Geometry>(DESKTOP);
  const [active, setActive] = useState(0);

  const pos = useRef(0); // current (animated) position, fractional while moving
  const target = useRef(0);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const frame = useRef(0);
  const reduced = useRef(false);
  const drag = useRef<{ x: number; start: number; moved: boolean; id: number } | null>(null);
  const hovering = useRef(false);
  const onScreen = useRef(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Lay every card out on the arc for the current position
  const paint = useCallback(() => {
    cards.current.forEach((el, i) => {
      if (!el) return;
      const d = i - pos.current;
      const ad = Math.abs(d);
      const near = Math.min(1, ad);
      el.style.transform = `rotate(${d * geo.step}deg)`;
      el.style.opacity = ad > 4.5 ? "0" : String(Math.max(0, 1 - near * 0.42 - Math.max(0, ad - 1) * 0.13));
      el.style.zIndex = String(100 - Math.round(ad * 10));
      const inner = el.firstElementChild as HTMLElement;
      inner.style.transform = `scale(${1 - near * 0.07})`;
      inner.style.filter = near > 0.02 ? `blur(${(near * 1.4).toFixed(2)}px)` : "none";
      (inner.querySelector("[data-glow]") as HTMLElement).style.opacity = String(1 - near);
    });
  }, [geo.step]);

  // Ease the wheel toward the target phase
  const animate = useCallback(() => {
    cancelAnimationFrame(frame.current);
    const tick = () => {
      if (drag.current) return;
      const diff = target.current - pos.current;
      pos.current = reduced.current || Math.abs(diff) < 0.001 ? target.current : pos.current + diff * 0.14;
      paint();
      if (pos.current !== target.current) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, [paint]);

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(N - 1, i));
      target.current = next;
      setActive(next);
      animate();
    },
    [animate],
  );

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mq = window.matchMedia("(max-width: 639px)");
    const apply = () => setGeo(mq.matches ? MOBILE : DESKTOP);
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  useEffect(() => paint(), [paint, geo]);

  // Autoplay: 1 → 2 → … → 8 → back to 1, every AUTOPLAY_MS. Stops while the mouse is over the wheel.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wheelRef.current;
    const io = new IntersectionObserver(([e]) => (onScreen.current = e.isIntersecting), { threshold: 0.3 });
    if (el) io.observe(el);
    const id = window.setInterval(() => {
      if (hovering.current || drag.current || !onScreen.current || document.visibilityState !== "visible") return;
      go(target.current >= N - 1 ? 0 : target.current + 1);
    }, AUTOPLAY_MS);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [go]);

  // Drag (mouse, pen or touch) to rotate; a tap on a card selects it, a tap on the active card advances
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    cancelAnimationFrame(frame.current);
    drag.current = { x: e.clientX, start: pos.current, moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    pos.current = Math.max(-0.45, Math.min(N - 0.55, d.start - dx / (geo.w * 0.85)));
    paint();
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (d.moved) {
      go(Math.round(pos.current));
      return;
    }
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-index]");
    if (!card) return animate();
    const i = Number(card.dataset.index);
    go(i === target.current ? (i === N - 1 ? 0 : i + 1) : i);
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(target.current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(target.current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(N - 1);
    }
  };

  const current = phases[active];

  return (
    <section id="approach" aria-labelledby="approach-title" className="relative overflow-x-clip px-4 pt-24 sm:px-6 lg:pt-32">
      <div aria-hidden="true" className="absolute left-1/2 top-[34%] -z-10 h-[460px] w-[min(1100px,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.14),transparent)]" />

      {/* Heading */}
      <div className="mx-auto grid max-w-[1232px] gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <Reveal className="hidden flex-col gap-4 lg:flex">
          <p aria-hidden="true" className="text-silver text-[64px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
            {pad(active + 1)}
            <span className="text-electric">.</span>
          </p>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-muted">{journey.label}</p>
          <span aria-hidden="true" className="h-16 w-px bg-gradient-to-b from-electric to-transparent" />
        </Reveal>
        <Reveal className="flex flex-col gap-4">
          <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-electric">
            <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-electric" />
            {journey.eyebrow}
          </p>
          <h2 id="approach-title" className="text-[38px] font-semibold leading-[1.06] tracking-[-0.035em] text-white sm:text-[56px]">
            {journey.titleStart} <mark className="hl">{journey.titleAccent}</mark>
            <span className="text-electric">.</span>
          </h2>
          <p className="max-w-3xl text-[15px] leading-relaxed text-mist sm:text-base">{journey.body}</p>
        </Reveal>
      </div>

      {/* Screen-reader version of the journey */}
      <ol className="sr-only">
        {phases.map((p, i) => (
          <li key={p.title}>
            Phase {i + 1} of {N}: {p.title}. {p.body}
          </li>
        ))}
      </ol>

      {/* Wheel */}
      <div
        ref={wheelRef}
        onMouseEnter={() => (hovering.current = true)}
        onMouseLeave={() => (hovering.current = false)}
        role="group"
        aria-roledescription="carousel"
        aria-label="Our eight-phase journey"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative mx-auto mt-10 max-w-[1400px] rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-electric/60 sm:mt-14"
      >
        <div
          aria-hidden="true"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
          style={{
            height: geo.stage,
            // fade out at the left, right and bottom edges
            maskImage: "linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent), linear-gradient(180deg,#000 62%,transparent)",
            maskComposite: "intersect",
            WebkitMaskImage: "linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent), linear-gradient(180deg,#000 62%,transparent)",
            WebkitMaskComposite: "source-in",
          }}
        >
          {phases.map((p, i) => (
            <div
              key={p.title}
              data-index={i}
              ref={(el) => {
                cards.current[i] = el;
              }}
              className="absolute left-1/2 will-change-transform"
              style={{
                width: geo.w,
                height: geo.h,
                marginLeft: -geo.w / 2,
                top: geo.top,
                transformOrigin: `50% ${geo.r + geo.h / 2}px`,
                transform: `rotate(${i * geo.step}deg)`,
                opacity: i === 0 ? 1 : 0.4,
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-white/[0.09] bg-[#121a2e]/80 shadow-[0_30px_60px_-24px_rgb(0_0_0/0.9)] backdrop-blur-sm">
                {/* Active-state glow (fades in as the card reaches the top) */}
                <div
                  data-glow
                  className="pointer-events-none absolute inset-0 rounded-[20px] bg-[linear-gradient(160deg,#18234a_0%,#0e1426_60%)] shadow-[inset_0_0_0_1px_rgb(40_123_255/0.45),0_0_50px_-10px_rgb(23_71_255/0.55)]"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                />
                <div className="relative flex h-full flex-col p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[13px] font-medium text-electric">{pad(i + 1)}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted">Phase</span>
                  </div>
                  <p className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-white sm:text-[24px]">{p.title}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-mist sm:text-[13px]">{p.body}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-white/[0.08] pt-3 font-mono text-[10px] tracking-[0.18em] text-muted">
                    <span>
                      {pad(i + 1)} / {pad(N)}
                    </span>
                    <span className="text-[14px] text-electric">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="relative z-10 -mt-24 flex flex-col items-center gap-4 pb-6 sm:-mt-28 sm:pb-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label="Previous phase"
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-panel text-white transition hover:bg-raise disabled:cursor-default disabled:opacity-35"
            >
              ←
            </button>
            <p
              aria-live="polite"
              className="flex h-11 min-w-[200px] items-center justify-center gap-3 rounded-full border border-white/10 bg-panel px-5 font-mono text-[11px] uppercase tracking-[0.2em]"
            >
              <span className="text-electric">
                {pad(active + 1)} <span className="text-muted">/ {pad(N)}</span>
              </span>
              <span aria-hidden="true" className="h-4 w-px bg-white/15" />
              <span className="font-semibold text-white">{current.title}</span>
            </p>
            <button
              type="button"
              onClick={() => go(active + 1)}
              disabled={active === N - 1}
              aria-label="Next phase"
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-panel text-white transition hover:bg-raise disabled:cursor-default disabled:opacity-35"
            >
              →
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {phases.map((p, i) => (
              <button
                key={p.title}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to phase ${i + 1}: ${p.title}`}
                aria-current={i === active ? "step" : undefined}
                className="flex h-5 cursor-pointer items-center"
              >
                <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-electric" : "w-1.5 bg-white/20 hover:bg-white/40"}`} />
              </button>
            ))}
          </div>
          <p className="px-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted sm:tracking-[0.24em]">{journey.hint}</p>
        </div>
      </div>
    </section>
  );
}
