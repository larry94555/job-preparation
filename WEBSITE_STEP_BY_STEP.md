# Step-by-Step: Launch the Website

A do-it-in-order runbook. Follow it top to bottom and, at the end, you will have a live
website where anyone can browse the topics and try a sample lesson, people can create a free
account by email, signed-in users get the full LLM-graded lessons, visitors can donate
"pay what you can," and a Help link emails your support address.

**Who this is for:** a smart person who is not a professional developer. You will copy a few
commands into a terminal, sign up for a few free services, and paste ready-made **prompts**
into Claude Code (in this repository) to generate the new pages. You do **not** need to write
code yourself.

**Companion document:** [WEBSITE_PLAN.md](WEBSITE_PLAN.md) explains *why* each choice was made.

**How the prompts work:** anything in a `PROMPT ▸ …` box is meant to be **pasted into Claude
Code while it's open in this repository**. Claude Code can read the whole codebase, so these
prompts tell it exactly what to build and where. After each one, it will show you the changes;
run the "check it worked" command listed before moving on.

**Legend:** 🖥️ = type in a terminal · 🌐 = do in a web browser · 🤖 = paste into Claude Code ·
✅ = checkpoint (confirm before continuing).

---

## Cost & time summary

| | |
| --- | --- |
| **Fixed cost** | ~**$10/year** (a domain name). Everything else is free at low traffic. |
| **Per-payment cost** | Stripe takes **2.9% + 30¢** only when someone actually donates. |
| **Time** | ~1 focused day for a first-timer; the deploy (Phase F) is the longest part. |

You will create free accounts on: **Oracle Cloud**, **Cloudflare**, **Resend**, and **Stripe**.

---

## Phase 0 — Before you start (accounts & tools)

**0.1 🌐 Create the service accounts** (all free to start):
- **Oracle Cloud** account (you likely already have one — it runs your LLM). You need an
  **Always Free** "Ampere A1" virtual machine (VM). If the LLM already runs on such a VM,
  you'll reuse it.
- **Cloudflare** account (for your domain's DNS and free support-email forwarding).
- **Resend** account, at resend.com (sends the sign-up verification emails).
- **Stripe** account, at stripe.com (donations). Keep it in **Test mode** until launch.

**0.2 🌐 Buy a domain name** (~$10/year) — e.g. `yourprepsite.com`. Cloudflare Registrar or
Namecheap are fine. You need one for HTTPS, professional email, and a memorable address.

**0.3 🖥️ Make sure you have the tools locally:** `git`, `node` (v22+), and this repository
cloned. In the repo folder, run `npm install` once. (If Claude Code is already working here,
you have these.)

✅ **Checkpoint:** you can open this repo in Claude Code, and you have logins for Oracle,
Cloudflare, Resend, and Stripe.

---

## Phase A — Turn on the public (not-signed-in) experience

Right now the site forces everyone to sign in. We'll open up a public catalog + one sample
lesson, and keep the real lessons behind sign-in.

**A.1 🤖 Open the catalog and gating to the public.**

> **PROMPT ▸ Public gating**
> "In this repo's `web/` Next.js app, the middleware (`web/middleware.ts`) currently forces
> every request to sign in. Change the site so **anonymous visitors** can access: the home
> page `/`, a topics catalog `/topics`, a single sample lesson under `/sample`, the sign-up
> pages `/signup` and `/help/signup`, a `/help` page, the read-only `/api/home` route, and all
> static assets. **Keep behind sign-in**: the real lesson runner (`/lesson/*`), `/practice`,
> and the grading/answer APIs (`/api/apply`, `/api/next`, `/api/answer`, `/api/assessment`,
> `/api/practice/*`, `/api/state`).
> Then update `web/app/page.tsx` and add `web/app/topics/page.tsx` so anonymous visitors see
> the **full list of all topics with each topic's title and description/explanation**, plus a
> banner: 'Free — create an account to unlock every lesson.' For any real topic, the 'Start
> lesson' button should link to `/signup` when the visitor is not signed in. Use the existing
> `currentUserId()` helper (`web/lib/session.ts`) to detect sign-in. Keep the existing signed-in
> behavior unchanged. Do not break `npm run typecheck` or the tests."

**A.2 🤖 Create the one sample lesson (no LLM needed).**

> **PROMPT ▸ Sample lesson**
> "Pick one existing topic as the free sample (use `agentic-tool-calling`). Add a public route
> `web/app/sample/[...]` that plays that topic's lesson flow for **anonymous** users, but
> **only** its deterministic steps — the 'present' material and the multiple-choice / fill-in
> (`text_input`) checks. **Skip any essay or code step** (those need the LLM and are a
> signed-in feature); where one would appear, show a small 'Sign up to unlock graded essays &
> coding exercises' card instead. Reuse the existing lesson engine/components as much as
> possible; do not add LLM calls to this route. Add a 'Try the sample lesson' button on the
> home page for anonymous visitors."

**A.3 ✅ Check it worked.** 🖥️ `npm run typecheck` (expect 0 errors) and `npm run dev`, then
in the browser open the site in a **private/incognito window** (so you're not signed in):
you should see all topics with descriptions, be able to play the sample lesson's MCQ steps,
and get bounced to `/signup` if you click a real topic.

---

## Phase B — Real accounts with email verification (magic link)

We replace the fake "type any email" login with a real one: the visitor enters their email,
gets a link, clicks it (that verifies them), and they're in. No passwords.

**B.1 🌐 Get a Resend API key.** In Resend: create an **API key** and copy it. For now you can
send from Resend's test sender; in Phase F you'll verify your own domain for reliable delivery.

**B.2 🤖 Add magic-link sign-up + verification + troubleshooting.**

> **PROMPT ▸ Magic-link auth**
> "This app uses NextAuth v5 (Auth.js) in `web/auth.ts` with a dev-only Credentials stub.
> Add a real **passwordless email (magic-link) sign-in** using the Auth.js **Email/Resend
> provider**, backed by a **database adapter** so verification tokens and users persist.
> Use `@auth/drizzle-adapter` over the existing Drizzle/Postgres store in `packages/store`
> (the app's `DATABASE_URL`). Add the adapter's required tables (`accounts`, `sessions`,
> `verification_token`) via a Drizzle migration, and extend the existing `users` table with
> `email_verified` — **but keep the stable user `id` equal to the lowercased email**, because
> `lesson_progress` is keyed by that. Keep the existing dev Credentials provider available
> only when `NODE_ENV !== 'production'`.
> Build these pages: `/signup` (enter email → send link → redirect to a 'Check your email'
> confirmation page `/signup/check`); a post-verification landing that shows 'You're verified 🎉'
> and links into the app; and `/help/signup`, a **troubleshooting** page covering: didn't get
> the email (check spam; a 'Resend link' button), link expired (request a new one), wrong email
> (start over), and a 'Still stuck? Email support' link. Read `RESEND_API_KEY` and
> `EMAIL_FROM` from environment variables. Add light rate-limiting so one email can't request
> dozens of links. Don't break typecheck or tests."

**B.3 🖥️ Create the database tables.** Bring up a local Postgres and apply the schema so you
can test:
- 🖥️ `npm run db:up` (starts local Postgres in Docker) — from `HOSTING.md`.
- 🖥️ `npm run db:push` (creates the tables).

**B.4 ✅ Check it worked.** 🖥️ set `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`,
`AUTH_SECRET` in a local `.env` (see `.env.example`), run `npm run dev`, go to `/signup`,
enter a real email, and confirm the link arrives and signs you in. Try `/help/signup` and the
"Resend link" button.

---

## Phase C — Confirm the full signed-in experience

Almost nothing to build here — the app already scopes everything per user. You're verifying
the unlock.

**C.1 ✅ Signed-in smoke test.** While signed in (from B.4), open a **real** topic, play a
lesson that includes an essay or code step, and confirm you get a grade. (Grading needs the
LLM — locally you can point at your Oracle LLM by setting `LLAMA_BASE_URL` and the secrets, or
just confirm the request is made and defer full grading to the deployed environment in
Phase F.) Confirm your progress persists after signing out and back in.

If anything about grading looks off, use:
> **PROMPT ▸ Grading wiring check**
> "Trace how a signed-in user's essay/code answer flows from the web `/api/apply` route through
> the grading worker to the Oracle LLM, and list exactly which environment variables the
> **worker** needs (LLAMA_BASE_URL, LLAMA_API_KEY, MODEL_CONFIG_PATH, SANDBOX_URL, DATABASE_URL,
> QUEUE) and where each is set. Confirm the browser never sees the LLM key."

---

## Phase D — Donations (live) and the premium preview

**D.1 🌐 Get Stripe keys (Test mode first).** In Stripe (Test mode): copy your **Publishable
key** and **Secret key**. You'll create a **webhook** in Phase F once you have a public URL.

**D.2 🤖 Add the pay-what-you-can donation flow.**

> **PROMPT ▸ Donations (Stripe)**
> "Add a live donation feature to the `web/` app using **Stripe Checkout**. Put a button in the
> site header/footer that reads exactly: **'Enjoying this website? Feel free to pay what you can
> afford.'** Clicking it goes to `/donate`, where the visitor enters **any amount** (a
> custom-amount Checkout Session — use Stripe's `custom_unit_amount` / a one-time price with a
> donor-entered amount), then is redirected to Stripe's hosted payment page, and on success
> returns to `/donate/thanks`. Add an API route to create the Checkout Session and a Stripe
> **webhook** route (`/api/stripe/webhook`) that records completed donations into a new
> `donations` table (id, stripe_session_id, amount_cents, currency, email, created_at) in the
> Postgres store. Read `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and
> `STRIPE_WEBHOOK_SECRET` from env. This must work for anonymous visitors too (no sign-in
> required to donate). Never store card data — Stripe hosts the payment page."

**D.3 🤖 Add the premium preview (disabled).**

> **PROMPT ▸ Premium preview (not live)**
> "Add a `/premium` page that previews three paid services — **code coaching, interview
> coaching, and resume coaching** — described as **$1/month**. Show a 'Subscribe' button, but
> when clicked it must **not** contact Stripe; instead it shows the message **'This is not
> currently ready.'** Add a `premium` boolean (default false) to the user model for future use,
> and a small 'Premium — coming soon' link in the nav. Do not implement any subscription/charge
> yet."

**D.4 ✅ Check it worked.** With Stripe in **Test mode**, run `npm run dev`, click the donation
button, enter an amount, and complete a payment using Stripe's test card `4242 4242 4242 4242`
(any future expiry, any CVC). Confirm you reach `/donate/thanks`. Confirm the premium
'Subscribe' button shows "This is not currently ready."

---

## Phase E — Help / customer-service email

**E.1 🌐 Set up a support mailbox with Cloudflare Email Routing (free).**
- In Cloudflare, add your domain (Phase 0.2) and let it manage DNS.
- Open **Email → Email Routing**, enable it, and create a rule:
  `support@yourdomain.com` **forwards to** your personal Gmail (or similar). Verify your
  personal address when prompted. (This is free and needs no mailbox hosting.)

**E.2 🤖 Add the Help link.**

> **PROMPT ▸ Help link**
> "Add a 'Help / Troubleshoot' link in the site header and footer (visible to everyone,
> signed in or not) that opens the visitor's email client via a `mailto:` link to
> `support@yourdomain.com` with a helpful pre-filled subject like 'Help with PrepSite' and a
> short pre-filled body template. Read the support address from a `SUPPORT_EMAIL` env variable
> so it's easy to change."

**E.3 ✅ Check it worked.** Click the Help link — your email app should open pre-addressed.
Send a test message to `support@yourdomain.com` and confirm it lands in your personal inbox.

---

## Phase F — Deploy to the Oracle VM and go live

This is where the site becomes public. You'll run the app's existing containers on your Oracle
Always-Free VM (the one running the LLM), put Caddy in front for automatic HTTPS, point your
domain at it, and set the real keys.

**F.1 🌐 Make sure you have an Oracle Always-Free VM.** In Oracle Cloud, you want an **Ampere
A1** compute instance (the free tier gives up to 4 cores / 24 GB RAM). If your LLM already runs
on one, reuse it. Note its **public IP address**. In the VM's network security settings, allow
inbound **TCP 80 and 443**.

**F.2 🖥️ Get the code and secrets onto the VM.** SSH into the VM and:
- `git clone <your repo URL>` (or pull the latest).
- `cd` into the repo. Create the production secrets file (git-ignored — never commit it). The
  repo already ignores `secrets/*.env`. Fill in every value:

```
# secrets/prod.env  (on the VM only — do NOT commit)
DATABASE_URL=postgres://jobprep:<db-password>@db:5432/jobprep
AUTH_SECRET=<run: openssl rand -base64 32>
AUTH_ADMIN_EMAILS=you@yourdomain.com
STORE=pg
CONTENT=db
QUEUE=db
SANDBOX=http
SANDBOX_URL=http://sandbox:4500
# LLM (already running on this box)
LLAMA_BASE_URL=http://<llm-host-or-container>:8080/v1
LLAMA_API_KEY=<your Oracle LLM key>
MODEL_CONFIG_PATH=/app/model_configuration.yaml
# Email (Resend)
RESEND_API_KEY=<from Resend>
EMAIL_FROM=verify@yourdomain.com
# Support + payments
SUPPORT_EMAIL=support@yourdomain.com
STRIPE_SECRET_KEY=<Stripe live secret when ready; test key until then>
STRIPE_PUBLISHABLE_KEY=<Stripe publishable>
STRIPE_WEBHOOK_SECRET=<from step F.6>
NEXTAUTH_URL=https://yourdomain.com
```

> **PROMPT ▸ Deployment doublecheck** (run in Claude Code before deploying)
> "Review `docker-compose.prod.yml`, `DEPLOY.md`, and the Dockerfiles. Produce the exact list
> of environment variables each service (`web`, `worker`, `sandbox`, `db`) needs for a
> single-VM deploy, confirm the new features (magic-link email, Stripe donations, support
> email) read their keys from env, and tell me precisely which values from `secrets/prod.env`
> map to which service. Flag anything missing."

**F.3 🌐 Point your domain at the VM.** In Cloudflare DNS, add an **A record**:
`yourdomain.com` → your VM's public IP (and a `www` CNAME to `yourdomain.com`). Leave proxy
either on or off per Caddy guidance below.

**F.4 🤖 Add Caddy for automatic HTTPS.**

> **PROMPT ▸ Caddy HTTPS front door**
> "Add a `caddy` service to `docker-compose.prod.yml` that acts as the public reverse proxy on
> ports 80 and 443, terminating HTTPS automatically via Let's Encrypt, and forwarding
> `yourdomain.com` to the `web` service on port 3000. Provide the `Caddyfile`. The `web`
> service should no longer be exposed publicly except through Caddy. Keep `worker`, `sandbox`,
> and `db` internal-only (no public ports)."

**F.5 🖥️ Start everything.** On the VM:
- `docker compose -f docker-compose.prod.yml --env-file secrets/prod.env up -d --build`
- Apply the database schema (first time): run the migration/`db:push` against the running
  `db` (see `DEPLOY.md`; do it once).
- Import the lesson content into Postgres (the `content_topics` projection): run the content
  import step from `HOSTING.md` / `DEPLOY.md` so the site serves topics from the DB.
- 🖥️ `docker compose -f docker-compose.prod.yml ps` — confirm `web`, `worker`, `sandbox`,
  `db`, and `caddy` are all "Up."

**F.6 🌐 Finish Stripe for production.** In Stripe → Developers → **Webhooks**, add an endpoint
`https://yourdomain.com/api/stripe/webhook`, subscribe to `checkout.session.completed`, and
copy the **signing secret** into `STRIPE_WEBHOOK_SECRET` in `secrets/prod.env`; restart the
`web` service. When you're ready to take real money, switch Stripe from **Test** to **Live**
and swap in the live keys.

**F.7 🌐 Verify your sending domain in Resend.** In Resend, add `yourdomain.com` and copy the
DNS records it gives you (SPF/DKIM) into Cloudflare DNS. This makes verification emails land in
inboxes, not spam. Set `EMAIL_FROM` to an address on your domain (e.g. `verify@yourdomain.com`).

---

## Phase G — Launch smoke test (do all of these on the live URL)

Open `https://yourdomain.com` and confirm, in order:

1. ✅ **Anonymous:** the padlock (HTTPS) shows; you see **all topics with descriptions**; the
   **sample lesson** plays; clicking a real topic sends you to sign-up.
2. ✅ **Register:** enter your email at `/signup`; the verification email **arrives** (check the
   inbox, then spam); clicking the link shows **"You're verified"** and signs you in.
3. ✅ **Troubleshoot:** `/help/signup` loads and the "Resend link" button works.
4. ✅ **Full lessons:** as the signed-in user, complete a real lesson with an **essay or code**
   step and confirm it is **graded by the Oracle LLM** and progress saves.
5. ✅ **Donation:** click "**pay what you can afford**," enter an amount, pay (Stripe test card
   first, then a real small amount once Live), land on the thank-you page, and see it in the
   Stripe dashboard.
6. ✅ **Premium:** `/premium` shows the three services at $1/mo and the Subscribe button says
   **"This is not currently ready."**
7. ✅ **Help:** the Help link opens a pre-addressed email; a test message reaches your inbox.

When all seven pass, **you are live.**

---

## Phase H — Later: turn premium ON (not part of launch)

When you're ready to sell the $1/month coaching services:

> **PROMPT ▸ Enable premium (future)**
> "Implement the $1/month premium subscription with Stripe: a real Checkout subscription for
> code/interview/resume coaching, a webhook that flips the user's `premium` flag on
> payment/cancellation, server-side entitlement checks that gate the premium features, and
> replace the 'This is not currently ready' message with the real subscribe flow. Add a billing
> page where a subscriber can cancel. Keep donations working as they are."

Then build the actual coaching features behind the `premium` gate.

---

## Quick reference — which service does what

| Job | Service | Where you set it |
| --- | --- | --- |
| Runs the whole app (web, worker, sandbox, DB, LLM) | **Oracle Always-Free VM** | `docker-compose.prod.yml` on the VM |
| Free HTTPS | **Caddy** | `caddy` service + `Caddyfile` |
| Domain + DNS + support email forwarding | **Cloudflare** | Cloudflare dashboard |
| Sends verification emails | **Resend** | `RESEND_API_KEY`, `EMAIL_FROM` |
| Donations (and later premium) | **Stripe** | `STRIPE_*` keys + webhook |
| The lesson grader (already yours) | **Oracle-hosted Llama-3.1-8B** | `LLAMA_BASE_URL`, `LLAMA_API_KEY` |

If you get stuck on any step, paste the error into Claude Code in this repo and ask it to
diagnose — it can read the code, the Docker files, and these documents.
