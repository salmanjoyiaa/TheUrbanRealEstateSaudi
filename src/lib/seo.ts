import { getPublicShareBaseUrl } from "@/config/site";
import { siteConfig } from "@/config/site";

export function getSiteBaseUrl(): string {
  return getPublicShareBaseUrl();
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  const baseUrl = getSiteBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  const baseUrl = getSiteBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Urban Real Estate",
    alternateName: ["UrbanSaudi", "TheUrbanRealEstateSaudi"],
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description: siteConfig.description,
    areaServed: {
      "@type": "Country",
      name: "Saudi Arabia",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.links.phone,
      contactType: "customer service",
      availableLanguage: ["English", "Arabic"],
    },
  };
}

export function buildWebSiteJsonLd(): Record<string, unknown> {
  const baseUrl = getSiteBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Urban Real Estate",
    alternateName: "UrbanSaudi",
    url: baseUrl,
  };
}
