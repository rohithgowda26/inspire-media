/**
 * Server-only lead handling: spam checks, rate limiting and delivery.
 * Kept free of Next.js imports so it can be unit-tested with a mocked fetch.
 *
 * Delivery provider is chosen by environment variables:
 *   RESEND_API_KEY        → email via Resend (recommended)
 *   WEB3FORMS_ACCESS_KEY  → email via Web3Forms
 *   neither               → 503 "not configured" (the UI then offers call/WhatsApp)
 */
import { site } from "./site";
import { validateLead, type LeadInput } from "./contact";

export type ContactEnv = {
  RESEND_API_KEY?: string;
  WEB3FORMS_ACCESS_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
};

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

const MAX_BODY_BYTES = 10_000;
const MIN_FILL_MS = 2_500;
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

// Best-effort, per-instance limiter. On serverless each instance has its own map,
// which still blunts bursts; use a shared store (e.g. Upstash) if abuse appears.
const hits = new Map<string, number[]>();

export function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function leadRows(lead: LeadInput): [string, string][] {
  return [
    ["Name", lead.name],
    ["Brand / business", lead.brand ?? "—"],
    ["Phone", lead.phone],
    ["Email", lead.email ?? "—"],
    ["City", lead.city ?? "—"],
    ["Industry", lead.industry ?? "—"],
    ["Service", lead.service ?? "—"],
    ["Monthly budget", lead.budget ?? "—"],
    ["Message", lead.message ?? "—"],
    ["Submitted from", lead.source === "popup" ? "Ad account audit popup" : "Contact section"],
  ];
}

async function sendViaResend(lead: LeadInput, env: ContactEnv, fetchImpl: FetchLike) {
  const rows = leadRows(lead);
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL || "Inspire Media Website <onboarding@resend.dev>",
      to: [env.CONTACT_TO_EMAIL || site.contact.email],
      ...(lead.email && { reply_to: lead.email }),
      subject: `New strategy-call request — ${lead.name}${lead.brand ? ` (${lead.brand})` : ""}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
      html: `<h2 style="font-family:sans-serif">New strategy-call request</h2><table style="font-family:sans-serif;border-collapse:collapse">${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">${k}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
        )
        .join("")}</table>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text().catch(() => "")}`);
}

async function sendViaWeb3Forms(lead: LeadInput, env: ContactEnv, fetchImpl: FetchLike) {
  const res = await fetchImpl("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: env.WEB3FORMS_ACCESS_KEY,
      subject: `New strategy-call request — ${lead.name}`,
      from_name: "Inspire Media Website",
      ...Object.fromEntries(leadRows(lead)),
      ...(lead.email && { email: lead.email }),
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
  if (!res.ok || body.success === false) throw new Error(`Web3Forms responded ${res.status}: ${body.message ?? ""}`);
}

/** Handles POST /api/contact. Returns a JSON Response in every case. */
export async function handleContact(
  request: Request,
  env: ContactEnv,
  fetchImpl: FetchLike = fetch,
  now = Date.now(),
): Promise<Response> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return json(413, { ok: false, error: "too_large" });

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json(413, { ok: false, error: "too_large" });
    raw = JSON.parse(text);
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return json(400, { ok: false, error: "invalid_json" });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip, now)) return json(429, { ok: false, error: "rate_limited" });

  const result = validateLead(raw as Record<string, unknown>);
  if (!result.ok) return json(422, { ok: false, error: "validation", fields: result.errors });
  const lead = result.data;

  // Bots: filled the hidden field or submitted inhumanly fast. Pretend success, send nothing.
  if (lead.company || (lead.startedAt && now - lead.startedAt < MIN_FILL_MS)) {
    return json(200, { ok: true });
  }

  const provider = env.RESEND_API_KEY ? "resend" : env.WEB3FORMS_ACCESS_KEY ? "web3forms" : null;
  if (!provider) {
    console.error("[contact] No email provider configured. Set RESEND_API_KEY or WEB3FORMS_ACCESS_KEY.");
    return json(503, { ok: false, error: "not_configured" });
  }

  try {
    if (provider === "resend") await sendViaResend(lead, env, fetchImpl);
    else await sendViaWeb3Forms(lead, env, fetchImpl);
    return json(200, { ok: true });
  } catch (err) {
    console.error("[contact] Delivery failed:", err);
    return json(502, { ok: false, error: "delivery_failed" });
  }
}
