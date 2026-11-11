# Radha Kishori Travellers: billing site
Pages: index.html (home), driver.html, bill.html (customer receipt), admin.html (owner). Shared code: assets/app.js, assets/style.css.
## One-time database setup (Supabase > SQL Editor)
Run in order, once each: sql/01-initial.sql, sql/02-upgrade.sql, sql/03-security-payments.sql. (If 01 and 02 were already run, run only 03.)
Then: Authentication > Users > add the owner; Sign In / Providers > turn OFF "Allow new users to sign up".
Open Supabase URL and publishable key are set at the top of assets/app.js. NEVER put a secret / service_role key in this folder.
## Go live
Drag this whole folder to app.netlify.com/drop (or upload to Cloudflare Pages). Keep the folder structure.
## Test billing formulas
node tests/billing.test.js
