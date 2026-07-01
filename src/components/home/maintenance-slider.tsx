"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Droplets,
  Thermometer,
  Wrench,
  Paintbrush,
  Sparkles,
  Star,
  Hammer,
  ShieldCheck,
  TreePine,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "@/providers/locale-provider";

type ServiceItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  backgroundImage: string;
  iconColor: string;
};

const SERVICES: ServiceItem[] = [
  {
    icon: Droplets,
    title: "Plumbing",
    desc: "Leaks, pipes, fixtures & water heaters",
    backgroundImage: "/images/maintenance-bg/plumbing.png",
    iconColor: "text-blue-600",
  },
  {
    icon: Zap,
    title: "Electrical",
    desc: "Wiring, outlets, panels & lighting",
    backgroundImage: "/images/maintenance-bg/elec.png",
    iconColor: "text-amber-600",
  },
  {
    icon: Thermometer,
    title: "HVAC",
    desc: "AC, heating, ventilation & duct cleaning",
    backgroundImage: "/images/maintenance-bg/hvac.png",
    iconColor: "text-red-600",
  },
  {
    icon: Wrench,
    title: "Appliance Repair",
    desc: "Fridge, washer, dryer & oven repairs",
    backgroundImage: "/images/maintenance-bg/repair.png",
    iconColor: "text-purple-600",
  },
  {
    icon: Paintbrush,
    title: "Painting",
    desc: "Interior & exterior, touch-ups & full jobs",
    backgroundImage: "/images/maintenance-bg/paint.png",
    iconColor: "text-emerald-600",
  },
  {
    icon: Sparkles,
    title: "Deep Cleaning",
    desc: "Move-in/out, post-construction & regular",
    backgroundImage: "/images/maintenance-bg/deep-cleaning.png",
    iconColor: "text-cyan-600",
  },
  {
    icon: Hammer,
    title: "Carpentry",
    desc: "Furniture assembly, doors & custom woodwork",
    backgroundImage: "/images/maintenance-bg/wood.png",
    iconColor: "text-orange-600",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Security",
    desc: "CCTV, locks, alarms & fire systems",
    backgroundImage: "/images/maintenance-bg/safety.png",
    iconColor: "text-indigo-600",
  },
  {
    icon: TreePine,
    title: "Landscaping",
    desc: "Garden, lawn care & outdoor maintenance",
    backgroundImage: "/images/maintenance-bg/landscaping.png",
    iconColor: "text-green-600",
  },
];

export function MaintenanceSlider() {
  const { t } = useLocale();
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = SERVICES.length;

  const scrollToIndex = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[idx] as HTMLElement;
    if (card) track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    setCurrent(idx);
  }, []);

  const next = useCallback(() => scrollToIndex((current + 1) % total), [current, total, scrollToIndex]);
  const prev = useCallback(() => scrollToIndex((current - 1 + total) % total), [current, total, scrollToIndex]);

  const syncCurrentFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || total === 0) return;
    const scrollLeft = track.scrollLeft;
    const trackCenter = scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const el = track.children[i] as HTMLElement;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - trackCenter);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    }
    setCurrent((prev) => (prev !== nearest ? nearest : prev));
  }, [total]);

  return (
    <section className="py-16 lg:py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-3 border border-emerald-200">
              <Star className="h-3.5 w-3.5" />
              {t("home.sliders.maintenanceBadge")}
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-1">
              {t("home.sliders.maintenanceTitle")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("home.sliders.maintenanceSubtitle")}
            </p>
          </div>
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-2 self-start px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/25 whitespace-nowrap"
          >
            <Wrench className="h-5 w-5 shrink-0" />
            {t("home.sliders.exploreServices")}
          </Link>
        </div>

        {/* Slider */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex [touch-action:pan-x_pan-y] touch-manipulation gap-5 overflow-x-auto overflow-y-hidden scrollbar-hide overscroll-x-contain"
            style={{ scrollSnapType: "x proximity", WebkitOverflowScrolling: "touch" }}
            onScroll={syncCurrentFromScroll}
          >
            {SERVICES.map((service) => (
              <Link
                key={service.title}
                href={`/maintenance?category=${encodeURIComponent(service.title)}`}
                aria-label={`Browse ${service.title} providers on the marketplace`}
                className="group relative flex-none w-[85%] sm:w-[45%] lg:w-[calc(33.333%-14px)] flex flex-col min-h-[260px] sm:min-h-[280px] overflow-hidden rounded-2xl border border-white/10 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ scrollSnapAlign: "start" }}
              >
                <Image
                  src={service.backgroundImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25"
                  aria-hidden
                />
                <div className="relative z-10 flex h-full flex-col p-6 sm:p-7">
                  <div className="mb-5 shrink-0">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/90 shadow-md ring-1 ring-white/20 backdrop-blur-sm">
                      <service.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${service.iconColor}`} strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="font-display mb-2 text-lg font-bold tracking-tight text-white sm:text-xl">
                    {service.title}
                  </h3>
                  <p className="mb-5 flex-grow text-sm leading-relaxed text-white/90">
                    {service.desc}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors group-hover:text-white/90">
                    Browse providers
                    <ArrowRight
                      className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous service"
            className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95 sm:h-10 sm:w-10 md:-left-4"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              next();
            }}
            aria-label="Next service"
            className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95 sm:h-10 sm:w-10 md:-right-4"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {SERVICES.map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to service ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-muted-foreground">
          {[
            { icon: ShieldCheck, text: "Licensed & Insured" },
            { icon: Star, text: "4.9★ Customer Rating" },
            { icon: Wrench, text: "All Types Covered" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
