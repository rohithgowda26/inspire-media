"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { compare } from "@/lib/site";
import { Hl } from "./ui/Hl";
import { ArrowRightIcon, CheckIcon, CloseIcon } from "./ui/icons";

const rows = compare.rows;
const N = rows.length;
const pad = (n: number) => String(n).padStart(2, "0");

/** Time for each point (ms): the typical-agency line, strike, then the Inspire Media answer. */
const AUTOPLAY_MS = 2000;

/**
 * "Not another agency." — the page scrolls normally; inside the section the points change on
 * their own every AUTOPLAY_MS. For each point the typical-agency line appears grey, is struck
 * through, tips back and blurs away, and the Inspire Media answer rises in white with a blue glow.
 * Arrows and dots move manually; hovering pauses it; it only plays while on screen.
 */
export function Compare() {
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<0 | 1 | 2>(0); // 0 = typical line, 1 = struck, 2 = our answer
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    if (r) setStage(2);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.4,
    });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // Inside each point: strike, then reveal the answer
  useEffect(() => {
    if (reduced) return;
    setStage(0);
    const a = window.setTimeout(() => setStage(1), AUTOPLAY_MS * 0.3);
    const b = window.setTimeout(() => setStage(2), AUTOPLAY_MS * 0.55);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [idx, reduced]);

  // Move to the next point every AUTOPLAY_MS (only while visible and not hovered)
  useEffect(() => {
    if (reduced || paused || !inView) return;
    const t = window.setTimeout(() => setIdx((i) => (i + 1) % N), AUTOPLAY_MS);
    return () => window.clearTimeout(t);
  }, [idx, paused, inView, reduced]);

  const go = useCallback((i: number) => setIdx(((i % N) + N) % N), []);
  const glowBlue = stage === 2;

  return (
    <section
      ref={ref}
      id="about"
      aria-labelledby="compare-title"
      className="relative isolate flex flex-col items-center overflow-hidden px-4 py-24 sm:px-6 lg:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Glow: grey for the typical line, electric blue for our answer */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[620px] w-[min(1100px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(163_173_194/0.10),transparent)] transition-opacity duration-700 ${glowBlue ? "opacity-0" : "opacity-100"}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[680px] w-[min(1200px,150vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.30),transparent)] transition-opacity duration-700 ${glowBlue ? "opacity-100" : "opacity-0"}`}
      />
      {/* Faint giant counter */}
      <span
        key={idx}
        aria-hidden="true"
        className="cmp-count pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(220px,40vw,520px)] leading-none text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.05)]"
      >
        {pad(idx + 1)}
      </span>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-electric">
          <span
            aria-hidden="true"
            className="h-px w-8 bg-gradient-to-r from-transparent to-electric"
          />
          {compare.eyebrow}
          <span
            aria-hidden="true"
            className="h-px w-8 bg-gradient-to-l from-transparent to-electric"
          />
        </p>
        <h2
          id="compare-title"
          className="text-[34px] font-medium leading-[1.05] tracking-[-0.04em] text-white sm:text-[52px]"
        >
          <Hl text={compare.title} />
        </h2>
      </div>

      {/* Stage */}
      <div
        className="relative my-12 h-[230px] w-full max-w-5xl [perspective:900px] sm:h-[280px] lg:h-[300px]"
        aria-live="polite"
      >
        {rows.map((r, i) => {
          const on = i === idx;
          const themVisible = on && stage < 2;
          const usVisible = on && stage === 2;
          return (
            <div
              key={r.us}
              className="absolute inset-0 flex items-center justify-center text-center"
              aria-hidden={!on}
            >
              {/* Typical agency */}
              <div
                className="absolute flex flex-col items-center gap-4 transition-[opacity,transform,filter] ease-[cubic-bezier(.16,1,.3,1)]"
                style={{
                  transitionDuration: themVisible ? "500ms" : "350ms",
                  transitionDelay: themVisible ? "300ms" : "0ms",
                  opacity: themVisible ? 1 : 0,
                  transform: themVisible
                    ? "none"
                    : on
                      ? "translate3d(0,-50px,0) rotateX(55deg)"
                      : "translate3d(0,30px,0)",
                  filter: themVisible ? "none" : "blur(10px)",
                  transformOrigin: "50% 100%",
                }}
              >
                <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.24em] text-muted">
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/[0.06]">
                    <CloseIcon size={10} />
                  </span>
                  {compare.them}
                </span>
                <p className="relative max-w-4xl text-[30px] font-medium leading-[1.1] tracking-[-0.035em] text-white/45 sm:text-[44px] lg:text-[54px]">
                  {r.them}
                  <span
                    aria-hidden="true"
                    className="absolute left-[-2%] top-[52%] h-[3px] w-[104%] origin-left rounded-full bg-white/60 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                    style={{
                      transform: on && stage >= 1 ? "scaleX(1)" : "scaleX(0)",
                    }}
                  />
                </p>
              </div>
              {/* Inspire Media */}
              <div
                className="absolute flex flex-col items-center gap-4 transition-[opacity,transform,filter] ease-[cubic-bezier(.16,1,.3,1)]"
                style={{
                  transitionDuration: usVisible ? "600ms" : "300ms",
                  transitionDelay: usVisible ? "250ms" : "0ms",
                  opacity: usVisible ? 1 : 0,
                  transform: usVisible
                    ? "none"
                    : on
                      ? "translate3d(0,70px,0) scale(0.94)"
                      : "translate3d(0,-60px,0)",
                  filter: usVisible ? "none" : "blur(10px)",
                }}
              >
                <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.24em] text-electric">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_14px_rgb(23_71_255/0.8)]">
                    <CheckIcon size={11} />
                  </span>
                  {compare.us}
                </span>
                <p className="max-w-4xl text-[30px] font-medium leading-[1.1] tracking-[-0.035em] text-white [text-shadow:0_0_40px_rgb(23_71_255/0.45)] sm:text-[44px] lg:text-[54px]">
                  {r.us}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(idx - 1)}
            aria-label="Previous point"
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white transition hover:border-electric hover:bg-primary"
          >
            <span className="rotate-180">
              <ArrowRightIcon size={15} />
            </span>
          </button>
          <div className="flex gap-1.5">
            {rows.map((r, i) => (
              <button
                key={r.us}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show point ${i + 1}`}
                aria-current={i === idx ? "step" : undefined}
                className="flex h-5 cursor-pointer items-center"
              >
                <span
                  className={`block h-1 rounded-full transition-all duration-500 ${i === idx ? "w-8 bg-electric" : "w-3 bg-white/20 hover:bg-white/40"}`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(idx + 1)}
            aria-label="Next point"
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white transition hover:border-electric hover:bg-primary"
          >
            <ArrowRightIcon size={15} />
          </button>
        </div>
        <a href="#contact" className="btn btn-blue !h-12 !px-6 !text-[15px]">
          {compare.cta} <ArrowRightIcon size={15} />
        </a>
      </div>

      {/* Full list for screen readers */}
      <ul className="sr-only">
        {rows.map((r) => (
          <li key={r.us}>
            {compare.them}: {r.them}. {compare.us}: {r.us}.
          </li>
        ))}
      </ul>
    </section>
  );
}
