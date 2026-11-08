"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { onPrefillLead } from "@/lib/events";
import { STORAGE, enquiryWhatsAppUrl, newSubmissionId, validateLead, type FieldErrors, type LeadField, type LeadSource } from "@/lib/contact";
import { leadOptions, site } from "@/lib/site";
import { ArrowRightIcon, CheckIcon } from "./ui/icons";

type Props = {
  source: LeadSource;
  /** "full" = contact section (all fields); "compact" = popup (essentials only on phones). */
  variant?: "full" | "compact";
  onSuccess?: () => void;
};

type Status = "idle" | "submitting" | "success" | "error";
type Delivery = { email?: string; confirmation?: string };

export function LeadForm({ source, variant = "full", onSuccess }: Props) {
  const uid = useId();
  const startedAt = useRef<number>(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverMessage, setServerMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const submissionId = useRef("");
  const sending = useRef(false);
  const [delivery, setDelivery] = useState<Delivery>({});
  const [sent, setSent] = useState<Record<string, unknown>>({});

  useEffect(() => {
    startedAt.current = Date.now();
    submissionId.current = newSubmissionId();
  }, []);

  // The contact-section form accepts hand-offs from CTAs elsewhere on the page
  // ("Discuss SEO" pre-selects the service; the hero box pre-fills the phone).
  useEffect(() => {
    if (variant !== "full") return;
    return onPrefillLead(({ service, phone }) => {
      const form = formRef.current;
      if (!form) return;
      if (service) {
        const select = form.elements.namedItem("service") as HTMLSelectElement | null;
        if (select) select.value = service;
      }
      if (phone) {
        const input = form.elements.namedItem("phone") as HTMLInputElement | null;
        if (input) input.value = phone;
      }
      // Let the smooth scroll settle, then put the cursor in the first empty required field.
      window.setTimeout(() => {
        const name = form.elements.namedItem("name") as HTMLInputElement | null;
        name?.focus({ preventScroll: true });
      }, 650);
    });
  }, [variant]);

  const id = (f: string) => `${uid}-${f}`;
  const compact = variant === "compact";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending.current) return; // ignore double-clicks while a request is in flight
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, unknown>;
    const payload = { ...raw, source, startedAt: startedAt.current, submissionId: submissionId.current };
    setSent(payload);

    const check = validateLead(payload);
    if (!check.ok) {
      setErrors(check.errors);
      form.querySelector<HTMLElement>(`[name="${Object.keys(check.errors)[0]}"]`)?.focus();
      return;
    }

    setErrors({});
    setServerMessage("");
    setStatus("submitting");
    sending.current = true;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors; delivery?: Delivery };
      if (res.ok && body.ok) {
        setDelivery(body.delivery ?? {});
        setStatus("success");
        try {
          localStorage.setItem(STORAGE.leadSubmitted, "1");
        } catch {}
        onSuccess?.();
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
    } finally {
      sending.current = false;
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="pop-in flex min-h-[340px] flex-col items-center justify-center gap-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary shadow-[0_10px_40px_rgb(23_71_255/0.5)]">
          <CheckIcon size={30} />
        </span>
        <h3 className="text-silver text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          You’re in.
          <span className="block">We’ll call you.</span>
        </h3>
        <p className="max-w-sm text-base leading-relaxed text-mist">
          Thanks — we’ve got your details. Our team will be in touch shortly to schedule your strategy call.
          {delivery.confirmation === "sent" && typeof sent.email === "string" && (
            <span className="mt-2 block text-[14px] text-muted">A confirmation is on its way to {sent.email}.</span>
          )}
        </p>
      </div>
    );
  }

  const a11y = (name: LeadField) => ({
    id: id(name),
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? id(`${name}-error`) : undefined,
  });

  const field = (name: LeadField, label: string, input: ReactNode, opts: { optional?: boolean; hideOnCompactMobile?: boolean; span2?: boolean } = {}) => (
    <div className={`flex-col gap-2 ${opts.span2 ? "sm:col-span-2" : ""} ${compact && opts.hideOnCompactMobile ? "hidden sm:flex" : "flex"}`}>
      <label htmlFor={id(name)} className="field-label">
        {label}
        {opts.optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {input}
      {errors[name] && (
        <p id={id(`${name}-error`)} className="pt-1 text-[13px] text-[#ff8a8a]">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="relative flex flex-col gap-6" aria-busy={status === "submitting"}>
      {/* Honeypot: hidden from people and assistive tech, tempting to bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("company")}>Company website</label>
        <input id={id("company")} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Your name", <input {...a11y("name")} type="text" autoComplete="name" placeholder="Who are we talking to?" className="field" />)}
        {field("brand", "Brand / business", <input {...a11y("brand")} type="text" autoComplete="organization" placeholder="Café, store, D2C brand…" className="field" />, { optional: true })}
        {field("phone", "Phone", <input {...a11y("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" className="field" />)}
        {field("email", "Email", <input {...a11y("email")} type="email" autoComplete="email" placeholder="you@brand.com" className="field" />)}
        {field("city", "City", <input {...a11y("city")} type="text" autoComplete="address-level2" placeholder="Hubli, Bengaluru, anywhere" className="field" />, { optional: true, hideOnCompactMobile: true })}
        {field(
          "service",
          "What you need",
          <select {...a11y("service")} defaultValue="" className="field">
            <option value="">Select a service</option>
            {leadOptions.services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>,
          { optional: true },
        )}
        {field(
          "budget",
          "Monthly marketing budget",
          <select {...a11y("budget")} defaultValue="" className="field">
            <option value="">Select a range</option>
            {leadOptions.budgets.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>,
          { optional: true, hideOnCompactMobile: true, span2: compact },
        )}
        {!compact &&
          field(
            "message",
            "Tell us about your brand",
            <textarea {...a11y("message")} rows={3} placeholder="Goals, current marketing, anything we should know…" className="field" />,
            { optional: true, span2: true },
          )}
      </div>

      {status === "error" && (
        <div role="alert" className="rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-sm leading-relaxed text-[#ffc2c2]">
          {serverMessage} Call{" "}
          <a href={`tel:${site.contact.primaryPhone.tel}`} className="font-semibold text-white underline">
            {site.contact.primaryPhone.display}
          </a>{" "}
          or{" "}
          <a href={enquiryWhatsAppUrl(sent)} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline">
            send your enquiry on WhatsApp
          </a>
          .
        </div>
      )}

      <div className="flex flex-col gap-4">
        <button type="submit" disabled={status === "submitting"} className="btn btn-white !h-12 w-full cursor-pointer !text-[15px] disabled:cursor-wait disabled:opacity-70">
          {status === "submitting" ? "Sending…" : "Book my strategy call"}
          {status !== "submitting" && <ArrowRightIcon size={15} />}
        </button>
        <p className="text-center text-[12px] leading-relaxed text-muted">
          Your details are used only to respond to your enquiry.{" "}
          <a href="/privacy" className="text-electric underline-offset-2 hover:underline">
            Privacy policy
          </a>
        </p>
      </div>
    </form>
  );
}
