"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { STORAGE, validateLead, type FieldErrors, type LeadField } from "@/lib/contact";
import { leadOptions, site, whatsappUrl } from "@/lib/site";
import { CheckIcon, CloseIcon } from "./ui/icons";

const DELAY_MS = 7_000;
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // after closing, stay hidden for 7 days

const points = [
  "Focused discussion around your advertising challenge",
  "No inflated promises or generic recommendations",
  "Your details are used only to respond to your enquiry",
];

/** Every field in the audit form is required. */
const REQUIRED: { name: LeadField; message: string }[] = [
  { name: "name", message: "Please enter your full name." },
  { name: "brand", message: "Please enter your business name." },
  { name: "city", message: "Please enter your city." },
  { name: "phone", message: "Please enter a phone number so we can call you." },
  { name: "email", message: "Please enter your email address." },
  { name: "industry", message: "Please select your industry." },
  { name: "budget", message: "Please select your monthly budget." },
];

function shouldShow(): boolean {
  try {
    if (localStorage.getItem(STORAGE.leadSubmitted)) return false;
    const dismissed = Number(localStorage.getItem(STORAGE.popupDismissedAt) ?? 0);
    if (dismissed && Date.now() - dismissed < SNOOZE_MS) return false;
    if (sessionStorage.getItem("im_popup_shown")) return false;
  } catch {
    // Storage blocked (private mode etc.) — show once per page load.
  }
  return true;
}

type Status = "idle" | "submitting" | "success" | "error";

/** Light form panel: "Get a Free Ad account Audit". Posts to /api/contact like every other form. */
function AuditForm({ onSuccess }: { onSuccess: () => void }) {
  const uid = useId();
  const startedAt = useRef(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const id = (f: string) => `${uid}-${f}`;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, unknown>;
    const payload = { ...raw, source: "popup", startedAt: startedAt.current };

    const missing: FieldErrors = {};
    for (const r of REQUIRED) if (!String(raw[r.name] ?? "").trim()) missing[r.name] = r.message;
    const check = validateLead(payload);
    const found: FieldErrors = { ...(check.ok ? {} : check.errors), ...missing };
    if (Object.keys(found).length) {
      setErrors(found);
      const first = REQUIRED.find((r) => found[r.name])?.name ?? Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setServerMessage("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors };
      if (res.ok && body.ok) {
        setStatus("success");
        try {
          localStorage.setItem(STORAGE.leadSubmitted, "1");
        } catch {}
        onSuccess();
        return;
      }
      if (body.error === "validation" && body.fields) {
        setErrors(body.fields);
        setStatus("idle");
        return;
      }
      setServerMessage(
        body.error === "rate_limited"
          ? "You’ve sent a few requests already — please wait a few minutes, or reach us directly."
          : "We couldn’t send your request just now.",
      );
      setStatus("error");
    } catch {
      setServerMessage("We couldn’t reach our server. Please check your connection.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="pop-in flex min-h-[380px] flex-col items-center justify-center gap-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_40px_rgb(23_71_255/0.4)]">
          <CheckIcon size={30} />
        </span>
        <h3 className="text-[28px] font-extrabold tracking-[-0.02em] text-[#0a1020]">Request received</h3>
        <p className="max-w-sm text-[15px] leading-relaxed text-[#4a5368]">
          Thanks — our team will review your details and contact you to schedule your strategy discussion.
        </p>
      </div>
    );
  }

  const a11y = (name: LeadField) => ({
    id: id(name),
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": [errors[name] && id(`${name}-error`), name === "city" && id("city-hint")].filter(Boolean).join(" ") || undefined,
  });

  const field = (name: LeadField, label: string, input: ReactNode, hint?: string) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={id(name)} className="text-[13px] font-bold text-[#0a1020]">
        {label}
      </label>
      {input}
      {hint && !errors[name] && (
        <p id={id(`${name}-hint`)} className="text-[11px] text-[#5b6478]">
          {hint}
        </p>
      )}
      {errors[name] && (
        <p id={id(`${name}-error`)} className="text-[12px] font-medium text-[#d93036]">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form noValidate onSubmit={onSubmit} className="relative flex flex-col gap-5" aria-busy={status === "submitting"}>
      {/* Honeypot: hidden from people and assistive tech, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("company")}>Company website</label>
        <input id={id("company")} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
        {field("name", "Full Name", <input {...a11y("name")} type="text" autoComplete="name" placeholder="Your full name" className="field-light" />)}
        {field("brand", "Business Name", <input {...a11y("brand")} type="text" autoComplete="organization" placeholder="Your business name" className="field-light" />)}
        {field(
          "city",
          "City",
          <>
            <input {...a11y("city")} type="text" list={id("cities")} autoComplete="address-level2" placeholder="Start typing your city" className="field-light" />
            <datalist id={id("cities")}>
              {leadOptions.cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </>,
          "Pick a suggestion or type your city.",
        )}
        {field("phone", "Phone Number", <input {...a11y("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" className="field-light" />)}
        {field("email", "Email Address", <input {...a11y("email")} type="email" autoComplete="email" placeholder="you@business.com" className="field-light" />)}
        {field(
          "industry",
          "Industry",
          <select {...a11y("industry")} defaultValue="" className="field-light">
            <option value="">Select industry</option>
            {leadOptions.industries.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>,
        )}
        {field(
          "budget",
          "Monthly Advertising Budget",
          <select {...a11y("budget")} defaultValue="" className="field-light">
            <option value="">Select budget</option>
            {leadOptions.budgets.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>,
        )}
      </div>

      {status === "error" && (
        <div role="alert" className="rounded-lg border border-[#e5484d]/40 bg-[#e5484d]/10 px-4 py-3 text-[13px] leading-relaxed text-[#8f1d22]">
          {serverMessage} Call{" "}
          <a href={`tel:${site.contact.primaryPhone.tel}`} className="font-semibold underline">
            {site.contact.primaryPhone.display}
          </a>{" "}
          or{" "}
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            message us on WhatsApp
          </a>
          .
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg bg-[#0a1020] text-[15px] font-bold text-white transition-colors hover:bg-primary disabled:cursor-wait disabled:opacity-70"
        >
          {status === "submitting" ? "Sending…" : "Get My Free Ad account Audit"}
          {status !== "submitting" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4z" />
            </svg>
          )}
        </button>
        <p className="text-center text-[11.5px] text-[#5b6478]">
          Your information is kept private and used only to respond to your enquiry.{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-primary">
            Privacy policy
          </a>
        </p>
      </div>
    </form>
  );
}

/**
 * "Free Ad account Audit" popup, shown 7 seconds after landing.
 * Desktop: dark pitch panel + light form panel. Phones: scrollable bottom sheet.
 */
export function StrategyPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!shouldShow()) return;
    const t = window.setTimeout(() => {
      // Don't interrupt someone who is already filling in a form
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

  // Scroll lock, initial focus, Escape to close, Tab trapped inside
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const prevOverflow = document.body.style.overflow;
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
        dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([tabindex='-1']), select, textarea"),
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
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden="true" onClick={close} className="absolute inset-0 bg-[#03050a]/80 backdrop-blur-md" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        tabIndex={-1}
        className="pop-in relative grid max-h-[92dvh] w-full max-w-[920px] gap-4 overflow-y-auto rounded-t-[24px] border border-white/[0.08] bg-[#0b0f1a] p-3 outline-none sm:rounded-[16px] sm:p-4 md:grid-cols-[minmax(0,10fr)_minmax(0,14fr)] md:gap-[30px]"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0b0f1a] text-white transition-colors hover:bg-white/10 sm:right-5 sm:top-5"
        >
          <CloseIcon size={15} />
        </button>

        {/* Pitch panel */}
        <div className="flex flex-col gap-4 rounded-[12px] border border-white/[0.08] bg-[#121828] px-5 pb-5 pt-7 sm:px-6 sm:pb-6 sm:pt-7 md:gap-5">
          <span aria-hidden="true" className="mx-auto -mt-4 h-1 w-11 rounded-full bg-white/15 sm:hidden" />
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-electric">Strategy call</p>
          <h2 id="popup-title" className="pr-10 text-[28px] font-extrabold leading-[1.18] tracking-[-0.02em] text-white sm:text-[36px] md:pr-0">
            Ready to Build a Stronger <mark className="hl hl-static">Lead Generation</mark> System?
            <span aria-hidden="true" className="caret" />
          </h2>
          <p className="text-[14px] leading-[1.75] text-mist sm:text-[15px]">
            Tell us about your business, current advertising activity and primary challenge. Our team will review your enquiry and connect with
            you for a focused strategy discussion.
          </p>
          <ul className="hidden flex-col gap-2.5 md:flex">
            {points.map((p) => (
              <li key={p} className="rounded-lg border border-white/[0.1] bg-white/[0.02] px-3.5 py-3 text-[12.5px] font-semibold leading-snug text-white">
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Form panel */}
        <div className="rounded-[12px] bg-[#f3f6fc] px-5 py-6 sm:px-6 sm:py-7 md:self-start">
          <h3 className="mb-5 pr-10 text-[22px] font-extrabold tracking-[-0.02em] text-[#0a1020] sm:text-[24px] md:pr-0">Get a Free Ad account Audit</h3>
          <AuditForm onSuccess={() => setSubmitted(true)} />
        </div>
      </div>
    </div>
  );
}
