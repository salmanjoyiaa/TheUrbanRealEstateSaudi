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
import { createClient } from "@/lib/supabase/server";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/seo";

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

export const revalidate = 0;

export default async function HomePage() {
  let featuredProperties: Property[] = [];
  let featuredProducts: Product[] = [];
  let heroStats = {
    propertiesCount: 0,
    propertyAgentsCount: 0,
    visitTeamCount: 0,
    rentedCount: 0,
  };

  try {
    const supabase = await createClient();
    const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

    // Prefer admin-selected featured properties for homepage; fill with random available if needed
    const { data: featuredData, error: featuredError } = await supabase
      .from("properties")
      .select("id, title, city, district, price, type, purpose, status, bedrooms, bathrooms, kitchens, area_sqm, images, property_ref, address, amenities, building_features, office_fee, broker_fee, water_bill_included, cover_image_index, location_url, blocked_dates, rental_period, installments, video_url, is_video_featured")
      .eq("featured", true)
      .in("status", ["available", "rented", "reserved"])
      .order("created_at", { ascending: false })
      .limit(12);

    if (featuredError) {
      console.error("[HomePage] featured properties query error:", featuredError.message);
    }

    const featuredList = (featuredData || []) as Property[];
    featuredProperties = [...featuredList].sort((a, b) => (b.images?.length ?? 0) - (a.images?.length ?? 0));

    const [
      { count: propertiesCount },
      { count: propertyAgentsCount },
      { count: visitTeamCount },
      { count: rentedCount },
    ] = await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }).in("status", ["available", "rented", "reserved"]),
      supabase.from("agents").select("id", { count: "exact", head: true }).eq("agent_type", "property").eq("status", "approved"),
      supabase.from("agents").select("id", { count: "exact", head: true }).eq("agent_type", "visiting").eq("status", "approved"),
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "rented"),
    ]);
    heroStats = {
      propertiesCount: propertiesCount ?? 0,
      propertyAgentsCount: propertyAgentsCount ?? 0,
      visitTeamCount: visitTeamCount ?? 0,
      rentedCount: rentedCount ?? 0,
    };

    const { data: prodData, error: prodError } = await supabase
      .from("products")
      .select("id, title, price, category, condition, district, images")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (prodError) {
      console.error("[HomePage] products query error:", prodError.message);
    }

    const rawProds = (prodData as Product[]) || [];
    featuredProducts = [
      ...shuffle(rawProds.filter((p) => (p.images?.length ?? 0) > 0)),
      ...shuffle(rawProds.filter((p) => (p.images?.length ?? 0) === 0)),
    ];
  } catch (err) {
    console.error("[HomePage] unexpected error:", err);
  }

  return (
    <main className="min-h-screen">
      <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
      <HomepageNav />

      {/* ── Hero ── */}
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
                Trusted by 500+ tenants
              </div>

              <div className="mb-5 sm:mb-6">
                <HeroHeadline />
              </div>

              <p className="animate-fade-in-up text-[15px] sm:text-lg lg:text-xl text-white/70 max-w-xl mb-6 sm:mb-8 leading-relaxed" style={{ animationDelay: "0.2s" }}>
                Discover premium apartments, houses, and flats from verified
                agents. Book directly via WhatsApp — no middlemen, no hassle.
              </p>

              <PropertyIdSearch />

              {/* Mobile-only stats card: shows between text and buttons so buttons are last */}
              <div className="animate-fade-in-up flex justify-center lg:hidden mb-8" style={{ animationDelay: "0.35s" }}>
                <div className="relative w-full max-w-lg sm:max-w-xl animate-hero-card-float">
                  <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
                  <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-3 sm:p-5 shadow-xl animate-hero-card-glow">
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {[
                        { label: "Properties Listed", value: heroStats.propertiesCount.toLocaleString(), icon: Building2 },
                        { label: "Property Agents", value: heroStats.propertyAgentsCount.toLocaleString(), icon: Shield },
                        { label: "Visit Team Agents", value: heroStats.visitTeamCount.toLocaleString(), icon: MessageCircle },
                        { label: "Properties Rent Out", value: (712 + heroStats.rentedCount).toLocaleString(), icon: Star },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="hero-stat-cell bg-white/10 rounded-xl sm:rounded-2xl aspect-square flex flex-col items-center justify-center gap-0.5 sm:gap-1 px-1 py-1.5 sm:px-2 sm:py-2 text-center min-w-0 shadow-sm border border-white/5"
                        >
                          <stat.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white/70 shrink-0" aria-hidden />
                          <div className="text-sm sm:text-lg font-bold text-white tabular-nums leading-none">{stat.value}</div>
                          <div className="text-[8px] sm:text-[10px] leading-tight text-white/65 px-0.5 line-clamp-3 text-balance">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: "0.3s" }}>
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg shadow-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <Link href="/properties">
                    Browse Properties
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 hover:border-white/60 font-semibold backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <Link href="/login">Agent Login</Link>
                </Button>
              </div>
            </div>

            {/* Stats card – desktop only (on mobile shown above buttons in left column) */}
            <div className="animate-fade-in-up hidden lg:flex justify-center lg:justify-end" style={{ animationDelay: "0.4s" }}>
              <div className="relative w-full max-w-3xl xl:max-w-4xl animate-hero-card-float">
                <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 xl:p-7 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:border-white/30 animate-hero-card-glow w-full">
                  <div className="grid grid-cols-4 gap-3 xl:gap-4">
                    {[
                      { label: "Properties Listed", value: heroStats.propertiesCount.toLocaleString(), icon: Building2 },
                      { label: "Property Agents", value: heroStats.propertyAgentsCount.toLocaleString(), icon: Shield },
                      { label: "Visit Team Agents", value: heroStats.visitTeamCount.toLocaleString(), icon: MessageCircle },
                      { label: "Properties Rent Out", value: (712 + heroStats.rentedCount).toLocaleString(), icon: Star },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="hero-stat-cell bg-white/10 rounded-2xl aspect-square flex flex-col items-center justify-center gap-1.5 xl:gap-2 px-2 py-2 xl:px-3 text-center transition-transform duration-300 hover:bg-white/15 hover:scale-[1.02] min-w-0 shadow-sm border border-white/5"
                      >
                        <stat.icon className="h-5 w-5 xl:h-6 xl:w-6 text-white/70 shrink-0" aria-hidden />
                        <div className="text-xl xl:text-2xl font-bold text-white tabular-nums leading-none">{stat.value}</div>
                        <div className="text-[10px] xl:text-[11px] leading-snug text-white/65 px-0.5 line-clamp-3 text-balance">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Property Slider ── */}
      <AnimateSection amount={0.12} duration={0.5}>
        <PropertySlider properties={featuredProperties} showAmenitiesAndBuildingFeatures />
      </AnimateSection>

      {/* ── Product Slider ── */}
      <AnimateSection amount={0.12} duration={0.5} delay={0.05}>
        <ProductSlider products={featuredProducts} />
      </AnimateSection>

      {/* ── Maintenance Slider ── */}
      <AnimateSection amount={0.12} duration={0.5} delay={0.05}>
        <MaintenanceSlider />
      </AnimateSection>

      {/* ── General maintenance request ── */}
      <AnimateSection amount={0.12} duration={0.5} delay={0.05}>
        <section className="py-12 lg:py-16 bg-muted/40 border-y border-border/60">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Need a hand with maintenance?</h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Submit a general request with text, voice, photos, or a short video. We will route it to the right professional — you do not have to choose a provider first.
              </p>
            </div>
            <GeneralMaintenanceRequestForm />
          </div>
        </section>
      </AnimateSection>

      {/* ── Value Props ── */}
      <AnimateSection amount={0.1} duration={0.45}>
        <section className="py-16 lg:py-20 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">Why Choose UrbanSaudi?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The simplest way to find and book rental properties
              </p>
            </div>

            <AnimateStagger className="grid grid-cols-1 md:grid-cols-3 gap-8" staggerDelay={0.1}>
              {[
                {
                  icon: Building2,
                  title: "Verified Listings",
                  description: "Every property is listed by a verified agent with detailed photos, pricing, and availability.",
                },
                {
                  icon: MessageCircle,
                  title: "Book via WhatsApp",
                  description: "Connect directly with agents on WhatsApp. No forms, no waiting — just instant communication.",
                },
                {
                  icon: Shield,
                  title: "Secure & Transparent",
                  description: "Clear pricing, real photos, and verified agent profiles. What you see is what you get.",
                },
              ].map((item) => (
                <AnimateItem key={item.title}>
                  <div className="group p-8 rounded-2xl bg-background border hover:shadow-xl card-glow transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </AnimateItem>
              ))}
            </AnimateStagger>
          </div>
        </section>
      </AnimateSection>

      {/* ── CTA ── */}
      <AnimateSection amount={0.2} duration={0.5}>
        <section className="py-20 gradient-primary">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
              Are You a Property Agent?
            </h2>
            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              List your properties, manage availability, and connect with quality tenants — all from your dashboard.
            </p>
            <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg shadow-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link href="/login">
                Get Started Free
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
