"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { STORAGE, validateLead, type FieldErrors } from "@/lib/contact";
import { whatsappUrl } from "@/lib/site";
import { ArrowRightIcon, CheckIcon, CloseIcon } from "./ui/icons";

const DELAY_MS = 7_000;
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // after closing, stay hidden for 7 days

/** Questions that type themselves at the top of the popup. */
const HOOKS = [
  "Spending on ads but no enquiries?",
  "Getting likes, not leads?",
  "Not sure what’s actually working?",
  "Ready to grow faster?",
];

/** "What do you need?" chips → the service value the contact API accepts. */
const NEEDS = [
  { label: "Ads", value: "Paid Ads" },
  { label: "Content & reels", value: "Creative Content" },
  { label: "Website", value: "Website Development" },
  { label: "SEO", value: "SEO" },
  { label: "Not sure yet", value: "Full-funnel growth" },
];

/** What the free audit covers (left side of the popup). */
const AUDIT = [
  "Where your ad budget is being wasted",
  "Which creatives and audiences actually convert",
  "Quick wins you can apply this week",
  "A clear growth plan for your brand",
];

/** Proof points from the Inspire Media brochure. */
const STATS = [
  { value: "3x", label: "average ROAS growth" },
  { value: "30+", label: "brands scaled" },
];

const WA_MESSAGE =
  "Hi Inspire Media! I saw your website and I'd like a free ad account audit.";

function shouldShow(): boolean {
  try {
    if (localStorage.getItem(STORAGE.leadSubmitted)) return false;
    const dismissed = Number(
      localStorage.getItem(STORAGE.popupDismissedAt) ?? 0,
    );
    if (dismissed && Date.now() - dismissed < SNOOZE_MS) return false;
    if (sessionStorage.getItem("im_popup_shown")) return false;
  } catch {
    // Storage blocked (private mode etc.) — show once per page load.
  }
  return true;
}

/** Types each hook out, pauses, deletes it, moves to the next. */
function useTypedHook() {
  const [text, setText] = useState(HOOKS[0]);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0;
    let i = HOOKS[0].length;
    let del = false;
    let t = 0;
    const tick = () => {
      if (!del && i === HOOKS[w].length) {
        del = true;
        t = window.setTimeout(tick, 1600);
        return;
      }
      if (del && i === 0) {
        del = false;
        w = (w + 1) % HOOKS.length;
      }
      i += del ? -1 : 1;
      setText(HOOKS[w].slice(0, i));
      t = window.setTimeout(tick, del ? 28 : 55);
    };
    t = window.setTimeout(tick, 1600);
    return () => window.clearTimeout(t);
  }, []);
  return text;
}

/** Slide-to-open WhatsApp control. Drag the handle to the end (or click / press Enter on it). */
function SwipeToChat() {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [done, setDone] = useState(false);
  const drag = useRef<{ start: number; max: number } | null>(null);
  const HANDLE = 52;

  const open = () => {
    setDone(true);
    window.open(whatsappUrl(WA_MESSAGE), "_blank", "noopener,noreferrer");
    window.setTimeout(() => {
      setDone(false);
      setX(0);
    }, 1200);
  };

  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const max = (track.current?.clientWidth ?? 300) - HANDLE - 8;
    drag.current = { start: e.clientX - x, max };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    setX(
      Math.max(0, Math.min(drag.current.max, e.clientX - drag.current.start)),
    );
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (x > d.max * 0.82) {
      setX(d.max);
      open();
    } else if (x < 6) {
      open(); // a simple click/tap also works
    } else setX(0);
  };

  const max = (track.current?.clientWidth ?? 300) - HANDLE - 8;
  const progress = max > 0 ? x / max : 0;

  return (
    <div
      ref={track}
      className="relative h-[60px] select-none overflow-hidden rounded-full border border-[#25d366]/30 bg-[#0c1a12] p-1"
    >
      {/* filled trail */}
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 rounded-full bg-[#25d366]/25"
        style={{ width: x + HANDLE }}
      />
      {/* shimmering label */}
      <span
        aria-hidden="true"
        className="swipe-shimmer pointer-events-none absolute inset-0 flex items-center justify-center pl-12 text-[14px] font-semibold tracking-[-0.01em]"
        style={{ opacity: 1 - progress * 1.4 }}
      >
        {done ? "Opening WhatsApp…" : "Swipe to chat on WhatsApp"}
      </span>
      <button
        type="button"
        aria-label="Chat with us on WhatsApp"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => {
          drag.current = null;
          setX(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        className="relative z-10 flex h-[52px] w-[52px] cursor-grab touch-none items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_6px_20px_rgb(37_211_102/0.45)] active:cursor-grabbing"
        style={{
          transform: `translateX(${x}px)`,
          transition: drag.current
            ? "none"
            : "transform 0.4s cubic-bezier(.16,1,.3,1)",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" />
        </svg>
      </button>
    </div>
  );
}

type Status = "idle" | "submitting" | "success" | "error";

/** The 3-field form: name, phone, what you need. */
function QuickForm({ onSuccess }: { onSuccess: () => void }) {
  const uid = useId();
  const startedAt = useRef(0);
  const [need, setNeed] = useState(NEEDS[0].value);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      unknown
    >;
    const payload = {
      ...raw,
      service: need,
      source: "popup",
      startedAt: startedAt.current,
    };
    const check = validateLead(payload);
    const found: FieldErrors = check.ok ? {} : { ...check.errors };
    if (!String(raw.email ?? "").trim())
      found.email = "Please enter your email address.";
    if (Object.keys(found).length) {
      setErrors(found);
      const first = (["name", "brand", "phone", "email"] as const).find(
        (f) => found[f],
      );
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (res.ok && body.ok) {
        setStatus("success");
        try {
          localStorage.setItem(STORAGE.leadSubmitted, "1");
        } catch {}
        onSuccess();
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="pop-in flex flex-col items-center gap-4 py-10 text-center"
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_40px_rgb(23_71_255/0.6)]">
          <CheckIcon size={30} />
        </span>
        <p className="text-[24px] font-semibold tracking-[-0.02em] text-white">
          You’re on our list.
        </p>
        <p className="max-w-xs text-[14px] leading-relaxed text-mist">
          We’ll call you shortly to set up your free audit, and send the details
          to your email. Want to talk sooner? Swipe below.
        </p>
      </div>
    );
  }

  const input =
    "h-[52px] w-full rounded-2xl border bg-white/[0.04] px-4 text-[15px] text-white outline-none transition placeholder:text-[#66718a] focus:border-electric focus:bg-primary/[0.06] focus:shadow-[0_0_0_4px_rgb(40_123_255/0.15)]";

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-3.5"
      aria-busy={status === "submitting"}
    >
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor={`${uid}-company`}>Company website</label>
        <input
          id={`${uid}-company`}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <label htmlFor={`${uid}-name`} className="sr-only">
        Your name
      </label>
      <input
        id={`${uid}-name`}
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Your name"
        aria-invalid={errors.name ? true : undefined}
        className={`${input} ${errors.name ? "border-[#ff6b6b]" : "border-white/10"}`}
      />
      <label htmlFor={`${uid}-brand`} className="sr-only">
        Business name
      </label>
      <input
        id={`${uid}-brand`}
        name="brand"
        type="text"
        autoComplete="organization"
        placeholder="Business name (optional)"
        aria-invalid={errors.brand ? true : undefined}
        className={`${input} ${errors.brand ? "border-[#ff6b6b]" : "border-white/10"}`}
      />
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-phone`} className="sr-only">
            Phone number
          </label>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Phone / WhatsApp"
            aria-invalid={errors.phone ? true : undefined}
            className={`${input} ${errors.phone ? "border-[#ff6b6b]" : "border-white/10"}`}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="sr-only">
            Email address
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Email address"
            aria-invalid={errors.email ? true : undefined}
            className={`${input} ${errors.email ? "border-[#ff6b6b]" : "border-white/10"}`}
          />
        </div>
      </div>
      {(errors.name || errors.brand || errors.phone || errors.email) && (
        <p className="text-[12.5px] text-[#ff8a8a]">
          {errors.name || errors.brand || errors.phone || errors.email}
        </p>
      )}

      <fieldset className="mt-1">
        <legend className="mb-2.5 text-[12.5px] font-medium text-mist">
          I need help with
        </legend>
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((n) => (
            <button
              key={n.value + n.label}
              type="button"
              aria-pressed={need === n.value}
              onClick={() => setNeed(n.value)}
              className={`cursor-pointer rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all duration-300 ${
                need === n.value
                  ? "border-electric bg-primary text-white shadow-[0_0_20px_rgb(23_71_255/0.45)]"
                  : "border-white/12 bg-white/[0.03] text-ice hover:border-white/30"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </fieldset>

      {status === "error" && (
        <p role="alert" className="text-[13px] text-[#ffc2c2]">
          Couldn’t send just now — swipe below to reach us on WhatsApp instead.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group mt-2 flex h-[54px] cursor-pointer items-center justify-center gap-2 rounded-full bg-white text-[15px] font-bold text-[#050812] transition hover:bg-ice disabled:cursor-wait disabled:opacity-70"
      >
        {status === "submitting" ? "Sending…" : "Get my free audit"}
        {status !== "submitting" && (
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRightIcon size={16} />
          </span>
        )}
      </button>
      <p className="text-center text-[11.5px] text-muted">
        No spam. Your details are used only to reply to your enquiry.{" "}
        <a
          href="/privacy"
          className="underline underline-offset-2 hover:text-white"
        >
          Privacy
        </a>
      </p>
    </form>
  );
}

/**
 * Popup shown 7 seconds after landing: a typed hook, a bold promise, a 3-field form
 * and a swipe-to-chat WhatsApp slider. Bottom sheet on phones.
 */
export function StrategyPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const hook = useTypedHook();

  useEffect(() => {
    if (!shouldShow()) return;
    const t = window.setTimeout(() => {
      const active = document.activeElement;
      if (active && active.closest("form")) return;
      if (!shouldShow()) return;
      lastFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
      try {
        sessionStorage.setItem("im_popup_shown", "1");
      } catch {}
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (!submitted) {
      try {
        localStorage.setItem(STORAGE.popupDismissedAt, String(Date.now()));
      } catch {}
    }
    lastFocus.current?.focus?.();
  }, [submitted]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([tabindex='-1'])",
        ),
      ).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 bg-[#03050a]/80 backdrop-blur-md"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        tabIndex={-1}
        className="pop-in relative grid max-h-[92dvh] w-full max-w-[880px] overflow-y-auto rounded-t-[28px] border border-white/[0.08] bg-[#070b14] outline-none sm:rounded-[28px] md:grid-cols-2"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/[0.07] text-white transition hover:bg-white/15"
        >
          <CloseIcon size={15} />
        </button>

        {/* Pitch */}
        <div className="relative overflow-hidden px-6 pb-4 pt-8 sm:px-9 sm:pb-9 sm:pt-11">
          <div
            aria-hidden="true"
            className="popup-orb absolute -left-24 -top-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(23_71_255/0.55),transparent)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:linear-gradient(to_bottom,#000,transparent)]"
          />
          <span
            aria-hidden="true"
            className="mx-auto mb-5 block h-1 w-11 rounded-full bg-white/15 sm:hidden"
          />

          <div className="relative flex flex-col gap-5">
            <p
              className="min-h-[1.5em] pr-12 font-mono text-[12px] text-ice/80"
              aria-hidden="true"
            >
              <span className="text-electric">›</span> {hook}
              <span className="caret" />
            </p>
            <h2
              id="popup-title"
              className="text-[34px] font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-[44px]"
            >
              Let’s turn your ads into <span className="hl">enquiries.</span>
            </h2>
            <p className="text-[15px] leading-relaxed text-mist">
              Get a{" "}
              <strong className="font-semibold text-white">
                free ad account audit
              </strong>
              . We’ll show you what’s working, what’s wasting money and what to
              try next — in a 20-minute call.
            </p>
            <div className="hidden md:block">
              <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-electric">
                What your audit covers
              </p>
              <ul className="flex flex-col gap-2.5 text-[13.5px] text-ice">
                {AUDIT.map((t, i) => (
                  <li
                    key={t}
                    className="sv-slide flex items-start gap-2.5"
                    style={{ "--d": `${300 + i * 140}ms` } as CSSProperties}
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/25 text-electric">
                      <CheckIcon size={11} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-3">
              {STATS.map((st) => (
                <div
                  key={st.label}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
                >
                  <p className="text-[24px] font-semibold leading-none tracking-[-0.03em] text-white">
                    {st.value}
                  </p>
                  <p className="mt-1.5 text-[11.5px] text-mist">{st.label}</p>
                </div>
              ))}
            </div>
            <p className="hidden text-[12.5px] text-muted md:block">
              Takes 30 seconds to request · Honest advice, no hard selling.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col gap-5 border-t border-white/[0.06] bg-white/[0.02] px-6 pb-8 pt-6 sm:px-9 sm:py-11 md:border-l md:border-t-0">
          <QuickForm onSuccess={() => setSubmitted(true)} />
          <div
            className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted"
            aria-hidden="true"
          >
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <SwipeToChat />
        </div>
      </div>
    </div>
  );
}
