import Link from "next/link";
import { createLegalMetadata } from "@/lib/legal-meta";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

import { getPublicTranslator } from "@/i18n/server";

export const metadata = createLegalMetadata({
  title: "Cookie Policy",
  description:
    "Cookie Policy for The Urban Real Estate (UrbanSaudi) — essential, analytics, and advertising cookies.",
  path: "/cookie-policy",
});

export default async function CookiePolicyPage() {
  const { t } = await getPublicTranslator();

  return (
    <LegalPageLayout title={t("cookiePolicy.title")} lastUpdated="June 2026">
      <p>
        This Cookie Policy explains how The Urban Real Estate (UrbanSaudi) uses cookies and similar technologies on
        theurbanrealestate.com.
      </p>

      <h2>What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help the site function,
        remember preferences, and understand how visitors use the site.
      </p>

      <h2>Types of Cookies We Use</h2>

      <h3>Essential cookies</h3>
      <p>
        Required for the site to function. These include authentication session cookies (via Supabase) and security
        cookies. They cannot be disabled without breaking core functionality such as login and account access.
      </p>

      <h3>Internal analytics</h3>
      <p>
        We use an anonymous visitor identifier (<code>uv_id</code>) stored as an httpOnly cookie to count page views for
        internal analytics. This helps us understand which pages are popular. It does not identify you personally.
      </p>

      <h3>Analytics cookies (with consent)</h3>
      <p>
        If you accept analytics cookies, we may load Google Analytics 4 (GA4) to measure traffic and page views. GA4
        uses cookies such as <code>_ga</code> and <code>_ga_*</code>. Analytics scripts load only after you consent.
      </p>

      <h3>Advertising cookies (with consent, if enabled)</h3>
      <p>
        If you accept advertising cookies and we have enabled Google AdSense, Google and its partners may use cookies
        to serve ads based on your visits to this and other websites. Ad scripts load only after you consent and only
        when advertising is enabled on our site.
      </p>

      <h3>Third-party hosting analytics</h3>
      <p>
        Vercel Analytics may collect anonymized performance data. Sentry may collect error reports to help us fix bugs.
        These are used for site reliability and are not used for personalized advertising.
      </p>

      <h2>Your Consent Choices</h2>
      <p>
        When you first visit our site, a cookie consent banner allows you to:
      </p>
      <ul>
        <li><strong>Accept</strong> — enable analytics and advertising cookies.</li>
        <li><strong>Reject Non-Essential</strong> — only essential and internal cookies are used.</li>
        <li><strong>Manage Preferences</strong> — choose analytics and advertising separately.</li>
      </ul>
      <p>
        Your choice is stored in your browser&apos;s localStorage. You can change your preferences at any time by
        clearing site data or contacting us.
      </p>

      <h2>Managing Cookies in Your Browser</h2>
      <p>
        Most browsers let you block or delete cookies. Note that blocking essential cookies may prevent you from
        logging in or using certain features. Instructions vary by browser:
      </p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Google Chrome
          </a>
        </li>
        <li>
          <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Safari
          </a>
        </li>
      </ul>

      <h2>Opt Out of Personalized Ads</h2>
      <p>
        Visit{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Google Ads Settings
        </a>{" "}
        to opt out of Google&apos;s personalized advertising. See our{" "}
        <Link href="/privacy-policy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{" "}
        for more details.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about cookies? Visit our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
