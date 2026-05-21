"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPropertyRefDisplay } from "@/lib/format";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  property_ref: string | null;
  title: string;
  status: string;
  city: string;
  district: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  rented: "Rented",
  reserved: "Reserved",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  available: "border-green-200 bg-green-50 text-green-800",
  rented: "border-blue-200 bg-blue-50 text-blue-800",
  reserved: "border-orange-200 bg-orange-50 text-orange-800",
};

type PanelPosition = {
  top: number;
  left: number;
  width: number;
};

export function PropertyIdSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToProperty = useCallback(
    (id: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/properties/${id}`);
    },
    [router]
  );

  const updatePanelPosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPanelPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    setOpen(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/properties/search?q=${encodeURIComponent(trimmed)}`);
        const json = (await res.json()) as { data?: SearchResult[]; error?: string };
        if (!res.ok) {
          setResults([]);
          return;
        }
        setResults(json.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const showDropdown = open && query.trim().length > 0;

  useEffect(() => {
    if (!showDropdown) {
      setPanelPosition(null);
      return;
    }
    updatePanelPosition();
    const onReposition = () => updatePanelPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [showDropdown, updatePanelPosition]);

  useEffect(() => {
    if (!showDropdown) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showDropdown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Enter" && results.length === 1 && !loading) {
      e.preventDefault();
      goToProperty(results[0].id);
    }
    if (e.key === "Enter" && results.length > 1) {
      setOpen(true);
    }
  };

  const dropdownPanel =
    showDropdown && panelPosition && mounted ? (
      <div
        ref={panelRef}
        id="property-id-search-results"
        role="listbox"
        className="fixed z-[200] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
        style={{
          top: panelPosition.top,
          left: panelPosition.left,
          width: panelPosition.width,
        }}
      >
        <div className="border-b border-border bg-muted/40 px-4 py-2.5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              Searching…
            </div>
          ) : results.length > 0 ? (
            <p className="text-xs font-medium text-muted-foreground">
              {results.length} {results.length === 1 ? "property" : "properties"}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No properties found</p>
          )}
        </div>

        {!loading && results.length > 0 && (
          <ul className="max-h-[min(320px,50vh)] overflow-y-auto overscroll-contain">
            {results.map((item) => {
              const refToken = formatPropertyRefDisplay(item.property_ref);
              const statusKey = item.status?.toLowerCase() ?? "";
              const statusLabel = STATUS_LABEL[statusKey] ?? item.status;
              const statusClass =
                STATUS_BADGE_CLASS[statusKey] ?? "border-border bg-muted text-foreground";
              const location = [item.city, item.district?.trim()].filter(Boolean).join(", ");

              return (
                <li key={item.id} className="border-b border-border last:border-0">
                  <button
                    type="button"
                    role="option"
                    className={cn(
                      "flex w-full min-h-[48px] flex-col gap-1.5 px-4 py-3 text-left transition-colors sm:min-h-0 sm:py-2.5",
                      "hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:outline-none"
                    )}
                    onClick={() => goToProperty(item.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        Property ID {refToken}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 text-[11px] font-medium capitalize", statusClass)}
                      >
                        {statusLabel}
                      </Badge>
                    </div>
                    <span className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {item.title}
                    </span>
                    {location ? (
                      <span className="text-xs text-muted-foreground">{location}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    ) : null;

  return (
    <div
      className="relative z-10 mb-8 w-full max-w-md animate-fade-in-up sm:mb-10"
      style={{ animationDelay: "0.25s" }}
    >
      <div ref={anchorRef} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) {
              setOpen(true);
              updatePanelPosition();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search by Property ID (e.g. 86)"
          autoComplete="off"
          aria-label="Search by Property ID"
          aria-expanded={showDropdown}
          aria-controls="property-id-search-results"
          className="h-11 rounded-xl border-white/25 bg-white/15 pl-10 pr-10 text-white placeholder:text-white/55 backdrop-blur-sm focus-visible:border-white/40 focus-visible:ring-white/30"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/70" />
        )}
      </div>

      {mounted && dropdownPanel ? createPortal(dropdownPanel, document.body) : null}
    </div>
  );
}
