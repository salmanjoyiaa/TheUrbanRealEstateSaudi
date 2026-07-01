import { Suspense } from "react";
import { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { SellListingForm } from "@/components/sell/sell-listing-form";
import { getPublicTranslator } from "@/i18n/server";

export const metadata: Metadata = {
  title: "List Your Product Free",
  description:
    "List your used household product for free on The Urban Real Estate (UrbanSaudi) marketplace in Saudi Arabia.",
  alternates: { canonical: "/sell" },
  openGraph: {
    title: "List Your Product Free | The Urban Real Estate",
    description:
      "List your used household product for free on The Urban Real Estate marketplace in Saudi Arabia.",
    url: "/sell",
    type: "website",
    siteName: "The Urban Real Estate",
  },
};

export default async function SellPage() {
  const { t } = await getPublicTranslator();

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("sell.title")}</h1>
        <p className="text-muted-foreground">{t("sell.subtitle")}</p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <SellListingForm />
      </Suspense>
    </div>
  );
}
