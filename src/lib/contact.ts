/**
 * Lead form schema + validation, shared by the browser form and the API route
 * so both enforce exactly the same rules.
 */
import { leadOptions } from "./site";

export type LeadSource = "contact" | "popup";

export type LeadInput = {
  name: string;
  brand?: string;
  phone: string;
  email?: string;
  city?: string;
  industry?: string;
  service?: string;
  budget?: string;
  message?: string;
  source: LeadSource;
  /** Honeypot — real visitors never see or fill this. */
  company?: string;
  /** Epoch ms when the form was first rendered (bot timing check). */
  startedAt?: number;
};

export type LeadField = "name" | "brand" | "phone" | "email" | "city" | "industry" | "service" | "budget" | "message";
export type FieldErrors = Partial<Record<LeadField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS: Record<LeadField, number> = {
  name: 80,
  brand: 100,
  phone: 20,
  email: 120,
  city: 60,
  industry: 60,
  service: 40,
  budget: 40,
  message: 2000,
};

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Validates and normalises raw input. Returns cleaned data or per-field messages. */
export function validateLead(raw: Record<string, unknown>):
  | { ok: true; data: LeadInput }
  | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const v = {
    name: clean(raw.name),
    brand: clean(raw.brand),
    phone: clean(raw.phone),
    email: clean(raw.email).toLowerCase(),
    city: clean(raw.city),
    industry: clean(raw.industry),
    service: clean(raw.service),
    budget: clean(raw.budget),
    message: clean(raw.message),
  };

  (Object.keys(LIMITS) as LeadField[]).forEach((k) => {
    if (v[k].length > LIMITS[k]) errors[k] = `Please keep this under ${LIMITS[k]} characters.`;
  });

  if (v.name.length < 2) errors.name = "Please enter your name.";

  const digits = v.phone.replace(/\D/g, "");
  if (!v.phone) errors.phone = "Please enter a phone number so we can call you.";
  else if (digits.length < 10 || digits.length > 13 || /[^\d\s+()-]/.test(v.phone))
    errors.phone = "Please enter a valid phone number.";

  if (v.email && !EMAIL_RE.test(v.email)) errors.email = "Please enter a valid email address.";

  if (v.service && !(leadOptions.services as readonly string[]).includes(v.service))
    errors.service = "Please choose a service from the list.";
  if (v.industry && !(leadOptions.industries as readonly string[]).includes(v.industry))
    errors.industry = "Please choose an industry from the list.";
  if (v.budget && !(leadOptions.budgets as readonly string[]).includes(v.budget))
    errors.budget = "Please choose a budget range from the list.";

  if (Object.keys(errors).length) return { ok: false, errors };

  const source: LeadSource = raw.source === "popup" ? "popup" : "contact";
  const startedAt = typeof raw.startedAt === "number" ? raw.startedAt : undefined;
  return {
    ok: true,
    data: {
      name: v.name,
      phone: v.phone,
      source,
      ...(v.brand && { brand: v.brand }),
      ...(v.email && { email: v.email }),
      ...(v.city && { city: v.city }),
      ...(v.industry && { industry: v.industry }),
      ...(v.service && { service: v.service }),
      ...(v.budget && { budget: v.budget }),
      ...(v.message && { message: v.message }),
      ...(typeof raw.company === "string" && raw.company && { company: raw.company }),
      ...(startedAt && { startedAt }),
    },
  };
}

/** localStorage keys used by the popup and forms. */
export const STORAGE = {
  leadSubmitted: "im_lead_submitted",
  popupDismissedAt: "im_popup_dismissed_at",
} as const;
