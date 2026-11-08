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

## Enquiries: Gmail notification + thank-you email

Both forms (the contact section and the "Free Ad Account Audit" popup) post to `/api/contact`.
For every real enquiry the server:

1. **Emails the enquiry to you** (`CONTACT_TO_EMAIL`, default `inspiremediabusinesses@gmail.com`), with name, email,
   phone/WhatsApp, business, service, budget, message, which form it came from and the date and time (IST).
   It uses an HTML layout with a plain-text version. Hit *Reply* to answer the client.
2. **Emails the client a thank-you**, subject "We've Received Your Enquiry | Inspire Media".

The visitor only sees "success" if step 1 reached your inbox. Otherwise they see an error with your phone number and a
WhatsApp link that already contains their enquiry. A failed thank-you email is logged but never loses the enquiry.
The Gmail password lives only in environment variables on the server, never in the browser.

### Install once
```
npm install nodemailer
npm install -D @types/nodemailer
```

### Gmail setup (free)
1. Sign in to **inspiremediabusinesses@gmail.com** → https://myaccount.google.com/security.
2. Turn on **2-Step Verification**.
3. Open https://myaccount.google.com/apppasswords, create one called `Website`, and copy the 16-letter password.
4. In `.env.local`, and in Vercel → Settings → Environment Variables, set:
   ```
   CONTACT_TO_EMAIL=inspiremediabusinesses@gmail.com
   GMAIL_USER=inspiremediabusinesses@gmail.com
   GMAIL_APP_PASSWORD=<the 16-letter password>
   ```

Emails are sent *from* this Gmail, both to you and to the client. Gmail allows roughly 500 emails a day.

**Alternatives:**
- **Resend** (`RESEND_API_KEY`): thank-you emails need a verified domain in `CONTACT_FROM_EMAIL`.
- **Web3Forms** (`WEB3FORMS_ACCESS_KEY`): sends the email to you only, no thank-you.

### Protection that's built in
- Validation and cleaning of every field, in the browser and again on the server. Email is required.
- A hidden honeypot field and a minimum fill-time check (bots get a fake "ok" and nothing is sent).
- A limit of 5 submissions per visitor per 10 minutes.
- **Duplicate protection:** the button locks while sending, and each form fill carries a submission ID. The server
  also remembers an enquiry for 10 minutes, so a double-click never sends two emails.

### Test it
1. Run `npm run build` (it should finish with no red errors), then `npm run dev` and open http://localhost:3000.
2. Submit the **contact form** with a second email address of yours:
   - Gmail gets "New enquiry: … · Contact Form".
   - Your second inbox gets "We've Received Your Enquiry | Inspire Media". Check Spam the first time.
3. **Popup:** run `localStorage.clear()` in the browser console, reload, wait 7 seconds and submit. You should get the
   same two emails, labelled "Free Ad Account Audit".
4. Add the same three variables in Vercel, push, and test once on the live site.

## Deploy (Vercel)

1. Push this folder to a GitHub repository.
2. Import it at https://vercel.com/new (framework is detected automatically).
3. Add environment variables: `NEXT_PUBLIC_SITE_URL` plus the three Gmail variables (see "Enquiries" above).
4. Deploy, then add your domain under Project → Settings → Domains.
5. Submit a test enquiry from the live site and confirm both emails arrive.

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
