"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { startCloth, type Cloth } from "@/lib/curtain-cloth";
import { startSkyShots } from "@/lib/sky-shots";

/**
 * Deepavali opening (home page only):
 *  1. Red velvet stage curtains (a real cloth simulation) hang closed under a gold-fringed valance.
 *  2. They draw open — the cloth gathers, swings and settles — revealing a night sky in the
 *     website's own navy & electric-blue style with the Deepavali wish.
 *  3. Sky shots (aerial fireworks) burst over it; then the stage fades into the website.
 *
 * Shown once per browser session, and only until SHOW_UNTIL — after that it never renders.
 */
const SHOW_UNTIL = "2026-11-16T23:59:59+05:30";
const SEEN_KEY = "im_deepavali_2026_seen";
const AUTO_OPEN_MS = 0; // curtains open this long after they appear
const OPEN_MS = 3400; // time the rings take to slide to the sides
const SHOW_MS = 9500; // fireworks show length
const STAGE_MS = 11000; // from opening until the website appears (unless "Enter" is tapped)

type Phase = "closed" | "open" | "leaving" | "done";

// Runs before the overlay paints: hides it for returning visitors or after the festival (no flash).
const PRE_PAINT = `try{if(Date.now()>Date.parse("${SHOW_UNTIL}")||sessionStorage.getItem("${SEEN_KEY}")){var s=document.createElement("style");s.textContent="#deepavali-intro{display:none!important}";document.head.appendChild(s);window.__imDeepavaliSkip=1}else{window.__imIntroActive=true}}catch(e){}`;

export function DiwaliIntro() {
  const [phase, setPhase] = useState<Phase>("closed");
  const [reduced, setReduced] = useState(false);
  const [clothReady, setClothReady] = useState(false);
  const [clothFailed, setClothFailed] = useState(false);
  const clothCanvas = useRef<HTMLCanvasElement>(null);
  const sparkCanvas = useRef<HTMLCanvasElement>(null);
  const airCanvas = useRef<HTMLCanvasElement>(null);
  const cloth = useRef<Cloth | null>(null);
  const enterRef = useRef<HTMLButtonElement>(null);

  // stars for the night sky (fixed pattern, so server and client match)
  const stars = useMemo(() => {
    let seed = 7;
    const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: 110 }, () => ({
      x: r() * 100,
      y: r() * 70,
      s: r() < 0.12 ? 2 : 1,
      o: 0.25 + r() * 0.6,
      tw: r() < 0.3,
      d: r() * 4,
    }));
  }, []);

  useEffect(() => {
    const w = window as unknown as {
      __imDeepavaliSkip?: number;
      __imIntroActive?: boolean;
    };
    if (w.__imDeepavaliSkip || Date.now() > Date.parse(SHOW_UNTIL)) {
      setPhase("done");
      return;
    }
    w.__imIntroActive = true;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    document.documentElement.style.overflow = "hidden";
    if (rm) setPhase("open");
    else if (clothCanvas.current) {
      cloth.current = startCloth(clothCanvas.current, () =>
        setClothReady(true),
      );
      if (!cloth.current) setClothFailed(true); // no WebGL: simple CSS curtains instead
    }
    return () => {
      document.documentElement.style.overflow = "";
      cloth.current?.stop();
    };
  }, []);

  const openCurtains = useCallback(
    () => setPhase((p) => (p === "closed" ? "open" : p)),
    [],
  );
  const enterSite = useCallback(
    () => setPhase((p) => (p === "open" ? "leaving" : p)),
    [],
  );

  // open shortly after the curtains appear (or after 2.5s if they're slow to load)
  useEffect(() => {
    if (phase !== "closed") return;
    const t = setTimeout(
      openCurtains,
      clothReady || clothFailed ? AUTO_OPEN_MS : 2500,
    );
    return () => clearTimeout(t);
  }, [phase, openCurtains, clothReady, clothFailed]);

  // open: slide the rings, start the sky shots, auto-enter later
  useEffect(() => {
    if (phase !== "open") return;
    cloth.current?.open(OPEN_MS);
    let stopShow: (() => void) | undefined;
    const timers = [
      setTimeout(enterSite, reduced ? 4500 : STAGE_MS),
      setTimeout(() => enterRef.current?.focus({ preventScroll: true }), 3600),
    ];
    if (!reduced)
      timers.push(
        setTimeout(() => {
          if (sparkCanvas.current && airCanvas.current)
            stopShow = startSkyShots(sparkCanvas.current, airCanvas.current, {
              durationMs: SHOW_MS,
            });
        }, 1100),
      );
    return () => {
      timers.forEach(clearTimeout);
      stopShow?.();
    };
  }, [phase, reduced, enterSite]);

  useEffect(() => {
    if (phase !== "leaving") return;
    document.documentElement.style.overflow = "";
    const t = setTimeout(() => setPhase("done"), 900);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhase((p) => (p === "done" ? p : "leaving"));
      else if (e.key === "Enter" && phase === "closed") openCurtains();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, openCurtains]);

  // let the rest of the page (e.g. the audit popup) know the intro has finished
  useEffect(() => {
    const w = window as unknown as { __imIntroActive?: boolean };
    if (phase === "done") {
      cloth.current?.stop();
      if (w.__imIntroActive) {
        w.__imIntroActive = false;
        window.dispatchEvent(new Event("im:intro-done"));
      }
    }
  }, [phase]);

  if (phase === "done") return null;
  const isOpen = phase !== "closed";

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
      <div
        id="deepavali-intro"
        role="dialog"
        aria-modal="true"
        aria-label="Happy Deepavali from Inspire Media"
        className={`dv-stage fixed inset-0 z-[310] overflow-hidden bg-ink ${isOpen ? "is-open" : ""} ${phase === "leaving" ? "is-leaving" : ""} ${clothReady ? "cloth-ready" : ""} ${clothFailed ? "cloth-failed" : ""} ${reduced ? "dv-reduced" : ""}`}
        onClick={phase === "closed" ? openCurtains : undefined}
      >
        {/* night sky in the website's palette */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#0d1630_0%,#060a16_45%,#020306_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[45%] bg-[radial-gradient(60%_100%_at_50%_100%,rgb(23_71_255/0.28),transparent_70%)]"
        />
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
          {stars.map((s, i) => (
            <circle
              key={i}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.s * 0.6}
              fill="#dfe8ff"
              opacity={s.o}
              className={s.tw ? "dv-twinkle" : undefined}
              style={s.tw ? { animationDelay: `${s.d}s` } : undefined}
            />
          ))}
        </svg>
        <canvas
          ref={airCanvas}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />
        <canvas
          ref={sparkCanvas}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        {/* the wish */}
        <div className="relative z-[2] flex h-full flex-col items-center justify-center px-12 pt-[9vh] text-center sm:px-6">
          <img
            src="/brand/inspire-media-logo-white.svg"
            alt="Inspire Media"
            width={359}
            height={226}
            className="dv-w h-9 w-auto opacity-90 sm:h-10"
            style={{ ["--d" as string]: "0.9s" }}
          />

          <div
            aria-hidden="true"
            className="dv-w relative mt-7 h-[64px] w-[84px]"
            style={{ ["--d" as string]: "1.1s" }}
          >
            <div className="dv-halo absolute left-1/2 top-0 size-24 -translate-x-1/2 -translate-y-8 rounded-full bg-[radial-gradient(closest-side,rgb(255_196_92/0.5),transparent)]" />
            <svg
              viewBox="0 0 120 92"
              className="absolute inset-0 h-full w-full"
            >
              <defs>
                <linearGradient id="dv-gold" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#ffe3a3" />
                  <stop offset="1" stopColor="#c8892c" />
                </linearGradient>
                <radialGradient id="dv-flame" cx="0.5" cy="0.75" r="0.6">
                  <stop offset="0" stopColor="#fff8e1" />
                  <stop offset="0.45" stopColor="#ffd25e" />
                  <stop offset="1" stopColor="#ff7a1a" stopOpacity="0.9" />
                </radialGradient>
              </defs>
              <g className="dv-flame" style={{ transformOrigin: "60px 50px" }}>
                <path
                  d="M60 8 C 70 24, 72 36, 60 50 C 48 36, 50 24, 60 8 Z"
                  fill="url(#dv-flame)"
                />
              </g>
              <path
                d="M14 56 Q 60 54 106 56 Q 98 86 60 88 Q 22 86 14 56 Z"
                fill="url(#dv-gold)"
              />
            </svg>
          </div>

          <p
            className="dv-w mt-5 flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.28em] text-electric"
            style={{ ["--d" as string]: "1.3s" }}
          >
            <span
              aria-hidden="true"
              className="hidden h-px w-8 bg-gradient-to-r from-transparent to-electric sm:block"
            />
            Inspire Media wishes you
            <span
              aria-hidden="true"
              className="hidden h-px w-8 bg-gradient-to-l from-transparent to-electric sm:block"
            />
          </p>

          <h1 className="mt-4 font-sans text-[clamp(3rem,10.5vw,8.6rem)] font-bold leading-[0.95] tracking-[-0.045em] text-white">
            <span
              className="dv-w inline-block"
              style={{ ["--d" as string]: "1.5s" }}
            >
              Happy
            </span>{" "}
            <span
              className="dv-w inline-block"
              style={{ ["--d" as string]: "1.7s" }}
            >
              <span className="dv-blue">Deepavali</span>
            </span>
          </h1>

          <p
            className="dv-w mt-6 max-w-lg text-[15px] leading-relaxed text-mist sm:text-lg"
            style={{ ["--d" as string]: "2.1s" }}
          >
            May the festival of lights bring joy to your home and new growth to
            your brand.
          </p>

          <button
            ref={enterRef}
            type="button"
            onClick={enterSite}
            tabIndex={isOpen ? 0 : -1}
            className="dv-w group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-ink shadow-[0_10px_40px_-10px_rgb(40_123_255/0.6)] outline-none transition hover:bg-ice focus-visible:ring-2 focus-visible:ring-electric"
            style={{ ["--d" as string]: "2.6s" }}
          >
            Enter website
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </button>
        </div>

        {/* simulated velvet curtains (WebGL); simple CSS curtains only if WebGL isn't available */}
        <canvas
          ref={clothCanvas}
          aria-hidden="true"
          className="dv-cloth pointer-events-none absolute inset-0 z-[3] h-full w-full"
        />
        <div aria-hidden="true" className="dv-curtain dv-css dv-curtain-l" />
        <div aria-hidden="true" className="dv-curtain dv-css dv-curtain-r" />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPhase("leaving");
          }}
          className="absolute bottom-5 right-5 z-[5] rounded-full border border-white/15 bg-black/30 px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.3em] text-white/70 backdrop-blur transition hover:text-white sm:bottom-7 sm:right-8"
        >
          Skip
        </button>
      </div>
    </>
  );
}
