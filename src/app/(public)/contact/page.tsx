import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { createLegalMetadata } from "@/lib/legal-meta";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { siteConfig } from "@/config/site";
import { getPublicTranslator } from "@/i18n/server";

export const metadata = createLegalMetadata({
  title: "Contact Us",
  description:
    "Contact The Urban Real Estate (UrbanSaudi) for property, product, and maintenance inquiries in Saudi Arabia.",
  path: "/contact",
});

export default async function ContactPage() {
  const { t } = await getPublicTranslator();
  const phoneDisplay = "+966 549 586 498";
  const businessEmail = process.env.NEXT_PUBLIC_BUSINESS_EMAIL?.trim();

  return (
    <LegalPageLayout title={t("contactPage.title")} lastUpdated="June 2026">
      <p>
        We are here to help with questions about property listings, used products, maintenance services, agent
        applications, and account support. Please use the channels below.
      </p>

      <h2>Phone &amp; WhatsApp</h2>
      <div className="not-prose flex flex-col gap-4 sm:flex-row sm:gap-6">
        <a
          href={`tel:${siteConfig.links.phone}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          aria-label="Call us"
        >
          <Phone className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Phone</p>
            <p className="text-sm text-muted-foreground">{phoneDisplay}</p>
          </div>
        </a>
        <a
          href={siteConfig.links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
          aria-label="Message us on WhatsApp"
        >
          <MessageCircle className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-foreground">WhatsApp</p>
            <p className="text-sm text-muted-foreground">{phoneDisplay}</p>
          </div>
        </a>
      </div>

      <h2>Email</h2>
      {businessEmail ? (
        <p>
          Email us at{" "}
          <a href={`mailto:${businessEmail}`} className="font-medium text-primary hover:underline">
            {businessEmail}
          </a>
          .
        </p>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm">
          {/* TODO: Set NEXT_PUBLIC_BUSINESS_EMAIL in Vercel environment variables when a public business email is available. */}
          A public business email will be published here once configured. For now, please contact us via phone or
          WhatsApp.
        </p>
      )}

      <h2>Service Area</h2>
      <p>
        Saudi Arabia — primarily Al Khobar, Thuqbah, Al Janubiyah, and nearby Eastern Province areas.
      </p>

      <h2>Report a Listing or Safety Concern</h2>
      <p>
        To report a suspicious property, product, or maintenance listing, contact us with the listing URL and a brief
        description. See our{" "}
        <Link href="/safety-and-listing-policy" className="text-primary hover:underline">
          Safety and Listing Policy
        </Link>{" "}
        for more details.
      </p>

      <h2>Follow Us</h2>
      <ul>
        <li>
          <a
            href="https://www.facebook.com/@theurbanrealestate"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Facebook Page
          </a>
        </li>
        <li>
          <a
            href="https://www.instagram.com/theurbanrealestate_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Instagram
          </a>
        </li>
        <li>
          <a
            href="https://www.tiktok.com/@theurbanrealestate_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            TikTok
          </a>
        </li>
      </ul>
    </LegalPageLayout>
  );
}
