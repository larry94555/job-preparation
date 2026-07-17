#!/usr/bin/env node
// Verify SMTP sign-up email settings BEFORE rebuilding the app.
//
// Answers "are my SMTP_USER / SMTP_PASS / SMTP_HOST right?" without touching the
// web app: it reaches the relay, authenticates, and (optionally) sends a real
// test message — then translates the usual cryptic SMTP errors into the actual
// cause.
//
//   node utils/test-smtp.mjs                    # connect + authenticate only
//   node utils/test-smtp.mjs you@example.com    # …and send a test email
//
// Reads SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / EMAIL_FROM from the
// environment, falling back to secrets/prod.env (then secrets/secrets.env).

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createTransport } from "nodemailer";

/** Load KEY=value pairs from a file without overriding real env vars. Strips one
 *  layer of matching surrounding quotes, exactly as docker compose's --env-file
 *  parser (and utils/load-secrets.mjs) do — so a value quoted to survive special
 *  characters is read the SAME way here as by the deployed container. */
function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env) && value) process.env[key] = value;
  }
}
for (const f of ["secrets/prod.env", "secrets/secrets.env"]) loadEnvFile(resolve(process.cwd(), f));

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.EMAIL_FROM;
const to = process.argv[2];

const mask = (s) => (!s ? "(unset)" : s.length <= 8 ? "*".repeat(s.length) : `${s.slice(0, 4)}…${s.slice(-2)} (${s.length} chars)`);

console.log("SMTP settings being tested");
console.log(`  SMTP_HOST   ${host ?? "(unset)"}`);
console.log(`  SMTP_PORT   ${port}${port === 587 ? " (STARTTLS)" : port === 465 ? " (implicit TLS)" : ""}`);
console.log(`  SMTP_USER   ${user ?? "(unset)"}`);
console.log(`  SMTP_PASS   ${mask(pass)}`);
console.log(`  EMAIL_FROM  ${from ?? "(unset)"}`);
console.log("");

const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`✗ Missing: ${missing.join(", ")} — set them in secrets/prod.env, then re-run.`);
  process.exit(1);
}

// A "$" is the one character that behaves differently here vs. in the container:
// this tester (and Node) treat it literally, but docker compose INTERPOLATES it
// in --env-file values, so an unquoted "$" passes here yet arrives truncated in
// the container. Single quotes make compose treat it literally too.
for (const [k, v] of Object.entries({ SMTP_PASS: pass, SMTP_USER: user })) {
  if (v?.includes("$")) {
    console.warn(
      `! ${k} contains a "$". This tester reads it literally, but docker compose\n` +
        `  interpolates "$" in --env-file values — so it may arrive TRUNCATED in the\n` +
        `  container even though this test passes. Wrap the value in SINGLE quotes in\n` +
        `  secrets/prod.env:  ${k}='...the value...'  (single, not double)\n`,
    );
  }
}

// Sanity-check the shape of an OCI Email Delivery username. Using the console
// login here (instead of a generated SMTP credential) is the #1 cause of EAUTH.
if (/^ocid1\.user\./.test(user) && !user.includes("@ocid1.tenancy.")) {
  console.warn("! SMTP_USER starts with an OCID but has no @ocid1.tenancy… part — that looks truncated.\n");
} else if (!/^ocid1\.user\./.test(user) && /oci\.oraclecloud\.com$/.test(host ?? "")) {
  console.warn(
    "! Host is OCI Email Delivery but SMTP_USER isn't an OCID.\n" +
      "  OCI SMTP credentials are NOT your console login. Generate them under\n" +
      "  Identity → Domains → Users → your user → SMTP Credentials.\n",
  );
}

const transport = createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
});

/** Turn a nodemailer/SMTP failure into the thing to actually go fix. */
function explain(err) {
  const code = err?.code ?? "";
  const msg = String(err?.message ?? err);
  const status = err?.responseCode;
  if (/certificate|self[- ]signed|CERT_|tls/i.test(msg)) {
    return (
      `TLS negotiation failed with ${host}:${port}.\n` +
      `  • Real relays (incl. OCI) present a valid certificate, so this usually means the\n` +
      `    host is wrong, or something is intercepting the connection.\n` +
      `  • Port 587 expects STARTTLS; port 465 expects implicit TLS. Check SMTP_PORT.\n` +
      `  Underlying error: ${msg}`
    );
  }
  if (code === "ETIMEDOUT" || code === "ECONNREFUSED" || code === "ESOCKET") {
    return (
      `Could not reach ${host}:${port}.\n` +
      `  • Check SMTP_HOST matches YOUR region (see the Email Delivery → Configuration page).\n` +
      `  • Port 587 should be reachable from an OCI VM (only port 25 is blocked).\n` +
      `  • Test raw reachability:  timeout 5 bash -c 'cat < /dev/tcp/${host}/${port}' && echo OPEN || echo BLOCKED`
    );
  }
  if (code === "EAUTH" || status === 535 || /auth/i.test(msg)) {
    return (
      "The relay rejected these credentials.\n" +
      "  • SMTP_USER must be the GENERATED SMTP credential, not your console login\n" +
      "    (Identity → Domains → Users → your user → SMTP Credentials → Generate).\n" +
      "  • SMTP_PASS is shown exactly ONCE at generation — if it wasn't copied, generate a new one.\n" +
      "  • Paste both verbatim; no quotes or trailing spaces in secrets/prod.env."
    );
  }
  if (status === 550 || /approved sender|not allowed|relay/i.test(msg)) {
    return (
      `The relay refused the From address (${from}).\n` +
      "  • It must be an Approved Sender: Email Delivery → Approved Senders → Create.\n" +
      "  • EMAIL_FROM must match that address exactly."
    );
  }
  return msg;
}

try {
  await transport.verify();
  console.log("✓ Connected and authenticated — SMTP_HOST / SMTP_USER / SMTP_PASS are correct.");
} catch (err) {
  console.error("✗ Connect/auth failed.\n");
  console.error(explain(err));
  process.exit(1);
}

if (!to) {
  console.log("\nCredentials look good. To send a real test message:");
  console.log("  node utils/test-smtp.mjs you@example.com");
  process.exit(0);
}

if (!from) {
  console.error("\n✗ EMAIL_FROM is unset — required to send. It must be an Approved Sender in OCI.");
  process.exit(1);
}

try {
  const info = await transport.sendMail({
    from,
    to,
    subject: "SMTP test — job-preparation sign-up email",
    text:
      "If you're reading this, the sign-up verification email path works.\n" +
      "Set the same SMTP_* values in secrets/prod.env and rebuild the web container.\n",
  });
  console.log(`✓ Sent to ${to} (id ${info.messageId})`);
  console.log("\nIf it doesn't arrive within a minute or two, check the spam folder —");
  console.log("that means SPF/DKIM aren't published yet for your EMAIL_FROM domain.");
} catch (err) {
  console.error("✗ Accepted the login but refused the message.\n");
  console.error(explain(err));
  process.exit(1);
}
