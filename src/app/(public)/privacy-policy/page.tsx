import Link from "next/link";
import { createLegalMetadata } from "@/lib/legal-meta";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { siteConfig } from "@/config/site";

import { getPublicTranslator } from "@/i18n/server";

export const metadata = createLegalMetadata({
  title: "Privacy Policy",
  description:
    "Privacy Policy for The Urban Real Estate (UrbanSaudi) — how we collect, use, and protect your data.",
  path: "/privacy-policy",
});

export default async function PrivacyPolicyPage() {
  const { t } = await getPublicTranslator();

  return (
    <LegalPageLayout title={t("privacyPolicy.title")} lastUpdated="June 2026">
      <p>
        The Urban Real Estate (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates theurbanrealestate.com
        (UrbanSaudi), a marketplace for property rentals, used household products, and maintenance services in Saudi
        Arabia. This Privacy Policy explains what information we collect, why we collect it, and your choices.
      </p>

      <h2>Information We Collect</h2>
      <h3>Account and profile data</h3>
      <ul>
        <li>Name, email address, phone/WhatsApp number, password (stored securely by our auth provider).</li>
        <li>Agent profile details: company name, license number, agent type, and approval status.</li>
      </ul>

      <h3>Listing and marketplace data</h3>
      <ul>
        <li>Property listing details: title, description, location, pricing, amenities, images, and videos.</li>
        <li>Product listing details: title, description, price, category, condition, district, and images.</li>
        <li>Maintenance service listings and general maintenance request details.</li>
      </ul>

      <h3>Uploaded media and documents</h3>
      <ul>
        <li>Property and product images and videos.</li>
        <li>Agent license documents (PDF, JPG, PNG).</li>
        <li>Maintenance request photos, videos, and voice notes (where provided).</li>
      </ul>

      <h3>Usage and technical data</h3>
      <ul>
        <li>Device and browser information, IP address, and pages visited.</li>
        <li>Anonymous visitor identifier cookie (<code>uv_id</code>) for internal page-view analytics.</li>
        <li>Analytics cookies if you consent (see Cookie Policy).</li>
        <li>Advertising cookies if you consent and ads are enabled (see below).</li>
      </ul>

      <h2>Why We Collect Data</h2>
      <ul>
        <li>To create and manage user accounts and agent profiles.</li>
        <li>To publish and moderate property, product, and maintenance listings.</li>
        <li>To process visit requests, leads, and maintenance inquiries.</li>
        <li>To send transactional notifications (e.g., via WhatsApp or email where configured).</li>
        <li>To improve site performance, security, and user experience.</li>
        <li>To measure traffic and, with consent, display relevant advertising.</li>
      </ul>

      <h2>Third-Party Services and Advertising</h2>
      <p>
        We use third-party services including Supabase (hosting and database), Vercel (hosting and analytics), Sentry
        (error monitoring), and optionally Google Analytics and Google AdSense.
      </p>
      <p>
        Third-party vendors, including Google, may use cookies to serve ads based on your prior visits to this website
        and other websites on the Internet. Google&apos;s use of advertising cookies enables it and its partners to serve
        ads to users based on their visit to this site and/or other sites on the Internet.
      </p>
      <p>
        You may opt out of personalized advertising by visiting{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Google Ads Settings
        </a>
        . You can also visit{" "}
        <a
          href="https://www.aboutads.info/choices/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          aboutads.info
        </a>{" "}
        for more opt-out options.
      </p>
      <p>
        If we enable additional third-party ad networks in the future, those vendors may also use cookies subject to
        their own privacy policies. We will update this policy when new ad partners are added.
      </p>

      <h2>Data Retention</h2>
      <p>
        We retain account and listing data while your account is active and as needed to operate the marketplace,
        comply with legal obligations, resolve disputes, and enforce our policies. Inactive accounts and rejected
        listings may be archived or deleted after a reasonable period.
      </p>

      <h2>Data Deletion Requests</h2>
      <p>
        To request access, correction, or deletion of your personal data, contact us via our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>{" "}
        or WhatsApp at{" "}
        <a href={siteConfig.links.whatsapp} className="text-primary hover:underline">
          {siteConfig.links.phone}
        </a>
        . We will respond within a reasonable timeframe. Some data may be retained where required by law or for
        legitimate business purposes.
      </p>

      <h2>Marketplace Disclaimer</h2>
      <p>
        The Urban Real Estate is a property, product, and maintenance marketplace. We do not own listed properties or
        products and are not a party to transactions between users. You should independently verify listing details,
        agent credentials, pricing, and property condition before making payments or scheduling viewings. We do not
        guarantee availability, accuracy of all listings, or outcomes of maintenance services.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Our services are not directed to individuals under 18. We do not knowingly collect personal information from
        children.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top reflects the
        most recent revision. Continued use of the site after changes constitutes acceptance of the updated policy.
      </p>

      <h2>Contact Us</h2>
      <p>
        For privacy-related questions, visit our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
