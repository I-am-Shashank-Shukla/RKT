# Radha Kishori Travellers

Billing web app for a car rental business in Kanpur, India.  
Generates PDF bills, tracks payments, and manages drivers — all from the browser, no backend server needed.

**Live → https://radhakishoritravellers.netlify.app**

---

## What it does

- Creates itemised car-hire bills (advance + balance, local/outstation, halt charges)
- Generates PDF receipts via html2pdf and QR-coded UPI payment links
- Driver login with PIN — drivers see only their own trips
- Owner dashboard: search/filter all bills, one-click CSV export, payment reversal log
- Works offline with a banner warning; auto-retries Supabase calls on network failure
- Fully bilingual — Hindi / English toggle on every page

---

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | Vanilla HTML + CSS + JS (no framework) |
| Database | Supabase (Postgres) |
| PDF | html2pdf.js 0.10.1 (vendored) |
| QR | qrcode.js 1.4.4 (vendored) |
| Fonts | Cinzel + Mukta — self-hosted woff2 |
| Hosting | Netlify (static) |

All vendor JS lives in `assets/vendor/` — no CDN dependency at runtime.

---

## Pages

| File | Route | Who uses it |
|---|---|---|
| `index.html` | `/` | Landing — login entry point |
| `driver.html` | `/driver` | Driver: create bill, view own trips |
| `bill.html` | `/bill` | Anyone with link: view + pay + PDF |
| `admin.html` | `/admin` | Owner: full dashboard |

---

## Business details (hardcoded)

| Field | Value |
|---|---|
| Owner | Ashok Kumar Shukla |
| Phones | 9935792953 · 7651906520 |
| UPI | ashokshuklaarti@okicici |
| Car | UP 35 CE 0371 |
| Driver | Anil |
| Address | Kanpur Nagar, Uttar Pradesh |

---

## Supabase setup

Project URL: `https://tcyqglzscrcujkfiijmp.supabase.co`  
The publishable (anon) key is in `assets/app.js` line 1 — this is safe to commit.  
**Never commit the service_role key.**

### SQL migrations — run in order

```
sql/01-schema.sql          — base tables (bills, payments, drivers)
sql/02-driver-pin.sql      — driver PIN auth
sql/03-rls-policies.sql    — row-level security
sql/04-reverse-payment.sql — optional: server-side payment reversal RPC
```

Run each file in **Supabase Dashboard → SQL Editor**. File 04 is optional; the app falls back to a direct table update if the RPC isn't present.

---

## Driver PIN

1. Open Supabase Dashboard → Table Editor → `drivers`
2. Set `pin` column value for each driver row
3. Driver enters their name + PIN on the login screen — no account needed

---

## Run tests

```bash
node tests/billing.test.js
```

Expects 13/13 PASS. Tests cover all fare calculation paths — run after any change to `assets/app.js`.

---

## Update the site

```bash
# 1. make your changes locally
# 2. run tests
node tests/billing.test.js

# 3. commit
git add .
git commit -m "your message"

# 4. push — Netlify auto-deploys from main branch
git push
```

> **One-time setup:** In Netlify Dashboard → Site → Build & deploy → Link to GitHub repo `I-am-Shashank-Shukla/RKT`, branch `main`. After that, every push deploys automatically.

---

## Local preview

No build step. Open any HTML file directly in a browser, or use:

```bash
npx serve .
```

---

## Project structure

```
RKT/
├── assets/
│   ├── app.js            # Supabase init, i18n, shared utils
│   ├── style.css         # All styles
│   ├── fonts.css         # Self-hosted font faces
│   ├── index-page.js
│   ├── driver-page.js
│   ├── bill-page.js
│   ├── admin-page.js
│   ├── fonts/            # Cinzel + Mukta woff2 files
│   └── vendor/           # supabase, html2pdf, qrcode (no CDN)
├── sql/                  # Migration files (01–04)
├── tests/
│   └── billing.test.js
├── 404.html
├── robots.txt
├── netlify.toml
└── _headers
```

---

## Security

- Content-Security-Policy: `script-src 'self'` — no inline scripts, no CDN
- X-Frame-Options: DENY
- All assets fingerprinted with `?v=1` cache busting
- RLS enabled on all Supabase tables
- Driver auth is PIN-only (no passwords stored)
