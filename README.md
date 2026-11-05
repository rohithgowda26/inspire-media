# Inspire Media — website

Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4. No other runtime dependencies.

## Run it — the easy way

1. Install **Node.js LTS** (20 or newer) from https://nodejs.org — one time only.
2. Unzip this folder.
3. **Windows:** double-click `start-windows.bat`
   **Mac / Linux:** open Terminal in this folder and run `./start-mac-linux.sh`

The first run installs everything (1–2 minutes), creates `.env.local`, and opens http://localhost:3000.
After that it starts in seconds.

## Run it — manually

```bash
npm install
cp .env.example .env.local   # then fill in one email provider key (see below)
npm run dev
```

Other commands: `npm run build` (production build), `npm start`, `npm run typecheck`.

## Design (v4)

Layout, typography and interactions follow the "Black+" reference; colours and content are Inspire Media's
(midnight blue / black / electric blue; all copy and figures from IM.pdf). Font: **Manrope**.

Sections: floating pill nav → hero (pinned headline; the phone scrolls up and away, then the intro, phone box and "Trusted by" logos fade in) →
statement + bento of widget cards → client "integrations" band → stats → "Ready to grow" with store-style
WhatsApp/Call buttons → navy section (bento, process cards, contact form) → footer (link columns + giant outlined "INSPIRE MEDIA" wordmark).

- **Tokens:** colours in `src/app/globals.css` → `@theme`. Utilities: `.card`, `.widget`, `.pill`, `.text-hero`, `.text-silver`, `.btn-*`.
- **Interactions:** hero phone box pre-fills the contact form; "Learn more" opens a service panel; "Discuss …"
  pre-selects that service in the form; "See all clients" opens the full list; cards tilt in and charts draw on scroll;
  stats count up; the "Ready to grow" phone rises as you scroll; 7-second "Free Ad account Audit" popup; Call/WhatsApp buttons after the hero.
  All motion is disabled for visitors who prefer reduced motion.

## Contact form setup (required for enquiries to arrive)

The contact form and the 7-second "Free Ad account Audit" popup both post to `/api/contact`, which emails each enquiry to you.
Set **one** provider in `.env.local` (and in your host's environment variables):

**Option A — Resend (recommended)**
1. Sign up at https://resend.com with `inspiremediabusinesses@gmail.com`.
2. Create an API key → put it in `RESEND_API_KEY`.
3. That's enough to start: enquiries arrive from Resend's test sender. To send from your own domain later, verify the domain in Resend and set `CONTACT_FROM_EMAIL`, e.g. `Inspire Media <hello@yourdomain.com>`.

**Option B — Web3Forms**
1. Get an access key at https://web3forms.com for `inspiremediabusinesses@gmail.com`.
2. Put it in `WEB3FORMS_ACCESS_KEY`.
3. If Web3Forms rejects requests sent from a server on your plan, switch to Resend.

If no key is set, the form tells visitors it couldn't send and offers your phone number and WhatsApp instead. It never pretends an enquiry went through.

Built-in protection: server-side validation, a hidden honeypot field, a minimum fill-time check, and a limit of 5 submissions per visitor per 10 minutes.

## Deploy (Vercel)

1. Push this folder to a GitHub repository.
2. Import it at https://vercel.com/new (framework is detected automatically).
3. Add environment variables: `NEXT_PUBLIC_SITE_URL` (your domain) and your email provider key.
4. Deploy, then add your domain under Project → Settings → Domains.
5. Submit a test enquiry from the live site and confirm the email arrives.

## Where to change things

| What | File |
|---|---|
| Colours, fonts, radii, shadows (design tokens) | `src/app/globals.css` → `@theme` |
| Phone numbers, email, address, Instagram, nav, stats | `src/lib/site.ts` → `site` |
| All website copy (`home` object), services, client list, process, budget ranges | `src/lib/site.ts` |
| Popup delay / snooze length | `src/components/StrategyPopup.tsx` (`DELAY_MS`, `SNOOZE_MS`) |
| Privacy policy text | `src/app/privacy/page.tsx` |
| Logo, client logos | `public/brand/`, `public/clients/` |
| Favicon, Apple icon, share image | `src/app/icon.png`, `apple-icon.png`, `opengraph-image.png` |

## Popup behaviour

Appears 7 seconds after landing, once per visit. Closing it hides it for 7 days; submitting any form hides it permanently on that browser. It won't open while someone is typing in the contact form. Closes with ×, Esc, or a click outside. Dark pitch panel + light "Get a Free Ad account Audit" form (name, business, city, phone, email, industry, budget — all required). On phones it shows as a scrollable bottom sheet. Industry and city suggestion lists live in `src/lib/site.ts` → `leadOptions`.
