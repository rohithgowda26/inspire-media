"use client";

import { useState } from "react";

/**
 * Inset UI widgets for the bento cards (reference: product tables and charts).
 * They illustrate how each service works and carry no invented figures.
 */

const formats = [
  { name: "Ad creatives", goal: "Drive sales" },
  { name: "Landing pages", goal: "Convert" },
  { name: "Social content", goal: "Connect" },
  { name: "Brand storytelling", goal: "Build brand" },
];

export function ContentTable() {
  const [hover, setHover] = useState(0);
  return (
    <div className="widget w-full p-4 text-left sm:p-5">
      <p className="text-[15px] font-semibold">Content formats</p>
      <div className="mt-4 grid grid-cols-[40px_minmax(0,1fr)_96px] px-3 text-[12px] text-muted">
        <span>#</span>
        <span>Format</span>
        <span>Purpose</span>
      </div>
      <ul className="mt-2 flex flex-col">
        {formats.map((f, i) => (
          <li
            key={f.name}
            onMouseEnter={() => setHover(i)}
            className={`grid grid-cols-[40px_minmax(0,1fr)_96px] items-center rounded-lg px-3 py-2.5 text-[13px] transition-colors duration-300 ${
              hover === i ? "bg-white/[0.07] text-white" : "text-mist"
            }`}
          >
            <span className="font-semibold">0{i + 1}</span>
            <span className="truncate">{f.name}</span>
            <span className="flex items-center gap-2">
              <span className={`h-1 flex-1 rounded-full ${hover === i ? "bg-electric" : "bg-white/10"} transition-colors`} />
              <span className="text-[11px]">{f.goal}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Decorative grouped bars: creative and audience tests (no axis, no values). */
export function TestBars() {
  const pairs = [
    [0.55, 0.8],
    [0.72, 0.95],
    [0.5, 0.62],
    [0.35, 0.45],
    [0.48, 0.58],
    [0.6, 0.78],
  ];
  return (
    <div className="widget w-full p-4 text-left sm:p-5">
      <p className="text-[15px] font-semibold">Always testing</p>
      <div className="mt-4 flex h-32 items-end justify-between gap-3 px-1">
        {pairs.map(([a, b], i) => (
          <div key={i} className="relative flex h-full flex-1 items-end justify-center">
            <span className="absolute bottom-0 h-full w-3 rounded-t-md bg-white/[0.06]" style={{ height: `${b * 100}%` }} />
            <span className="grow-bar relative w-3 rounded-t-md bg-gradient-to-t from-primary to-electric" style={{ height: `${a * 100}%`, "--i": i } as React.CSSProperties} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-6 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-electric" /> Creatives
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-white/25" /> Audiences
        </span>
      </div>
    </div>
  );
}

/** Gauge widget for the 3x ROAS card. */
export function RoasGauge() {
  return (
    <div className="widget w-full max-w-[260px] p-4 text-left sm:p-5">
      <p className="text-[15px] font-semibold">Returns</p>
      <p className="text-[11px] text-muted">Average ROAS growth</p>
      <div className="relative mt-3">
        <svg viewBox="0 0 200 112" className="w-full">
          <defs>
            <linearGradient id="roas-fill" x1="0" x2="1">
              <stop offset="0" stopColor="#1747ff" />
              <stop offset="1" stopColor="#cfe0ff" />
            </linearGradient>
          </defs>
          <path d="M18 100 A82 82 0 0 1 182 100" fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="22" />
          <path
            className="fill-gauge"
            d="M18 100 A82 82 0 0 1 182 100"
            fill="none"
            stroke="url(#roas-fill)"
            strokeWidth="22"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset="25"
          />
        </svg>
        <span className="absolute inset-x-0 bottom-0 text-center text-[28px] font-bold">3x</span>
      </div>
    </div>
  );
}

/** Rising organic-visibility curve (illustrative: no axis values). */
export function VisibilityChart() {
  const d =
    "M0 88 L6 86 L11 89 L16 80 L20 84 L25 70 L29 76 L34 66 L38 72 L43 58 L47 63 L52 50 L57 56 L61 44 L66 49 L71 38 L75 42 L80 30 L85 35 L89 24 L94 28 L100 16";
  return (
    <div className="widget w-full p-4 text-left sm:p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-[15px] font-semibold">Organic visibility</p>
        <p className="text-[11px] text-muted">Compounds over time</p>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 h-40 w-full overflow-visible">
        <defs>
          <linearGradient id="vis-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#287bff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#287bff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgb(255 255 255 / 0.06)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={`${d} L100 100 L0 100 Z`} fill="url(#vis-area)" />
        <path className="draw-line" d={d} fill="none" stroke="#5d8fff" strokeWidth="2" vectorEffect="non-scaling-stroke" pathLength={100} />
      </svg>
    </div>
  );
}
