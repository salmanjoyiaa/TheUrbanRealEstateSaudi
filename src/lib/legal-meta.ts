import type { Metadata } from "next";

export function createLegalMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | The Urban Real Estate`,
      description,
      url: path,
      type: "website",
      siteName: "The Urban Real Estate",
    },
    twitter: {
      card: "summary",
      title: `${title} | The Urban Real Estate`,
      description,
    },
  };
}
