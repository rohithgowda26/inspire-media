"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Props = {
  as?: ElementType;
  delay?: number;
  /** "rise" fades/unblurs up; "tilt" swings a card up from a 3D tilt (bento cards). */
  variant?: "rise" | "tilt";
  className?: string;
  id?: string;
  children: ReactNode;
};

/**
 * Animates content in the first time it scrolls on screen.
 * Content is visible by default (server render, no-JS, link previews); it is only
 * hidden once JS confirms the element is still below the fold.
 */
export function Reveal({ as: Tag = "div", delay = 0, variant = "rise", className = "", id, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already in view
    setHidden(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      data-visible={hidden ? "false" : undefined}
      className={`${variant === "tilt" ? "reveal-tilt" : "reveal"} ${className}`}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
