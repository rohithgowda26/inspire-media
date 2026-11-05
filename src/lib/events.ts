/**
 * Tiny cross-component events so CTAs elsewhere on the page can hand data
 * to the contact form (e.g. "Discuss SEO" pre-selects SEO; the hero
 * quick-capture pre-fills the phone number).
 */
export type PrefillDetail = { service?: string; phone?: string };

const EVENT = "im:prefill-lead";

export function prefillLead(detail: PrefillDetail) {
  window.dispatchEvent(new CustomEvent<PrefillDetail>(EVENT, { detail }));
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function onPrefillLead(handler: (detail: PrefillDetail) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<PrefillDetail>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

/** Pointer handler that feeds --mx / --my to a .spotlight element. */
export function trackSpotlight(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}
