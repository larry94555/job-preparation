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

> **⚠️ Save your work as you go (important).** Phases A–E generate new code on your **local
> computer**. Phase F copies the code onto the server with `git`. So after each phase that
> passes its checkpoint, **commit and push** your changes:
> `git add -A && git commit -m "add <feature>" && git push`.
> If you skip this, the server will not have the pages you generated. When in doubt, ask
> Claude Code: "commit and push my changes with a clear message."

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
> `currentUserId()` helper (`web/lib/session.ts`) to detect sign-in. Make the public pages
> **mobile-responsive** (they are many visitors' first impression). Keep the existing signed-in
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
send from Resend's test sender (`onboarding@resend.dev`) — **note it can only deliver to the
email address you signed up to Resend with**, which is fine for testing your own sign-up. In
Phase F you'll verify your own domain so anyone's inbox can receive the link.

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

**B.4 ✅ Check it worked.** 🖥️ set `STORE=pg`, `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`,
`AUTH_SECRET` in a local `.env` (see `.env.example` — `STORE=pg` makes the app actually use
the Postgres you just started), run `npm run dev`, go to `/signup`,
enter a real email, and confirm the link arrives and signs you in. Try `/help/signup` and the
"Resend link" button.

**B.5 🌐 (Optional, recommended) One-click Google sign-in.** Magic-link asks for an email every
time. The app **already supports Google sign-in** — just create a Google OAuth client (Google
Cloud Console → OAuth credentials), then set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in your
env. A "Continue with Google" button appears automatically. No code change needed.

---

## Phase C — Confirm the full signed-in experience

Almost nothing to build here — the app already scopes everything per user. You're verifying
the unlock.

**C.1 ✅ Signed-in smoke test.** While signed in (from B.4), open a **real** topic, play a
lesson that includes an essay or code step, and confirm you get a grade. (Grading needs the
LLM — locally you can point at your Oracle LLM by setting `LLM_BASE_URL` and the secrets, or
just confirm the request is made and defer full grading to the deployed environment in
Phase F.) Confirm your progress persists after signing out and back in.

If anything about grading looks off, use:
> **PROMPT ▸ Grading wiring check**
> "Trace how a signed-in user's essay/code answer flows from the web `/api/apply` route through
> the grading worker to the Oracle LLM, and list exactly which environment variables the
> **worker** needs (LLM_BASE_URL, LLM_API_KEY, MODEL_CONFIG_PATH, SANDBOX_URL, DATABASE_URL,
> QUEUE) and where each is set. Confirm the browser never sees the LLM key."

---

## Phase D — Donations (live) and the premium preview

**D.1 🌐 Get your Stripe test secret key.** You only need the **Secret key** in **Test mode** (the
app redirects to Stripe's hosted page, so it doesn't use the publishable key). Test mode works
immediately — you do **not** need to finish business "activation" first. Steps:

1. Sign in at **https://dashboard.stripe.com**.
2. Turn on **Test mode**: flip the **Test mode** toggle at the **top-right** of the dashboard.
   When it's on, the page shows a "Test mode" indicator and the URL contains `/test/`. (Test-mode
   charges are fake — use the card `4242 4242 4242 4242` later.)
3. Open the API keys page. Either:
   - go directly to **https://dashboard.stripe.com/test/apikeys**, **or**
   - click **Developers** (top-right) → **API keys**, **or** type "API keys" in the dashboard search.
4. Under **Standard keys** you'll see a **Secret key** that reads `sk_test_••••••••` (hidden). Click
   **Reveal test key**, then copy the full value — it starts with **`sk_test_`**.
5. Paste that value into **`STRIPE_SECRET_KEY`** in `secrets/prod.env`. Treat it like a password
   (don't commit or share it — `secrets/prod.env` is already gitignored).

*(Stripe's own reference, if you want it: their docs page "API keys" at **https://docs.stripe.com/keys**
explains test vs. live keys.)* The **webhook secret** (`STRIPE_WEBHOOK_SECRET`) is created later, in
step **F.6**, once the site has a public URL — leave it blank for now.

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
> `STRIPE_WEBHOOK_SECRET` from env. Enforce a **minimum of $1** on the amount (Stripe's
> per-payment fee is ~30¢, so smaller tips mostly go to fees) and suggest a few preset amounts
> ($3 / $5 / $10) alongside the custom field. This must work for anonymous visitors too (no
> sign-in required to donate). Never store card data — Stripe hosts the payment page."

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

**E.4 🤖 Add a Privacy Policy and Terms page.** Because you collect an email address and accept
payments, you need these two short pages — Stripe also expects a link to your terms.

> **PROMPT ▸ Privacy & terms**
> "Add two simple, plain-English pages: `/privacy` and `/terms`, linked in the site footer.
> Privacy should state what is collected (an email address for sign-in; donation records via
> Stripe; lesson progress), that no card data is stored (Stripe handles payments), how to
> request deletion (email support), and that verification emails are sent via Resend. Terms
> should state the service is provided as-is for educational use, donations are voluntary and
> non-refundable, and premium is not yet available. Keep both concise and readable; add a
> 'last updated' date. These are starter templates — advise me to have a professional review
> them before serious use."

✅ **Check:** `/privacy` and `/terms` load and are linked in the footer.

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
- **Install Node.js 22 first.** The app's setup commands (and the secrets generator) need it, and
  the distro's *default* Node is too old — an old Node is exactly what produces a
  `TypeError: Unknown encoding: base64url` (or similar) error. Do **not** use `apt install nodejs`
  by itself. Install Node 22 for your VM's operating system:
  - **Ubuntu / Debian** (Oracle "Canonical Ubuntu" image — your prompt shows `/home/ubuntu`):
    🖥️ `curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs`
  - **Oracle Linux / RHEL** (Oracle's default image):
    🖥️ `curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash - && sudo dnf install -y nodejs`
  - **No `sudo`? Use nvm** (installs Node just for your user, no root needed):
    🖥️ `curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`, then open a
    **new** shell and run `nvm install 22`.
  Verify: 🖥️ `node --version` must print **v22.x** (not v12/v18). Also make sure `git` is installed
  (`sudo apt-get install -y git` or `sudo dnf install -y git`).
  *(Tip: on Ubuntu, `sudo apt install nodejs` gives an ancient Node 12 — that's the trap. The nvm
  option above avoids it and is the most reliable.)*
- **Install Docker** (the app runs as containers). Do **not** use `snap install docker`,
  `apt install docker.io`, or `podman-docker` — use **Docker's official repo**, which includes the
  `docker compose` plugin this runbook uses. On **Ubuntu**:

  ```
  sudo apt-get update && sudo apt-get install -y ca-certificates curl
  sudo install -m 0755 -d /etc/apt/keyrings
  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  sudo chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker $USER   # then LOG OUT of SSH and back in (or run: newgrp docker)
  ```

  Verify: 🖥️ `docker compose version` and `docker run hello-world`. ⚠️ If Docker says
  `permission denied … /var/run/docker.sock`, you skipped the **log out / back in** after
  `usermod` — that group change only takes effect in a new login session. *(On Oracle Linux
  instead, follow docs.docker.com → "Install Docker Engine on RHEL".)*
- `git clone <your repo URL>` (or `git pull` if already cloned). **This must include all the
  features you generated in Phases A–E** — so make sure you committed and pushed them (see the
  "Save your work as you go" note near the top). Confirm with `git log --oneline -5` that your
  feature commits are present.
- `cd` into the repo, then **generate the random secrets and create the file in one command**:
  🖥️ `node utils/gen-secrets.mjs --write`
  This creates `secrets/prod.env` from the template (git-ignored — never committed) and fills in
  the three values you'd otherwise have to invent — **`POSTGRES_PASSWORD`, `DATABASE_URL` (built
  with that same password so they can't mismatch), and `AUTH_SECRET`** — then prints a reminder of
  what's left. Now open `secrets/prod.env` and add the remaining values using the checklist below.
  (The `STORE`/`CONTENT`/`QUEUE`/`SANDBOX` settings are hard-wired in the compose file — they are
  **not** in this file, so there's nothing to set for them.)

#### Secrets checklist — what to set at this stage, and where each value comes from

| Variable | Required? | Where the value comes from |
| --- | --- | --- |
| `POSTGRES_PASSWORD` | ✅ **Required** | **Auto-generated** by `node utils/gen-secrets.mjs --write` — nothing to invent or write down. |
| `DATABASE_URL` | ✅ **Required** | **Auto-generated** by the same tool, already built with the matching password. |
| `AUTH_SECRET` | ✅ **Required** | **Auto-generated** by the same tool (no need to run `openssl`). |
| `AUTH_URL` | ✅ **Required** | **You set it** to your site URL. No domain yet? Use `http://<VM-PUBLIC-IP>:3000`. With a domain later: `https://yourdomain.com`. |
| `LLM_BASE_URL` | ✅ **Required** | **You set it** to where your Oracle llama-server listens: `http://<VM-IP>:8080/v1`. |
| `LLM_API_KEY` | ✅ **Required** | **You already have this** — the key your Oracle `llama-server --api-key` uses (it's in your existing `secrets/secrets.env`; or make one with `node utils/gen-api-key.mjs`). |
| `RESEND_API_KEY` | ✅ **Required to register** | **Copy from Resend**: dashboard → **API Keys → Create**. (Needed even for testing — the deployed app has no dev sign-in.) |
| `AUTH_ADMIN_EMAILS` | ⬜ Optional | **Your own email**, to give yourself the admin role. |
| `SUPPORT_EMAIL` | ⬜ Recommended | **Any inbox that receives email** — the Help link opens a mailto to it (never used to send). **Your Gmail works now**; switch to `support@yourdomain.com` (Cloudflare Email Routing, E.1) after you pick a domain. |
| `STRIPE_SECRET_KEY` | ⬜ Optional (donations) | The `sk_test_…` key from Stripe → **Developers → API keys** in **Test mode** — see the detailed walkthrough in **step D.1**. |
| `STRIPE_WEBHOOK_SECRET` | ⬜ Optional, set **later** | **Copy from Stripe in step F.6**, after you create the webhook. Leave blank for now. |
| `EMAIL_FROM` | ⬜ Has a default | Leave `onboarding@resend.dev` for testing; switch to your verified-domain sender later (step F.7). |
| `AUTH_GOOGLE_*` / `AUTH_GITHUB_*` | ⬜ Optional | One-click OAuth credentials from Google Cloud / GitHub. Leave blank to skip. |
| `DEPLOY_ENV`, `MODEL_CONFIG_PATH`, `LLM_TIMEOUT_MS` | — pre-filled | Leave the template's defaults as-is — these aren't secrets. |

**Minimum to get a testable site up (no domain, no donations):** the **seven ✅ rows** —
`POSTGRES_PASSWORD`, `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `LLM_BASE_URL`, `LLM_API_KEY`,
and `RESEND_API_KEY`. Add `STRIPE_SECRET_KEY` + `SUPPORT_EMAIL` when you want donations and the
Help link working.

> **PROMPT ▸ Deployment doublecheck** (optional sanity check in Claude Code before deploying)
> "Verify `docker-compose.prod.yml` passes every value from `secrets/prod.env` to the right
> service: the `worker` gets `LLM_BASE_URL`/`LLM_API_KEY`/`MODEL_CONFIG_PATH`, the `web` tier
> gets the auth/email/Stripe vars, and the `db` port is bound to `127.0.0.1` only. Show me the
> final variable→service mapping and flag anything missing or misrouted."

> **⚠️ No domain yet? Skip F.3 AND F.4.** These two steps are only for a domain + HTTPS. Without a
> domain you run plain **HTTP** and reach the site at **`http://<VM-PUBLIC-IP>:3000`** (the `web`
> container publishes port 3000; HTTPS via Let's Encrypt needs a real hostname, so it can't work on
> a bare IP). To make that URL reachable you must **open port 3000 in two places**:
> - **Oracle Cloud** → your VM's VCN **Security List** (or NSG): add an ingress rule **TCP 3000,
>   source `0.0.0.0/0`**.
> - **The VM's own firewall:** Ubuntu → `sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT`
>   (then `sudo apt install -y iptables-persistent` to save); Oracle Linux →
>   `sudo firewall-cmd --add-port=3000/tcp --permanent && sudo firewall-cmd --reload`.
>
> Set `AUTH_URL=http://<VM-PUBLIC-IP>:3000`. Magic-link sign-in, lessons, and grading all work over
> HTTP; only live donation **webhooks** wait for a domain (donations are optional to test). Come
> back and do F.3 + F.4 when you pick a domain, then switch `AUTH_URL` to `https://yourdomain.com`.

**F.3 🌐 Point your domain at the VM.** In Cloudflare DNS, add an **A record**:
`yourdomain.com` → your VM's public IP (and a `www` CNAME to `yourdomain.com`). **Important:**
set these records to **"DNS only" (the grey cloud), not "Proxied" (orange cloud)** — Caddy
needs direct traffic to obtain its Let's Encrypt certificate. (You can experiment with the
proxy later, after HTTPS works; it is not needed for launch.)

**F.4 🤖 Add Caddy for automatic HTTPS.**

> **PROMPT ▸ Caddy HTTPS front door**
> "Add a `caddy` service to `docker-compose.prod.yml` that acts as the public reverse proxy on
> ports 80 and 443, terminating HTTPS automatically via Let's Encrypt, and forwarding
> `yourdomain.com` to the `web` service on port 3000. Provide the `Caddyfile`. The `web`
> service should no longer be exposed publicly except through Caddy. Keep `worker`, `sandbox`,
> and `db` internal-only (no public ports)."

**How the database gets set up (read this first).** You don't install Postgres separately — the
stack does it for you. The `db` container in `docker-compose.prod.yml` **creates the database the
first time it starts**, using the `POSTGRES_PASSWORD` you chose in `secrets/prod.env`. So the
lifecycle is: (1) you *invent* a DB password in `prod.env`; (2) `docker compose up` starts the
container, which *provisions* an empty database with that password; (3) `db:push` *creates the
tables*; (4) `db:import` *loads the lessons*. That's the whole database setup — no separate install.
(If you'd rather use a managed database, point `DATABASE_URL` at it, delete `POSTGRES_PASSWORD`,
and skip straight to `db:push`/`db:import` against that URL.)

**F.5 🖥️ Start everything.** On the VM:
- One-time: run `npm install` in the repo folder (Node 22 is already installed from F.2) — the two
  database setup commands below run on the VM directly, not inside Docker.
  > **⚠️ Ignore the `npm audit` warnings — and NEVER run `npm audit fix --force`.** npm prints a
  > vulnerability count and *suggests* `--force`, but that installs **breaking** changes (it will
  > happily downgrade Next.js by six major versions) and will break your build. The warnings are in
  > build tooling, not the running site — safe to ignore. If one genuinely worries you, ask before
  > acting; the plain `npm audit fix` (no `--force`) is safe but usually does nothing here. If you
  > already ran `--force` and things broke: `git checkout -- .` then `npm ci` restores a good state.
- `docker compose -f docker-compose.prod.yml --env-file secrets/prod.env up -d --build`
  — this **creates the database** (empty) among the other containers, using your `POSTGRES_PASSWORD`.
- Apply the database schema (first time only). The database runs inside Docker and (after the
  doublecheck prompt in F.2) is reachable from the VM shell at `localhost:5432`, so:
  🖥️ `DATABASE_URL=postgres://jobprep:<same-db-password>@localhost:5432/jobprep npm run db:push`
  (creates all tables, including the auth tables from Phase B).
- Import the lesson content into Postgres (the `content_topics` projection) so the site
  serves topics from the DB:
  🖥️ `CONTENT=db DATABASE_URL=postgres://jobprep:<same-db-password>@localhost:5432/jobprep npm run db:import`
  This is idempotent — safe to re-run after content changes.
- Restart the app tiers so they see the freshly created tables:
  🖥️ `docker compose -f docker-compose.prod.yml --env-file secrets/prod.env restart web worker`
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

### Common problems (troubleshooting)

| What you see | Likely cause → fix |
| --- | --- |
| `TypeError: Unknown encoding: base64url`, `EBADENGINE Unsupported engine`, or odd `npm` errors | **Node is too old.** `node --version` must be **v22.x**. Ubuntu's `apt install nodejs` installs Node **12** — install Node 22 via nvm (F.2). |
| `npm ci` fails with `ENOTEMPTY` / rename errors | A half-finished `node_modules` (often after an old Node or a bad `--force`). Wipe and reinstall on Node 22: `find . -type d -name node_modules -prune -exec rm -rf {} +` then `npm ci`. |
| You ran `npm audit fix --force` and the build broke | It installs breaking downgrades. Recover: `git checkout -- .` then `npm ci`. **Never run `--force`.** |
| `docker: command not found` | Docker isn't installed. Use **Docker's official repo** (F.2) — not `snap`, `docker.io`, or `podman-docker`. |
| `permission denied … /var/run/docker.sock` | Your user isn't in the `docker` group **in this session**. `sudo usermod -aG docker $USER`, then **log out of SSH and back in** (or `newgrp docker`). |
| A container `exited (127)` / "dependency failed to start" | Its start command wasn't found. Read the logs: `docker compose -f docker-compose.prod.yml logs <service>` (e.g. `sandbox`, `worker`). Make sure you `git pull`ed the latest images. |
| Browser can't reach `http://<VM-IP>:3000` | Port 3000 isn't open. Open it in **both** the Oracle **Security List** *and* the VM firewall — see the "No domain yet?" box before F.3. |
| The verification email never arrives | Resend's test sender only delivers to **your own Resend-account email**; check spam; confirm `RESEND_API_KEY` is set. Delivery to anyone's inbox needs a verified domain (F.7). |
| Sign-in or the app errors about the database | `POSTGRES_PASSWORD` and the password inside `DATABASE_URL` must match (the generator ensures this). Host is `db` inside Docker, but `localhost:5432` for the VM-shell setup commands. |
| Essays/code never grade (or time out) | `docker compose logs worker`. The worker needs `LLM_API_KEY` and `LLM_BASE_URL` = the **VM's IP** (`http://<VM-IP>:8080/v1`), **not** `localhost` — llama-server runs outside Docker. |
| Donations show "not configured" | `STRIPE_SECRET_KEY` isn't set — it's optional; donations stay off until you add it (D.1). |

**Handy commands** (run from the repo folder on the VM):
```
docker compose -f docker-compose.prod.yml ps                 # container status
docker compose -f docker-compose.prod.yml logs -f <service>  # follow a service's logs (web/worker/sandbox/db)
docker compose -f docker-compose.prod.yml restart <service>  # restart one service
docker compose -f docker-compose.prod.yml down               # stop everything (data volume is kept)
```

When you're truly stuck, paste the failing command + its error (and the relevant `logs` output) into Claude Code in this repo — it can read the code, Dockerfiles, and this runbook to diagnose.

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

## Phase H — Keep it running (updates, backups, monitoring)

Small, mostly one-time setup that protects you after launch.

**H.1 🖥️ Deploying an update later.** When you (or Claude Code) change the site: commit and
push locally, then on the VM run `git pull` and
`docker compose -f docker-compose.prod.yml --env-file secrets/prod.env up -d --build`. If you
changed the database shape, run `npm run db:push` once; if you changed lesson content, run
`CONTENT=db npm run db:import`.

**H.2 🖥️ Back up the database (do this — it holds your users and donations).** Add a daily
`pg_dump` of the `db` container to a file, e.g. a cron job running:
`docker compose -f docker-compose.prod.yml exec -T db pg_dump -U jobprep jobprep > ~/backups/jobprep-$(date +%F).sql`
Copy those backups somewhere off the VM (e.g. Cloudflare R2 free tier or your own storage)
so a lost VM doesn't lose your data. Ask Claude Code to "set up the daily backup cron job
from Phase H.2" if you want it done for you.

**H.3 🌐 Uptime monitoring (free).** Create a free **UptimeRobot** monitor that pings
`https://yourdomain.com` every few minutes and emails you if it goes down. Add a lightweight
health check first if you like:
> **PROMPT ▸ Health check**
> "Add a public `/api/health` route that returns 200 and a small JSON `{status:'ok'}` when the
> app and database are reachable, so an uptime monitor can watch it."

**H.4 🖥️ Watch logs when something's wrong.**
`docker compose -f docker-compose.prod.yml logs -f web` (or `worker`, `sandbox`, `db`). Paste
errors into Claude Code in the repo to diagnose.

---

## Phase I — Later: turn premium ON (not part of launch)

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
| The lesson grader (already yours) | **Oracle-hosted Llama-3.1-8B** | `LLM_BASE_URL`, `LLM_API_KEY` |

If you get stuck on any step, paste the error into Claude Code in this repo and ask it to
diagnose — it can read the code, the Docker files, and these documents.
