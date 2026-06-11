import Link from "next/link";
import { createLegalMetadata } from "@/lib/legal-meta";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata = createLegalMetadata({
  title: "Advertising Disclosure",
  description:
    "Advertising Disclosure for The Urban Real Estate (UrbanSaudi) — how third-party ads may appear on our site.",
  path: "/advertising-disclosure",
});

export default function AdvertisingDisclosurePage() {
  return (
    <LegalPageLayout title="Advertising Disclosure" lastUpdated="June 2026">
      <p>
        This page explains how advertising may appear on The Urban Real Estate (UrbanSaudi) and what that means for
        you as a visitor.
      </p>

      <h2>Third-Party Advertising</h2>
      <p>
        We may display third-party advertisements on our website, including through Google AdSense or other ad
        networks, to help support the operation of the platform. Ads may appear on public pages such as property
        listings, product pages, and informational content.
      </p>

      <h2>Ads Do Not Mean Endorsement</h2>
      <p>
        The appearance of an advertisement on our site does not constitute an endorsement, recommendation, or
        guarantee of the advertised product, service, or company. We are not responsible for the content, accuracy, or
        practices of advertisers.
      </p>

      <h2>Sponsored and Paid Placements</h2>
      <p>
        If we feature sponsored listings, paid placements, or promoted content in the future, they will be clearly
        labeled as &quot;Sponsored,&quot; &quot;Ad,&quot; or &quot;Promoted&quot; so you can distinguish them from
        organic marketplace listings.
      </p>

      <h2>Verify Listings Independently</h2>
      <p>
        Whether or not ads are displayed, you should always verify property listings, agent credentials, product
        details, prices, and maintenance service providers independently before making payments or commitments. See our{" "}
        <Link href="/safety-and-listing-policy" className="text-primary hover:underline">
          Safety and Listing Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms-of-service" className="text-primary hover:underline">
          Terms of Service
        </Link>
        .
      </p>

      <h2>Advertising Cookies</h2>
      <p>
        Third-party ad networks may use cookies to serve relevant ads. You can manage your preferences through our
        cookie consent banner and opt out of personalized ads via{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Google Ads Settings
        </a>
        . See our{" "}
        <Link href="/cookie-policy" className="text-primary hover:underline">
          Cookie Policy
        </Link>{" "}
        for details.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about advertising on our site? Visit our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
