import { createClient } from "@/lib/supabase/server";
import { HomePageContent } from "@/components/home/home-page-content";

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
    <HomePageContent
      featuredProperties={featuredProperties}
      featuredProducts={featuredProducts}
      heroStats={heroStats}
    />
  );
}
