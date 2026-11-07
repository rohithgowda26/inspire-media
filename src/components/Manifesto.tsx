"use client";

import { useEffect, useRef, useState } from "react";
import { manifesto } from "@/lib/site";
import { Hl } from "./ui/Hl";
import { Reveal } from "./ui/Reveal";

const STEP_MS = 2400;
const pairs = manifesto.pairs;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "What we do, simply": one giant kinetic line. An outlined word (what most marketing buys —
 * views, likes, clicks) rolls away, a beam of light crosses the stage and the solid blue word
 * (what we deliver — visits, leads, customers) rolls in. Autoplays every 2.4s while in view.
 */
export function Manifesto() {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [run, setRun] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setRun(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!run || hover) return;
    const t = setInterval(() => {
      setIdx((i) => {
        setPrev(i);
        return (i + 1) % pairs.length;
      });
    }, STEP_MS);
    return () => clearInterval(t);
  }, [run, hover]);

  const go = (i: number) => {
    if (i === idx) return;
    setPrev(idx);
    setIdx(i);
  };

  const pos = (i: number) =>
    i === idx ? "translate-y-0 opacity-100" : i === prev ? "-translate-y-[105%] opacity-0" : "translate-y-[105%] opacity-0";

  return (
    <section
      id="about"
      ref={ref}
      aria-labelledby="manifesto-title"
      className="relative isolate overflow-hidden px-4 py-24 sm:px-6 lg:py-36"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* backdrop: soft glow behind the result word + faint rings */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
        <div className="absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" />
        <div className="absolute right-[5%] top-1/2 size-[560px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.22),transparent)]" />
      </div>

      <div className="mx-auto max-w-[1280px]">
        <Reveal className="flex items-center justify-between gap-4 font-mono text-[11px] font-medium uppercase tracking-[0.28em]">
          <h2 id="manifesto-title" className="flex items-center gap-3 text-electric">
            <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-electric" />
            {manifesto.eyebrow}
          </h2>
          <span className="tabular-nums text-muted" aria-hidden="true">
            <span className="text-white">{pad(idx + 1)}</span> / {pad(pairs.length)}
          </span>
        </Reveal>

        {/* the stage */}
        <div className="mt-12 border-y border-white/10 py-10 sm:py-14 lg:mt-16">
          <p className="sr-only" aria-live="polite">
            We turn {pairs[idx].from} into {pairs[idx].to}.
          </p>
          <div
            aria-hidden="true"
            className="grid items-center gap-4 font-display uppercase leading-none text-[clamp(4rem,8.6vw,8.4rem)] md:grid-cols-[1fr_auto_1fr] md:gap-8"
          >
            {/* FROM — outlined, fading */}
            <div className="relative h-[1.4em] text-center [clip-path:inset(0_-3em)] md:text-right">
              {pairs.map((p, i) => (
                <span
                  key={p.from}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(.7,0,.2,1)] motion-reduce:transition-none ${pos(i)} md:justify-end`}
                  style={{ color: "transparent", WebkitTextStroke: "1.5px rgb(255 255 255 / 0.38)" }}
                >
                  {p.from}
                </span>
              ))}
            </div>

            {/* beam */}
            <div className="relative mx-auto h-14 w-px md:h-px md:w-[clamp(80px,10vw,150px)]">
              <span className="absolute inset-0 bg-gradient-to-b from-white/10 via-electric/60 to-electric md:bg-gradient-to-r" />
              <span
                key={idx}
                className="beam-dot absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_18px_4px_rgb(40_123_255/0.9)] md:left-0 md:top-1/2 md:-translate-y-1/2 md:translate-x-0"
              />
              <svg className="absolute -bottom-1.5 left-1/2 size-3.5 -translate-x-1/2 rotate-90 text-electric md:-right-1.5 md:bottom-auto md:left-auto md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:rotate-0" viewBox="0 0 12 12" fill="none">
                <path d="M3 1.5 7.5 6 3 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* TO — solid electric, glowing; enters a beat later */}
            <div className="relative h-[1.4em] text-center [clip-path:inset(0_-3em)] md:text-left">
              {pairs.map((p, i) => (
                <span
                  key={p.to}
                  className={`absolute inset-0 flex items-center justify-center text-[#4277ff] md:justify-start transition-all duration-700 ease-[cubic-bezier(.7,0,.2,1)] motion-reduce:transition-none ${pos(i)} ${i === idx ? "delay-300" : ""}`}
                  style={{ textShadow: "0 0 32px rgb(40 123 255 / 0.35)" }}
                >
                  {p.to}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* footer row: line + progress + proof */}
        <div className="mt-10 grid items-end gap-8 md:grid-cols-[1.2fr_1fr]">
          <Reveal>
            <p className="max-w-md text-xl font-medium leading-snug tracking-[-0.02em] text-white sm:text-2xl">
              <Hl text={manifesto.line} />
            </p>
          </Reveal>
          <div className="md:justify-self-end">
            <div className="flex gap-1.5" role="tablist" aria-label="Examples">
              {pairs.map((p, i) => (
                <button
                  key={p.to}
                  type="button"
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={`${p.from} to ${p.to}`}
                  onClick={() => go(i)}
                  className="group relative h-6 w-9 sm:w-11"
                >
                  <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-white/15">
                    <span
                      key={i === idx ? `on-${idx}` : "off"}
                      className={`absolute inset-y-0 left-0 rounded-full bg-electric ${
                        i === idx ? (run && !hover ? "seg-fill" : "w-full") : i < idx ? "w-full opacity-40" : "w-0"
                      }`}
                      style={i === idx ? { animationDuration: `${STEP_MS}ms` } : undefined}
                    />
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              {manifesto.proof.map((f, i) => (
                <span key={f} className="flex items-center gap-4">
                  {i > 0 && <span className="hidden text-electric sm:inline">•</span>}
                  {f}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
