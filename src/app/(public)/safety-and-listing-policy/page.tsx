import Link from "next/link";
import { createLegalMetadata } from "@/lib/legal-meta";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { siteConfig } from "@/config/site";

export const metadata = createLegalMetadata({
  title: "Safety and Listing Policy",
  description:
    "Safety and Listing Policy for The Urban Real Estate (UrbanSaudi) — rules for properties, products, and moderation.",
  path: "/safety-and-listing-policy",
});

export default function SafetyAndListingPolicyPage() {
  return (
    <LegalPageLayout title="Safety and Listing Policy" lastUpdated="June 2026">
      <p>
        This policy sets the rules for listings on The Urban Real Estate (UrbanSaudi) to keep our marketplace safe,
        trustworthy, and compliant with applicable laws.
      </p>

      <h2>Prohibited Content</h2>
      <ul>
        <li><strong>Fake properties</strong> — listings for properties that do not exist or are not available for rent or sale.</li>
        <li><strong>Illegal products or services</strong> — anything prohibited under Saudi Arabian law.</li>
        <li><strong>Discriminatory housing language</strong> — content that excludes or discriminates based on race, religion, nationality, gender, disability, or other protected characteristics.</li>
        <li><strong>Misleading prices</strong> — bait pricing, hidden fees, or prices that do not reflect the actual offer.</li>
        <li><strong>Duplicate or spam listings</strong> — multiple identical listings to manipulate search results.</li>
        <li><strong>Unsafe or prohibited content</strong> — malware links, phishing, deceptive UI, or harmful material.</li>
      </ul>

      <h2>Property Listing Requirements</h2>
      <ul>
        <li>Listings must be submitted by approved property agents.</li>
        <li>New listings are reviewed before appearing publicly (status: pending → available).</li>
        <li>Photos and videos must accurately represent the property.</li>
        <li>Location, rental terms, and fees must be stated clearly.</li>
        <li>Listings must be updated or removed when a property is no longer available.</li>
      </ul>

      <h2>Product Listing Requirements</h2>
      <ul>
        <li>Products must be legal to sell and accurately described.</li>
        <li>Condition, price, and pickup/delivery terms must be honest.</li>
        <li>Prohibited items (weapons, counterfeit goods, etc.) are not allowed.</li>
        <li>
          {/* TODO: Add pending_review moderation status for products when schema is updated — currently products use is_available boolean. */}
          Products are shown when marked available; admin moderation tools may hide non-compliant listings.
        </li>
      </ul>

      <h2>Maintenance Service Requirements</h2>
      <ul>
        <li>Services must be offered by registered maintenance agents.</li>
        <li>Service descriptions must be accurate and within the agent&apos;s scope of work.</li>
        <li>Agents must not misrepresent qualifications or licenses.</li>
      </ul>

      <h2>Agent Verification and Moderation</h2>
      <ul>
        <li>Agents must apply and be approved (status: pending → approved) before listing.</li>
        <li>We may request license documents and company details for verification.</li>
        <li>Admin reviewers can approve, reject, suspend, or remove agents and listings.</li>
        <li>Repeated violations may result in permanent account removal.</li>
      </ul>

      <h2>Report a Listing</h2>
      <p>
        If you believe a listing violates this policy, contact us with:
      </p>
      <ol>
        <li>The listing URL or property/product ID.</li>
        <li>A brief description of the issue.</li>
        <li>Any supporting evidence (screenshots, etc.).</li>
      </ol>
      <p>
        Report via our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>{" "}
        or WhatsApp at{" "}
        <a href={siteConfig.links.whatsapp} className="text-primary hover:underline">
          {siteConfig.links.phone}
        </a>
        . We review reports and may remove listings or suspend accounts without prior notice where necessary.
      </p>

      <h2>User Safety Tips</h2>
      <ul>
        <li>Meet in safe, public locations for product transactions.</li>
        <li>Never send deposits to unverified contacts.</li>
        <li>Inspect properties and products in person before paying.</li>
        <li>Keep records of agreements and communications.</li>
      </ul>

      <h2>Contact</h2>
      <p>
        For safety concerns, visit our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
