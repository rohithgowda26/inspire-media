/**
 * Server-only lead handling for POST /api/contact: spam checks, rate limiting, duplicate
 * protection and delivery. Kept free of Next.js imports so it can be tested with mocks.
 *
 * What happens to an accepted enquiry (each channel runs only if its env vars are set):
 *   1. Business notification email → CONTACT_TO_EMAIL (default inspiremediabusinesses@gmail.com)
 *        via Gmail SMTP  (GMAIL_USER + GMAIL_APP_PASSWORD)            ← recommended, free
 *        or Resend       (RESEND_API_KEY [+ CONTACT_FROM_EMAIL])
 *        or Web3Forms    (WEB3FORMS_ACCESS_KEY)
 *   2. Thank-you confirmation email to the visitor — Gmail SMTP, or Resend with a verified-domain sender
 *
 * The enquiry counts as accepted only when step 1 succeeded. Otherwise the visitor gets an
 * error (never a fake success) plus call / WhatsApp options.
 */
import { site } from "./site";
import { SOURCE_LABEL, validateLead, type LeadInput } from "./contact";

export type ContactEnv = {
  // business notification email
  CONTACT_TO_EMAIL?: string;
  GMAIL_USER?: string;
  GMAIL_APP_PASSWORD?: string;
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  WEB3FORMS_ACCESS_KEY?: string;
};

export type ChannelStatus = "sent" | "failed" | "not_configured";
export type DeliveryReport = { email: ChannelStatus; confirmation: ChannelStatus };

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;
type Mail = { from: string; to: string; replyTo?: string; subject: string; text: string; html: string };
/** Sends one email over Gmail SMTP. Injectable so tests don't need a real mailbox. */
export type GmailSender = (env: ContactEnv, mail: Mail) => Promise<void>;

const MAX_BODY_BYTES = 10_000;
const MIN_FILL_MS = 2_500;
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const DEDUPE_MS = 10 * 60 * 1000;
const TIME_ZONE = "Asia/Kolkata";

/* ───────────────────────── Rate limiting & duplicate protection ───────────────────────── */

// Best-effort, per-instance memory. On serverless each instance has its own maps, which still
// stops double-clicks and bursts; use a shared store (e.g. Upstash Redis) if abuse appears.
const hits = new Map<string, number[]>();

export function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

type Outcome = { status: number; body: Record<string, unknown> };
const recentOutcomes = new Map<string, { at: number; outcome: Outcome }>();
const inFlight = new Map<string, Promise<Outcome>>();

/** Keys that identify "the same enquiry": the form's submission id, and a content fingerprint. */
function dedupeKeys(lead: LeadInput): string[] {
  const fingerprint = [lead.source, lead.email ?? "", lead.phone.replace(/\D/g, ""), lead.service ?? "", lead.message ?? ""]
    .join("|")
    .toLowerCase();
  return [...(lead.submissionId ? [`id:${lead.submissionId}`] : []), `fp:${fingerprint}`];
}

function findDuplicate(keys: string[], now: number): Outcome | Promise<Outcome> | null {
  for (const [k, v] of recentOutcomes) if (now - v.at > DEDUPE_MS) recentOutcomes.delete(k);
  for (const k of keys) {
    const pending = inFlight.get(k);
    if (pending) return pending;
    const done = recentOutcomes.get(k);
    if (done) return done.outcome;
  }
  return null;
}

/** Test helper: forget remembered submissions and rate-limit hits. */
export function resetContactMemory() {
  hits.clear();
  recentOutcomes.clear();
  inFlight.clear();
}

/* ───────────────────────── Formatting helpers ───────────────────────── */

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function formatIST(at: number) {
  return (
    new Intl.DateTimeFormat("en-IN", {
      timeZone: TIME_ZONE,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(at)) + " IST"
  );
}

/** Digits for wa.me / the WhatsApp API: 10-digit Indian numbers get the 91 prefix. */
export function toWaNumber(phone: string) {
  const d = phone.replace(/\D/g, "").replace(/^0+/, "");
  return d.length === 10 ? `91${d}` : d;
}

const businessInbox = (env: ContactEnv) => env.CONTACT_TO_EMAIL || env.GMAIL_USER || site.contact.email;

function leadRows(lead: LeadInput, at: number): [string, string][] {
  return [
    ["Full name", lead.name],
    ["Email", lead.email ?? "—"],
    ["Phone / WhatsApp", lead.phone],
    ["Business", lead.brand ?? "—"],
    ["Service", lead.service ?? "—"],
    ["Budget", lead.budget ?? "—"],
    ["City", lead.city ?? "—"],
    ...(lead.industry ? ([["Industry", lead.industry]] as [string, string][]) : []),
    ["Message", lead.message ?? "—"],
    ["Form", SOURCE_LABEL[lead.source]],
    ["Submitted", formatIST(at)],
  ];
}

/* ───────────────────────── 1. Business notification email ───────────────────────── */

export function businessEmail(lead: LeadInput, at: number) {
  const rows = leadRows(lead, at);
  const form = SOURCE_LABEL[lead.source];
  const subject = `New enquiry: ${lead.name}${lead.brand ? ` (${lead.brand})` : ""} · ${form}`;
  const waChat = `https://wa.me/${toWaNumber(lead.phone)}?text=${encodeURIComponent(`Hi ${lead.name.split(/\s+/)[0]}, this is Inspire Media — thanks for your enquiry!`)}`;
  const text = [`New enquiry from the Inspire Media website (${form})`, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", `Reply on WhatsApp: ${waChat}`].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#eef1f7;padding:24px 12px;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0b1020">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dde3ef">
  <tr><td style="background:#0b1020;padding:22px 28px">
    <p style="margin:0;font:600 11px/1 monospace;letter-spacing:3px;text-transform:uppercase;color:#4277ff">Inspire Media · New enquiry</p>
    <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;color:#ffffff">${escapeHtml(lead.name)}${lead.brand ? ` <span style="color:#9fb3ff;font-weight:400">· ${escapeHtml(lead.brand)}</span>` : ""}</h1>
    <p style="margin:8px 0 0;font-size:13px;color:#aab4cc">${escapeHtml(form)} · ${escapeHtml(formatIST(at))}</p>
  </td></tr>
  <tr><td style="padding:22px 28px 6px">
    <a href="tel:${escapeHtml(lead.phone.replace(/[^\d+]/g, ""))}" style="display:inline-block;background:#1747ff;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 18px;border-radius:999px;margin:0 8px 8px 0">Call ${escapeHtml(lead.phone)}</a>
    <a href="${waChat}" style="display:inline-block;background:#25d366;color:#04140a;text-decoration:none;font-weight:700;font-size:14px;padding:11px 18px;border-radius:999px;margin:0 8px 8px 0">Reply on WhatsApp</a>
    ${lead.email ? `<a href="mailto:${escapeHtml(lead.email)}" style="display:inline-block;background:#eef1f7;color:#0b1020;text-decoration:none;font-weight:700;font-size:14px;padding:11px 18px;border-radius:999px;margin:0 0 8px">Email</a>` : ""}
  </td></tr>
  <tr><td style="padding:8px 28px 26px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:10px 14px 10px 0;border-top:1px solid #eef1f7;color:#66718a;font-size:13px;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:10px 0;border-top:1px solid #eef1f7;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:break-word">${escapeHtml(v)}</td></tr>`,
        )
        .join("")}
    </table>
  </td></tr>
</table>
<p style="margin:14px 0 0;font-size:11px;color:#8a93a8">Sent automatically by the contact form on your website. Reply to this email to answer the client directly.</p>
</td></tr></table></body></html>`;
  return { subject, text, html };
}

/* ───────────────────────── 2. Confirmation email to the visitor ───────────────────────── */

export function confirmationEmail(lead: LeadInput) {
  const name = lead.name;
  const service = lead.service ?? (lead.source === "popup" ? "a free ad account audit" : "our services");
  const wa = `https://wa.me/${site.contact.primaryPhone.whatsapp}?text=${encodeURIComponent(`Hi Inspire Media, I just sent an enquiry on your website. — ${name}`)}`;
  const subject = "We've Received Your Enquiry | Inspire Media";
  const text = [
    `Hi ${name},`,
    "",
    "Thank you for contacting Inspire Media!",
    "",
    `We've successfully received your enquiry regarding ${service}. Our team will review your requirements and get back to you as soon as possible.`,
    "",
    "If your enquiry is urgent, you can contact us directly through WhatsApp:",
    wa,
    "",
    "Best regards,",
    "Team Inspire Media",
  ].join("\n");

  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#05070d;padding:28px 12px;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#e6ebf5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0b1020;border:1px solid #1c2440;border-radius:20px;overflow:hidden">
  <tr><td style="height:4px;background-color:#1747ff;background-image:linear-gradient(90deg,#1747ff,#287bff,#7fb0ff)"></td></tr>
  <tr><td style="padding:34px 32px 0">
    <p style="margin:0 0 22px;font:600 11px/1 monospace;letter-spacing:3px;text-transform:uppercase;color:#4277ff">Inspire Media</p>
    <p style="margin:0;font-size:16px;color:#ffffff">Hi ${escapeHtml(name)},</p>
    <h1 style="margin:14px 0 0;font-size:26px;line-height:1.25;color:#ffffff;font-weight:700">Thank you for contacting <span style="color:#4277ff">Inspire Media!</span></h1>
    <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#aab4cc">We've successfully received your enquiry regarding <b style="color:#ffffff">${escapeHtml(service)}</b>. Our team will review your requirements and get back to you as soon as possible.</p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#aab4cc">If your enquiry is urgent, you can contact us directly through WhatsApp.</p>
  </td></tr>
  <tr><td style="padding:24px 32px 0">
    <a href="${wa}" style="display:inline-block;background:#25d366;color:#04140a;text-decoration:none;font-weight:700;font-size:15px;padding:13px 22px;border-radius:999px">Chat with us on WhatsApp</a>
  </td></tr>
  <tr><td style="padding:30px 32px 32px">
    <p style="margin:0;font-size:15px;line-height:1.6;color:#e6ebf5">Best regards,<br><b>Team Inspire Media</b></p>
    <p style="margin:22px 0 0;padding-top:18px;border-top:1px solid #1c2440;font-size:12.5px;line-height:1.7;color:#7d88a6">${escapeHtml(site.contact.primaryPhone.display)} · <a href="mailto:${site.contact.email}" style="color:#7d88a6;text-decoration:none">${site.contact.email}</a><br>${escapeHtml(`${site.contact.address.line1}, ${site.contact.address.city} – ${site.contact.address.postalCode}`)}<br><a href="${site.contact.instagram.url}" style="color:#4277ff;text-decoration:none">${site.contact.instagram.handle}</a></p>
  </td></tr>
</table>
<p style="margin:16px 0 0;font-size:11px;color:#4b5571">You're receiving this because you submitted an enquiry on the Inspire Media website.</p>
</td></tr></table></body></html>`;
  return { subject, text, html };
}

/* ───────────────────────── Email transports ───────────────────────── */

const defaultGmailSender: GmailSender = async (env, mail) => {
  const { createTransport } = await import("nodemailer");
  const transport = createTransport({
    service: "gmail",
    auth: { user: env.GMAIL_USER, pass: (env.GMAIL_APP_PASSWORD ?? "").replace(/\s+/g, "") },
  });
  await transport.sendMail(mail);
};

const gmailFrom = (env: ContactEnv) => `Inspire Media <${env.GMAIL_USER}>`;

async function resendSend(env: ContactEnv, fetchImpl: FetchLike, mail: Omit<Mail, "from"> & { from?: string }) {
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: mail.from || env.CONTACT_FROM_EMAIL || "Inspire Media Website <onboarding@resend.dev>",
      to: [mail.to],
      ...(mail.replyTo && { reply_to: mail.replyTo }),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`);
}

async function web3formsSend(lead: LeadInput, at: number, env: ContactEnv, fetchImpl: FetchLike) {
  const { subject } = businessEmail(lead, at);
  const res = await fetchImpl("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: env.WEB3FORMS_ACCESS_KEY,
      subject,
      from_name: "Inspire Media Website",
      ...Object.fromEntries(leadRows(lead, at)),
      ...(lead.email && { replyto: lead.email }),
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string };
  if (!res.ok || body.success === false) throw new Error(`Web3Forms responded ${res.status}: ${body.message ?? ""}`);
}

type EmailProvider = "gmail" | "resend" | "web3forms" | null;
const emailProvider = (env: ContactEnv): EmailProvider =>
  env.GMAIL_USER && env.GMAIL_APP_PASSWORD ? "gmail" : env.RESEND_API_KEY ? "resend" : env.WEB3FORMS_ACCESS_KEY ? "web3forms" : null;

/** Resend can only email arbitrary visitors from a verified-domain sender (not onboarding@resend.dev). */
const resendCanConfirm = (env: ContactEnv) => Boolean(env.CONTACT_FROM_EMAIL && !/@resend\.dev>?$/i.test(env.CONTACT_FROM_EMAIL.trim()));

async function sendBusinessEmail(provider: EmailProvider, lead: LeadInput, at: number, env: ContactEnv, fetchImpl: FetchLike, gmail: GmailSender) {
  const mail = { to: businessInbox(env), replyTo: lead.email, ...businessEmail(lead, at) };
  if (provider === "gmail") return gmail(env, { from: gmailFrom(env), ...mail });
  if (provider === "resend") return resendSend(env, fetchImpl, mail);
  if (provider === "web3forms") return web3formsSend(lead, at, env, fetchImpl);
}

async function sendConfirmation(lead: LeadInput, env: ContactEnv, fetchImpl: FetchLike, gmail: GmailSender): Promise<ChannelStatus> {
  if (!lead.email) return "not_configured";
  const mail = { to: lead.email, replyTo: businessInbox(env), ...confirmationEmail(lead) };
  try {
    if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) await gmail(env, { from: gmailFrom(env), ...mail });
    else if (env.RESEND_API_KEY && resendCanConfirm(env)) await resendSend(env, fetchImpl, mail);
    else return "not_configured";
    return "sent";
  } catch (err) {
    console.error("[contact] Confirmation email failed:", safeError(err));
    return "failed";
  }
}

/** Error text for logs — never includes tokens or passwords. */
function safeError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/(Bearer\s+)[\w.-]+/gi, "$1[redacted]").slice(0, 500);
}

/* ───────────────────────── Request handler ───────────────────────── */

async function deliver(lead: LeadInput, env: ContactEnv, fetchImpl: FetchLike, gmail: GmailSender, at: number): Promise<Outcome> {
  const provider = emailProvider(env);
  if (!provider) {
    console.error("[contact] No email configured. Set GMAIL_USER + GMAIL_APP_PASSWORD.");
    return { status: 503, body: { ok: false, error: "not_configured" } };
  }

  try {
    await sendBusinessEmail(provider, lead, at, env, fetchImpl, gmail);
  } catch (err) {
    // Not accepted: the enquiry didn't reach the business. Don't confirm anything to the visitor.
    console.error(`[contact] Business email (${provider}) failed:`, safeError(err));
    return { status: 502, body: { ok: false, error: "delivery_failed" } };
  }

  const report: DeliveryReport = { email: "sent", confirmation: await sendConfirmation(lead, env, fetchImpl, gmail) };
  console.info(`[contact] Enquiry accepted (${SOURCE_LABEL[lead.source]}) — confirmation:${report.confirmation}`);
  return { status: 200, body: { ok: true, delivery: report } };
}

/** Handles POST /api/contact. Returns a JSON Response in every case. */
export async function handleContact(
  request: Request,
  env: ContactEnv,
  fetchImpl: FetchLike = fetch,
  now = Date.now(),
  gmail: GmailSender = defaultGmailSender,
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

  const result = validateLead(raw as Record<string, unknown>);
  if (!result.ok) return json(422, { ok: false, error: "validation", fields: result.errors });
  const lead = result.data;

  // Bots: filled the hidden field or submitted inhumanly fast. Pretend success, send nothing.
  if (lead.company || (lead.startedAt && now - lead.startedAt < MIN_FILL_MS)) {
    return json(200, { ok: true });
  }

  // Same enquiry again (double-click, retry, back-button resubmit): answer as before, send nothing new.
  const keys = dedupeKeys(lead);
  const dup = findDuplicate(keys, now);
  if (dup) {
    const o = await dup;
    return json(o.status, { ...o.body, duplicate: true });
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip, now)) return json(429, { ok: false, error: "rate_limited" });

  const job = deliver(lead, env, fetchImpl, gmail, now).catch((err): Outcome => {
    console.error("[contact] Unexpected error:", safeError(err));
    return { status: 500, body: { ok: false, error: "server_error" } };
  });
  keys.forEach((k) => inFlight.set(k, job));
  const outcome = await job;
  keys.forEach((k) => inFlight.delete(k));
  // Remember only accepted enquiries, so a visitor can retry after a failure.
  if (outcome.status === 200) keys.forEach((k) => recentOutcomes.set(k, { at: now, outcome }));
  if (recentOutcomes.size > 5_000) recentOutcomes.clear();
  return json(outcome.status, outcome.body);
}
