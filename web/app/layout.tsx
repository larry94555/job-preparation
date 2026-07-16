import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Prep — Lessons",
  description: "AI-engineering interview prep: lessons, checks, and section mastery.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

// Site-wide footer: the voluntary "pay what you can" donation call-to-action,
// a Help link that opens the visitor's email client to support, and quick links
// (including Privacy & Terms). Appears on every page, signed in or not.
function SiteFooter() {
  const supportEmail = process.env.SUPPORT_EMAIL ?? "support@example.com";
  const helpMailto =
    `mailto:${supportEmail}` +
    `?subject=${encodeURIComponent("Help with the site")}` +
    `&body=${encodeURIComponent("Hi — I could use some help.\n\nWhat's happening:\n\n")}`;

  return (
    <footer
      style={{
        borderTop: "1px solid #e5e7eb",
        marginTop: 48,
        padding: "20px 24px",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 14,
      }}
    >
      <Link href="/donate" style={{ fontWeight: 600 }}>
        Enjoying the website? Set your own price for the content. 💛
      </Link>
      <span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Link href="/topics">Topics</Link>
        <Link href="/premium">Premium</Link>
        <Link href="/donate">Donate</Link>
        <Link href="/feedback">Feedback</Link>
        <a href={helpMailto}>Help / Troubleshoot</a>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </span>
    </footer>
  );
}
