"use client";

import { useEffect, useRef, useState } from "react";

const ARC = 0.72; // how much of the half-ring is filled at the end
const TARGET = 90; // number shown at the end
const DURATION = 1800; // ms

/** Phone gauge: the arc fills and the number counts 0 → 90 each time it comes into view. */
export function GrowthGauge() {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(1); // 0 → 1 progress (1 = finished; also the no-JS / reduced-motion state)

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setT(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(raf);
        if (!entry.isIntersecting) {
          setT(0); // reset so it plays again next time
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / DURATION);
          setT(1 - Math.pow(1 - p, 3)); // ease-out
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="relative mx-auto w-[170px]">
      <svg viewBox="0 0 200 112" className="w-full">
        <defs>
          <linearGradient id="growth-gauge-fill" x1="0" x2="1">
            <stop offset="0" stopColor="#1747ff" />
            <stop offset="1" stopColor="#cfe0ff" />
          </linearGradient>
        </defs>
        <path d="M18 100 A82 82 0 0 1 182 100" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="20" />
        <path
          d="M18 100 A82 82 0 0 1 182 100"
          fill="none"
          stroke="url(#growth-gauge-fill)"
          strokeWidth="20"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - ARC * t * 100}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="text-[26px] font-bold leading-none tabular-nums">{Math.round(TARGET * t)}</span>
        <span className="text-[9px] text-mist">days to see results</span>
      </div>
    </div>
  );
}
