import Link from "next/link";
import { createLegalMetadata } from "@/lib/legal-meta";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata = createLegalMetadata({
  title: "About Us",
  description:
    "Learn about The Urban Real Estate (UrbanSaudi) — verified property rentals, used household products, and maintenance services across Saudi Arabia.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <LegalPageLayout title="About The Urban Real Estate" lastUpdated="June 2026">
      <p>
        The Urban Real Estate (also known as UrbanSaudi) is a Saudi Arabia-based marketplace connecting tenants,
        buyers, sellers, and verified property agents. We help people find rental properties, quality used household
        products, and reliable maintenance services in the Eastern Province and beyond.
      </p>

      <h2>Why Use The Urban Real Estate</h2>
      <ul>
        <li>Browse verified property listings from approved agents with transparent details.</li>
        <li>Schedule property visits through our platform and connect via WhatsApp when needed.</li>
        <li>Find used household products from local sellers at fair prices.</li>
        <li>Request maintenance services from registered professionals.</li>
        <li>Clear navigation, trust policies, and responsive support channels.</li>
      </ul>

      <h2>Areas We Serve</h2>
      <p>
        We primarily serve Saudi Arabia, with a focus on the Eastern Province including Al Khobar, Thuqbah, Al
        Janubiyah (Janubiyah), and nearby communities. Listings and services may also appear in other cities as our
        agent network grows.
      </p>

      <h2>How Property Verification Works</h2>
      <p>
        Property agents must register and be approved before listing. New property listings are submitted for review
        and appear publicly once approved and marked available. We encourage tenants to verify property details,
        location, pricing, and agent credentials independently before making payments or signing agreements.
      </p>

      <h2>How Agents Can List Properties</h2>
      <ol>
        <li>
          Apply as an Aqari (property) agent via our{" "}
          <Link href="/signup/agent?type=property" className="text-primary hover:underline">
            agent signup
          </Link>{" "}
          page.
        </li>
        <li>Complete profile verification and await admin approval.</li>
        <li>Once approved, access your agent dashboard to create and manage listings.</li>
        <li>Listings are reviewed before being published to the public marketplace.</li>
      </ol>

      <h2>How Tenants Should Safely Verify Listings</h2>
      <ul>
        <li>Confirm the property address, rental terms, and total cost before paying any deposit.</li>
        <li>Visit the property in person or schedule a visit through our platform.</li>
        <li>Verify the agent&apos;s identity and company details.</li>
        <li>Do not send money to unverified contacts or outside agreed channels.</li>
        <li>Report suspicious listings via our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.</li>
      </ul>

      <h2>How Maintenance Requests Work</h2>
      <p>
        Browse maintenance services by category or submit a general maintenance request with photos, video, or voice
        notes. Requests are routed to registered maintenance agents. Service terms, pricing, and scheduling are agreed
        directly between you and the service provider. We do not guarantee response times or job completion.
      </p>

      <h2>Used Product Marketplace Safety Tips</h2>
      <ul>
        <li>Inspect items in person before purchase when possible.</li>
        <li>Confirm product condition, price, and pickup or delivery arrangements.</li>
        <li>Use safe meeting locations and avoid sharing unnecessary personal information.</li>
        <li>Report misleading or prohibited product listings to us promptly.</li>
      </ul>

      <p>
        For questions, visit our{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact page
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
