import Link from "next/link";
import { createLegalMetadata } from "@/lib/legal-meta";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { siteConfig } from "@/config/site";

import { getPublicTranslator } from "@/i18n/server";

export const metadata = createLegalMetadata({
  title: "Terms of Service",
  description:
    "Terms of Service for The Urban Real Estate (UrbanSaudi) marketplace — user responsibilities, listing rules, and liability.",
  path: "/terms-of-service",
});

export default async function TermsOfServicePage() {
  const { t } = await getPublicTranslator();

  return (
    <LegalPageLayout title={t("termsOfService.title")} lastUpdated="June 2026">
      <p>
        By accessing or using theurbanrealestate.com (UrbanSaudi), you agree to these Terms of Service. If you do not
        agree, please do not use the site.
      </p>

      <h2>1. Platform Description</h2>
      <p>
        The Urban Real Estate is an online marketplace connecting property agents, sellers, maintenance providers, and
        users seeking rentals, used products, or maintenance services in Saudi Arabia. We facilitate listings and
        communications but are not a real estate broker, landlord, retailer, or maintenance contractor unless explicitly
        stated.
      </p>

      <h2>2. User Responsibilities</h2>
      <ul>
        <li>Provide accurate registration information and keep your account credentials secure.</li>
        <li>Use the platform lawfully and respectfully.</li>
        <li>Verify listing details, agent identity, and pricing before making payments or commitments.</li>
        <li>Do not post false, misleading, harmful, or prohibited content.</li>
        <li>Do not scrape, spam, or attempt to disrupt the platform.</li>
      </ul>

      <h2>3. Agent and Seller Responsibilities</h2>
      <ul>
        <li>Maintain accurate and up-to-date listings including price, availability, location, and media.</li>
        <li>Hold valid licenses or credentials where required by Saudi law.</li>
        <li>Respond promptly to inquiries and honor agreed visit or service arrangements.</li>
        <li>Remove or update listings when properties are rented, sold, or no longer available.</li>
        <li>Comply with our <Link href="/safety-and-listing-policy" className="text-primary hover:underline">Safety and Listing Policy</Link>.</li>
      </ul>

      <h2>4. Listing Accuracy Rules</h2>
      <ul>
        <li>Listings must represent real properties, products, or services.</li>
        <li>Photos and videos must depict the actual item or property offered.</li>
        <li>Prices must be stated clearly and must not be used to bait users with false low prices.</li>
        <li>Duplicate or spam listings for the same item may be removed.</li>
      </ul>

      <h2>5. Prohibited Listings and Content</h2>
      <ul>
        <li>Fake or non-existent properties.</li>
        <li>Illegal products, services, or activities.</li>
        <li>Discriminatory housing language or practices.</li>
        <li>Fraudulent schemes, phishing, or impersonation.</li>
        <li>Malware, deceptive download buttons, or hidden redirects.</li>
        <li>Content that violates applicable Saudi laws or regulations.</li>
      </ul>

      <h2>6. No Guarantee of Availability or Price</h2>
      <p>
        We do not guarantee that any property, product, or service listed on the platform is available at the stated
        price unless explicitly confirmed by the listing agent or seller. Listings may change or be removed without
        notice.
      </p>

      <h2>7. Maintenance Service Terms</h2>
      <p>
        Maintenance requests submitted through the platform are routed to registered maintenance agents. Service scope,
        pricing, scheduling, and warranties are agreed between you and the service provider. We are not responsible
        for the quality, safety, or completion of maintenance work performed by third parties.
      </p>

      <h2>8. Used Product Marketplace Disclaimer</h2>
      <p>
        Used products are sold by individual sellers. We do not inspect, warrant, or guarantee the condition,
        authenticity, or safety of used items. Buyers should inspect products before purchase and transact at their own
        risk.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, The Urban Real Estate and its operators shall not be liable for any
        indirect, incidental, special, or consequential damages arising from your use of the platform, transactions
        with other users, or reliance on listing information. Our total liability for any claim shall not exceed the
        amount you paid us (if any) in the twelve months preceding the claim.
      </p>

      <h2>10. Account Suspension and Removal</h2>
      <p>
        We may suspend or terminate accounts that violate these Terms, our Safety and Listing Policy, or applicable
        law. We may remove listings, restrict access, or report illegal activity to authorities without prior notice
        where necessary.
      </p>

      <h2>11. Intellectual Property</h2>
      <p>
        Site content, branding, and software are owned by The Urban Real Estate or its licensors. You retain ownership
        of content you upload but grant us a license to display and distribute it on the platform.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use after changes constitutes acceptance of the revised
        Terms.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms? Visit our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>{" "}
        or WhatsApp{" "}
        <a href={siteConfig.links.whatsapp} className="text-primary hover:underline">
          {siteConfig.links.phone}
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
