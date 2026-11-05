"use client";

import { useId, useState, type FormEvent } from "react";
import { prefillLead } from "@/lib/events";

/**
 * Hero pill: phone number + "Book a strategy call" (reference: email + "Start Free Trial").
 * Validates the number, hands it to the contact form and scrolls there. Nothing is sent from here.
 */
export function QuickCapture() {
  const id = useId();
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const phone = String(new FormData(e.currentTarget).get("phone") ?? "").trim();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      setError("Enter a valid phone number, e.g. 98765 43210");
      return;
    }
    setError("");
    prefillLead({ phone });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto w-full max-w-[400px]" aria-label="Book a strategy call">
      <div
        className={`flex items-center gap-2 rounded-full border bg-white/[0.04] p-1 pl-5 transition-colors focus-within:border-electric/60 ${
          error ? "border-[#ff6b6b]/60" : "border-white/10"
        }`}
      >
        <label htmlFor={`${id}-phone`} className="sr-only">
          Your phone number
        </label>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Enter your phone number"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder:text-muted focus:outline-none"
        />
        <button type="submit" className="btn btn-white !h-10 shrink-0 !px-4 !text-[13px]">
          Book a strategy call
        </button>
      </div>
      <p id={`${id}-err`} role={error ? "alert" : undefined} className="min-h-5 pt-2 text-center text-[13px] text-[#ff8a8a]">
        {error}
      </p>
    </form>
  );
}
