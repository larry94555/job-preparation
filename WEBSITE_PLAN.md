# Website Plan — Public Launch of the Interview-Prep Learning Site

**Purpose.** Turn the existing local/hosted-ready codebase into a complete, public
"starter" website: anonymous visitors can browse everything and try one sample lesson;
registered (free) users get the full lesson set; a preview of paid premium services and a
live "pay what you can" donation button are shown; help/customer-service email is wired.

This document is the **what and why**. Its companion, [WEBSITE_STEP_BY_STEP.md](WEBSITE_STEP_BY_STEP.md),
is the **how** — a numbered runbook (including the exact AI prompts to generate each piece)
that a smart, less-technical person can follow to get the site live.

---

## 1. What already exists (do not rebuild)

The repo is already architected for a multi-user hosted deployment. Reuse it.

| Capability | Where | Status |
| --- | --- | --- |
| Lesson engine, 35 topics, questions, exercises | `topics/`, `packages/engine`, `packages/lesson` | ✅ Done |
| LLM grading (essays/code) against the **Oracle-hosted Llama-3.1-8B** | `packages/evaluator`, `packages/grading` | ✅ Done + certified |
| Python code execution sandbox (isolated `HttpRunner`) | `packages/sandbox`, `services/sandbox` | ✅ Done |
| Postgres data model (`users`, `lesson_progress`, `content_topics`, `grading_jobs`) | `packages/store` | ✅ Done |
| Next.js 15 web app (home, lesson runner, practice, analytics) | `web/` | ✅ Done |
| Auth (NextAuth v5 / Auth.js) | `web/auth.ts`, `web/middleware.ts` | ⚠️ Dev-stub only |
| **4-tier Docker Compose production stack** (`web` + `db` + `worker` + `sandbox`) | `docker-compose.prod.yml`, `DEPLOY.md` | ✅ Done |

**Key implication:** the app is a **server application** (background worker + code
sandbox + Postgres), not a serverless site. It is meant to run as Docker containers on a
Linux host. This is why the hosting recommendation below is a **VM you control**, not a
serverless platform like Vercel (which cannot run the worker or execute untrusted Python).

---

## 2. What is new (the work this plan covers)

Six new pieces, all additive to the existing app:

1. **Public / anonymous experience + access gating** — today `web/middleware.ts` forces
   *everyone* to sign in. Change it so anonymous visitors can: see the full topic catalog
   with a description/explanation of each topic, play **one** designated sample lesson,
   reach the sign-up and sign-up-troubleshooting pages, and use the help link. Everything
   else (real lesson runner, practice, LLM grading, premium) stays behind sign-in.
2. **Real registration with email verification** — replace the no-password dev stub with a
   passwordless **magic-link** sign-up: the visitor enters an email, receives a verification
   link, clicks it (that *is* the verification), and lands confirmed and signed in. Add a
   "check your email" confirmation page and a sign-up **troubleshooting** page.
3. **Full signed-in experience** — once verified, the user gets the existing full site
   (all 35 topics, LLM-graded essays/code, progress, practice). This mostly falls out of
   #1 + #2 because the app already scopes everything per user.
4. **Premium preview (not yet live)** — a pricing/premium page previewing code coaching,
   interview coaching, and resume coaching at **$1/month**. The "Subscribe" button shows
   **"This is not currently ready"** — no charge is taken. The payment plumbing for it is
   scaffolded but disabled.
5. **Live donations** — a "**Enjoying this website? Feel free to pay what you can afford**"
   button that takes a **donor-chosen amount** through the cheapest payment processor and
   works from day one.
6. **Help / customer-service email** — a "Help / Troubleshoot" link that opens the visitor's
   email app addressed to your support mailbox. Requires setting up that mailbox.

---

## 3. Architecture (target)

Everything runs as containers on **one Oracle Cloud "Always Free" VM** — the same box
already serving the LLM, so grading never leaves the machine.

```
                         Internet (HTTPS)
                              │
                     ┌────────▼─────────┐
                     │  Caddy (reverse  │  automatic Let's Encrypt TLS
                     │  proxy, :443)    │  yourdomain.com → web:3000
                     └────────┬─────────┘
                              │
        ┌─────────────────────┼───────────────────────────────┐
        │                     │                                │
 ┌──────▼──────┐      ┌───────▼───────┐      ┌────────▼────────┐   ┌──────────────┐
 │ web (Next.js│      │ worker        │      │ sandbox         │   │ llama-server │
 │ app :3000)  │◄────►│ (drains       │◄────►│ (runs Python    │   │ (Oracle LLM, │
 │ auth, pages │      │ grading_jobs) │      │ exercises)      │   │ already up)  │
 └──────┬──────┘      └───────┬───────┘      └─────────────────┘   └──────▲───────┘
        │                     │                                            │
        │              ┌──────▼──────┐         worker calls the LLM ───────┘
        └─────────────►│ Postgres db │
                       │ (users,     │
                       │ progress,   │
                       │ content,    │
                       │ jobs)       │
                       └─────────────┘

 External managed services (all free tier):
   • Resend        → sends the magic-link verification emails
   • Stripe        → donations now; premium subscriptions later
   • Cloudflare    → domain DNS + free email forwarding (support@ → your Gmail)
```

**Why this shape:**
- The app is already this exact 4-tier stack (see `DEPLOY.md`). We add only **Caddy**
  (free HTTPS) in front and point the containers at managed services for email/payments.
- Co-locating with the LLM means zero network egress cost and lowest grading latency.
- Oracle "Always Free" (Ampere A1: up to 4 cores / 24 GB RAM, free **forever**, commercial
  use allowed) comfortably runs all of this for low traffic at **$0/month**.

---

## 4. Feature detail & acceptance criteria

### 4.1 Anonymous visitor
- **Sees:** the full topic catalog (all 35), each with title + description/explanation; a
  clear "Free — create an account to unlock every lesson" banner; the one sample lesson;
  a Sign-up button; a Help link.
- **Can do:** play the **sample lesson** end-to-end (uses only deterministic multiple-choice
  / fill-in checks — **no LLM grading**, so anonymous usage costs nothing and can't be
  abused); register; open sign-up troubleshooting; email support.
- **Cannot do:** open any real topic's lesson runner, submit essays/code for LLM grading,
  use practice mode, or access premium. Those controls are visible but prompt sign-up.
- **Acceptance:** with no session, `/` and `/topics` render the full catalog; the sample
  topic plays; clicking "Start" on any non-sample topic routes to `/signup`; `/lesson/<real>`
  and grading APIs return a redirect/401.

### 4.2 Registration + email verification (magic link)
- Visitor enters an email on `/signup` → receives an email with a one-time link →
  clicking it verifies the address and signs them in → lands on a "You're verified 🎉"
  confirmation. No password to choose or store.
- **Troubleshooting page** (`/help/signup`) covers: didn't get the email (check spam,
  resend), link expired (request a new one), wrong email (start over), still stuck (email
  support). A **Resend link** button is included.
- **Acceptance:** a real inbox receives the link within ~1 minute; clicking it creates the
  user row, marks the email verified, and starts a session; an expired/again-clicked link
  shows a friendly "request a new link" message, not an error page.

### 4.3 Full signed-in experience
- All 35 topics playable; essays/code graded by the Oracle LLM; progress saved per user;
  practice mode available. (Already built; unlocked by #1 + #2.)
- **Acceptance:** a verified user completes a lesson that includes an essay, receives an
  LLM grade, and sees progress persist across sign-out/in.

### 4.4 Premium preview (disabled)
- `/premium` previews three services — **code coaching, interview coaching, resume
  coaching** — at **$1/month**. The CTA button shows **"This is not currently ready"** and
  takes no payment. A `premium` entitlement flag exists on the user model for later.
- **Acceptance:** clicking Subscribe never reaches Stripe; it shows the "not ready" state.

### 4.5 Donations (live)
- A persistent "**Enjoying this website? Feel free to pay what you can afford**" button →
  a checkout where the **donor enters any amount** → pays by card → returns to a thank-you
  page. Donations are recorded.
- **Acceptance:** a real (or Stripe test-mode) donation of an arbitrary amount completes
  and shows the thank-you page; the payment appears in the Stripe dashboard.

### 4.6 Help / customer service
- A "Help / Troubleshoot" link in the header/footer opens the visitor's mail client to
  `support@yourdomain` with a helpful pre-filled subject. That mailbox forwards to your
  real inbox.
- **Acceptance:** clicking it opens a pre-addressed email; a message sent to it arrives in
  your personal inbox.

---

## 5. Hosting & services — the decision

**Recommended primary path (chosen for you): self-host the existing Docker stack on the
Oracle Cloud Always-Free VM, with managed free services for the few things a VM shouldn't
do (email delivery, card payments, DNS/email-forwarding).**

| Need | Service to use | Free tier | Approx cost |
| --- | --- | --- | --- |
| App + DB + worker + sandbox + LLM host | **Oracle Cloud Always Free VM** (Ampere A1) | Free forever, commercial OK | **$0** |
| HTTPS / reverse proxy | **Caddy** (container) | Free (auto Let's Encrypt) | **$0** |
| Domain name | **Cloudflare Registrar** (or Namecheap) | — | **~$10 / year** |
| DNS + support-email forwarding | **Cloudflare DNS + Email Routing** | Free | **$0** |
| Verification email delivery | **Resend** | 3,000 emails/mo, 100/day | **$0** |
| Donations (and later premium) | **Stripe** | No monthly fee | **2.9% + 30¢ per payment** |
| *(Zero-code donation alternative)* | **Ko-fi / Buy Me a Coffee** | Free | small cut per tip |

**Total fixed cost: ~$10/year (the domain).** Everything else is free at low traffic;
Stripe only takes a cut when someone actually pays.

**Why not Vercel/Netlify (serverless)?** They can host a Next.js front end but **cannot**
run the background grading worker or execute untrusted Python in the sandbox, both of which
this app requires. Using them would mean re-architecting core features. The Oracle VM runs
the app *as it is already built*.

**Managed alternative (if you never want to touch a server):** Railway or Render can run
the same Docker services with a managed Postgres (or Neon free Postgres), but neither is
truly free-forever (Render's free web service sleeps; Railway is ~$5/mo of credit). The
Oracle VM wins on cost and co-location with the LLM, so it is the primary recommendation.

**One consequential choice for you to confirm** (defaulted in the step-by-step):
- **Donations processor:** Stripe (in-site, reused later for premium) — recommended — vs.
  Ko-fi/Buy-Me-a-Coffee (a hosted link, zero code, fastest to launch). The step-by-step
  uses **Stripe** because premium later needs it anyway; swapping in a Ko-fi link is a
  10-minute change if you prefer.

---

## 6. Data-model additions

Small extensions to the existing Postgres schema (`packages/store`):

- **Auth.js tables** — adding the magic-link (Email) provider requires a database adapter
  and its standard tables: `accounts`, `sessions`, `verification_token` (and it uses the
  existing `users` table, extended with `email_verified`). Use `@auth/drizzle-adapter`
  over the existing Drizzle/Postgres setup. Reconcile the adapter's `users` shape with the
  current one (keep `id` = lowercased email as the stable progress key).
- **`entitlements`** (or a `premium boolean` + `premium_since` on `users`) — reserved for
  when premium goes live; unused at launch beyond defaulting to false.
- **`donations`** — `id`, `stripe_session_id`, `amount_cents`, `currency`, `email`
  (nullable), `created_at`. Written by the Stripe webhook.

No change to `lesson_progress`, `content_topics`, or `grading_jobs`.

---

## 7. Security, privacy & safety

- **No card data ever touches our servers.** Stripe Checkout is hosted by Stripe; we only
  store a payment reference and amount. (This also keeps us out of PCI scope.)
- **Secrets** (`AUTH_SECRET`, `DATABASE_URL`, `LLAMA_API_KEY`, `RESEND_API_KEY`,
  `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) live only in the VM's `.env` / a secrets
  file that is **git-ignored** (the repo already ignores `secrets/*.env`). Never commit them.
- **The Oracle LLM API key** stays server-side (worker only); browsers never see it.
- **Untrusted code** (learner Python) runs only in the `sandbox` container, which has no
  DB access and no secrets — this boundary already exists; preserve it.
- **Passwordless auth** avoids storing passwords entirely (a security win and it sidesteps
  password-handling risk). Email is verified by construction (you must click the link).
- **Anonymous abuse control:** the sample lesson uses only local, deterministic checks, so
  anonymous visitors cannot drive the (rate-limited, single-slot) LLM. Add basic rate
  limiting on auth email sends to prevent inbox spam.
- **Privacy:** collect only the email needed to sign in; publish a short privacy note and a
  terms note (linked in the footer). Donations are processed by Stripe under their terms.

---

## 8. Build phases (milestones)

1. **M1 — Public shell:** anonymous catalog + sample lesson + gating (`middleware.ts`,
   home page, sample route). *Site is browsable by anyone.*
2. **M2 — Real accounts:** magic-link registration, verification, confirmation +
   troubleshooting pages, DB adapter. *People can create free accounts.*
3. **M3 — Full experience unlocked:** verified users reach the whole app; LLM grading works
   against Oracle from the deployed worker. *The product works end-to-end.*
4. **M4 — Money:** live donations (Stripe) + premium preview ("not ready"). *Voluntary pay
   works; premium is previewed.*
5. **M5 — Help + polish:** support mailbox + Help link; privacy/terms footer; error states.
6. **M6 — Deploy & go live:** domain, Caddy HTTPS, `docker-compose.prod.yml` on Oracle,
   environment variables, smoke tests. *Public launch.*
7. **Later — Premium ON:** wire the Stripe $1/mo subscription and flip the entitlement.

---

## 9. Risks & open items

- **Email deliverability:** magic-link emails can land in spam without a verified sending
  domain. Verifying your domain in Resend (DNS records) fixes this — included in the runbook.
- **Oracle VM uptime/capacity:** the free VM is single-node; fine for low traffic. If the LLM
  and web contend for RAM, cap the model context or split onto a second free VM.
- **Adapter/`users` reconciliation:** wiring the Auth.js Drizzle adapter onto the existing
  `users` table needs care so the stable `id` (lowercased email) that progress is keyed by
  is preserved. Called out as an explicit step.
- **Premium later:** the subscription flow, entitlement checks, and coaching content are
  deliberately out of scope for launch (previewed only).

---

## 10. Definition of done (launch)

A stranger on the internet can: browse all topics with explanations; play the sample lesson;
create a free account via email and get verified; sign in and complete a real LLM-graded
lesson; see the premium preview and get the "not ready" message; make a pay-what-you-can
donation that succeeds; and click Help to email support — all over HTTPS on your domain, at
~$10/year total fixed cost.
