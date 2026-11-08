/**
 * Lead form schema + validation, shared by the browser form and the API route
 * so both enforce exactly the same rules.
 */
import { leadOptions, whatsappUrl } from "./site";

export type LeadSource = "contact" | "popup";

/** Human-readable form names, used in notifications. */
export const SOURCE_LABEL: Record<LeadSource, string> = {
  contact: "Contact Form",
  popup: "Free Ad Account Audit",
};

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
  /** Random id created once per form fill, so a repeated submit is recognised as the same enquiry. */
  submissionId?: string;
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

// Trim, drop control characters (keeping newlines in messages) and collapse runs of spaces.
const clean = (v: unknown, multiline = false) =>
  typeof v === "string"
    ? v
        .replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, " ")
        .replace(/[ \u00A0]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    : "";
const SUBMISSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

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
    message: clean(raw.message, true),
  };

  (Object.keys(LIMITS) as LeadField[]).forEach((k) => {
    if (v[k].length > LIMITS[k]) errors[k] = `Please keep this under ${LIMITS[k]} characters.`;
  });

  if (v.name.length < 2) errors.name = "Please enter your name.";

  const digits = v.phone.replace(/\D/g, "");
  if (!v.phone) errors.phone = "Please enter a phone number so we can call you.";
  else if (digits.length < 10 || digits.length > 13 || /[^\d\s+()-]/.test(v.phone))
    errors.phone = "Please enter a valid phone number.";

  if (!v.email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(v.email)) errors.email = "Please enter a valid email address.";

  if (v.service && !(leadOptions.services as readonly string[]).includes(v.service))
    errors.service = "Please choose a service from the list.";
  if (v.industry && !(leadOptions.industries as readonly string[]).includes(v.industry))
    errors.industry = "Please choose an industry from the list.";
  if (v.budget && !(leadOptions.budgets as readonly string[]).includes(v.budget))
    errors.budget = "Please choose a budget range from the list.";

  if (Object.keys(errors).length) return { ok: false, errors };

  const source: LeadSource = raw.source === "popup" ? "popup" : "contact";
  const startedAt = typeof raw.startedAt === "number" ? raw.startedAt : undefined;
  const submissionId = typeof raw.submissionId === "string" && SUBMISSION_ID_RE.test(raw.submissionId) ? raw.submissionId : undefined;
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
      ...(submissionId && { submissionId }),
    },
  };
}

/** localStorage keys used by the popup and forms. */
export const STORAGE = {
  leadSubmitted: "im_lead_submitted",
  popupDismissedAt: "im_popup_dismissed_at",
} as const;

/** A new id for one form fill (used to recognise accidental repeat submits). */
export function newSubmissionId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

/**
 * Fallback when automatic WhatsApp alerts aren't available: a wa.me link that opens WhatsApp
 * with the visitor's enquiry already typed out, addressed to Inspire Media's number.
 */
export function enquiryWhatsAppUrl(lead: Partial<LeadInput>): string {
  const lines = [
    `Hi Inspire Media! I just sent an enquiry through your website (${SOURCE_LABEL[lead.source === "popup" ? "popup" : "contact"]}).`,
    "",
    lead.name && `Name: ${lead.name}`,
    lead.brand && `Business: ${lead.brand}`,
    lead.phone && `Phone: ${lead.phone}`,
    lead.email && `Email: ${lead.email}`,
    lead.service && `Service: ${lead.service}`,
    lead.budget && `Budget: ${lead.budget}`,
    lead.message && `Message: ${String(lead.message).slice(0, 600)}`,
  ].filter((l): l is string => typeof l === "string");
  return whatsappUrl(lines.join("\n"));
}
