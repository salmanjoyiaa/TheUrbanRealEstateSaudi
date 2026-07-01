"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Shield,
  MessageCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomepageNav } from "@/components/home/homepage-nav";
import { HeroHeadline } from "@/components/home/hero-headline";
import { PropertyIdSearch } from "@/components/home/property-id-search";
import { PropertySlider } from "@/components/home/property-slider";
import { ProductSlider } from "@/components/home/product-slider";
import { MaintenanceSlider } from "@/components/home/maintenance-slider";
import { GeneralMaintenanceRequestForm } from "@/components/maintenance/general-maintenance-request-form";
import { AnimateSection, AnimateStagger, AnimateItem } from "@/components/home/animate-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo";
import { useLocale } from "@/providers/locale-provider";

type Property = {
  id: string;
  title: string;
  city: string;
  district: string | null;
  price: number;
  type: string;
  purpose: string;
  status?: string;
  bedrooms: number | null;
  bathrooms?: number | null;
  kitchens?: number | null;
  area_sqm: number | null;
  images: string[] | null;
  property_ref: string | null;
  address: string | null;
  amenities: string[];
  building_features: string[];
  office_fee: string | null;
  broker_fee: string | null;
  water_bill_included: string | null;
  cover_image_index: number;
  location_url: string | null;
  blocked_dates: string[];
  rental_period?: string | null;
  installments?: string | null;
  video_url?: string | null;
  is_video_featured?: boolean;
};

type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  district: string | null;
  images: string[] | null;
};

type HeroStats = {
  propertiesCount: number;
  propertyAgentsCount: number;
  visitTeamCount: number;
  rentedCount: number;
};

type HomePageContentProps = {
  featuredProperties: Property[];
  featuredProducts: Product[];
  heroStats: HeroStats;
};

export function HomePageContent({
  featuredProperties,
  featuredProducts,
  heroStats,
}: HomePageContentProps) {
  const { t } = useLocale();

  const statItems = [
    { labelKey: "home.stats.propertiesListed", value: heroStats.propertiesCount.toLocaleString(), icon: Building2 },
    { labelKey: "home.stats.propertyAgents", value: heroStats.propertyAgentsCount.toLocaleString(), icon: Shield },
    { labelKey: "home.stats.visitTeamAgents", value: heroStats.visitTeamCount.toLocaleString(), icon: MessageCircle },
    { labelKey: "home.stats.propertiesRentOut", value: (712 + heroStats.rentedCount).toLocaleString(), icon: Star },
  ] as const;

  const valueProps = [
    {
      icon: Building2,
      titleKey: "home.valueProps.verifiedListings.title",
      descriptionKey: "home.valueProps.verifiedListings.description",
    },
    {
      icon: MessageCircle,
      titleKey: "home.valueProps.trustedAgents.title",
      descriptionKey: "home.valueProps.trustedAgents.description",
    },
    {
      icon: Shield,
      titleKey: "home.valueProps.easyBooking.title",
      descriptionKey: "home.valueProps.easyBooking.description",
    },
  ] as const;

  return (
    <main className="min-h-screen">
      <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
      <HomepageNav />

      <section className="relative min-h-[70vh] flex items-center gradient-primary">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative z-10 max-w-xl flex flex-col">
              <div className="animate-fade-in-up inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-[12px] sm:text-[13px] mb-5 sm:mb-6 animate-soft-glow">
                <Star className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                {t("home.hero.badge")}
              </div>

              <div className="mb-5 sm:mb-6">
                <HeroHeadline />
              </div>

              <p className="animate-fade-in-up text-[15px] sm:text-lg lg:text-xl text-white/70 max-w-xl mb-6 sm:mb-8 leading-relaxed" style={{ animationDelay: "0.2s" }}>
                {t("home.hero.subtitle")}
              </p>

              <PropertyIdSearch />

              <div className="animate-fade-in-up flex justify-center lg:hidden mb-8" style={{ animationDelay: "0.35s" }}>
                <div className="relative w-full max-w-lg sm:max-w-xl animate-hero-card-float">
                  <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
                  <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-3 sm:p-5 shadow-xl animate-hero-card-glow">
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {statItems.map((stat) => (
                        <div
                          key={stat.labelKey}
                          className="hero-stat-cell bg-white/10 rounded-xl sm:rounded-2xl aspect-square flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-1 py-1.5 sm:px-2 sm:py-2 text-center min-w-0 shadow-sm border border-white/5"
                        >
                          <stat.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white/70 shrink-0" aria-hidden />
                          <div className="text-sm sm:text-lg font-bold text-white tabular-nums leading-none">{stat.value}</div>
                          <div className="text-[8px] sm:text-[10px] leading-tight text-white/65 px-0.5 line-clamp-3 text-balance">{t(stat.labelKey)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: "0.3s" }}>
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg shadow-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <Link href="/properties">
                    {t("home.hero.browseProperties")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60 font-semibold backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <Link href="/login">{t("nav.agentLogin")}</Link>
                </Button>
              </div>
            </div>

            <div className="animate-fade-in-up hidden lg:flex justify-center lg:justify-end" style={{ animationDelay: "0.4s" }}>
              <div className="relative w-full max-w-3xl xl:max-w-4xl animate-hero-card-float">
                <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 xl:p-7 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:border-white/30 animate-hero-card-glow w-full">
                  <div className="grid grid-cols-4 gap-3 xl:gap-4">
                    {statItems.map((stat) => (
                      <div
                        key={stat.labelKey}
                        className="hero-stat-cell bg-white/10 rounded-2xl aspect-square flex flex-col items-center justify-center gap-1.5 xl:gap-2 px-2 py-2 xl:px-3 text-center transition-transform duration-300 hover:bg-white/15 hover:scale-[1.02] min-w-0 shadow-sm border border-white/5"
                      >
                        <stat.icon className="h-5 w-5 xl:h-6 xl:w-6 text-white/70 shrink-0" aria-hidden />
                        <div className="text-xl xl:text-2xl font-bold text-white tabular-nums leading-none">{stat.value}</div>
                        <div className="text-[10px] xl:text-[11px] leading-snug text-white/65 px-0.5 line-clamp-3 text-balance">{t(stat.labelKey)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimateSection amount={0.12} duration={0.5}>
        <PropertySlider properties={featuredProperties} showAmenitiesAndBuildingFeatures />
      </AnimateSection>

      <AnimateSection amount={0.12} duration={0.5} delay={0.05}>
        <ProductSlider products={featuredProducts} />
      </AnimateSection>

      <AnimateSection amount={0.12} duration={0.5} delay={0.05}>
        <MaintenanceSlider />
      </AnimateSection>

      <AnimateSection amount={0.12} duration={0.5} delay={0.05}>
        <section className="py-12 lg:py-16 bg-muted/40 border-y border-border/60">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">{t("home.maintenance.title")}</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                {t("home.maintenance.subtitle")}
              </p>
            </div>
            <GeneralMaintenanceRequestForm />
          </div>
        </section>
      </AnimateSection>

      <AnimateSection amount={0.1} duration={0.45}>
        <section className="py-16 lg:py-20 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">{t("home.valueProps.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("home.valueProps.subtitle")}
              </p>
            </div>

            <AnimateStagger className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.1}>
              {valueProps.map((item) => (
                <AnimateItem key={item.titleKey}>
                  <div className="group p-8 rounded-2xl bg-background border hover:shadow-xl card-glow transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{t(item.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(item.descriptionKey)}</p>
                  </div>
                </AnimateItem>
              ))}
            </AnimateStagger>
          </div>
        </section>
      </AnimateSection>

      <AnimateSection amount={0.2} duration={0.5}>
        <section className="py-20 gradient-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
              {t("home.agentCta.title")}
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              {t("home.agentCta.subtitle")}
            </p>
            <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg shadow-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link href="/login">
                {t("home.agentCta.button")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </AnimateSection>

      <AnimateSection amount={0.08} duration={0.4} delay={0}>
        <SiteFooter variant="homepage" />
      </AnimateSection>
    </main>
  );
}
