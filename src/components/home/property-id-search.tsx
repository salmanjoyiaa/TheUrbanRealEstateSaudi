"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

export function PropertyIdSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToProperty = useCallback(
    (id: string) => {
      setOpen(false);
      setQuery("");
      router.push(`/properties/${id}`);
    },
    [router]
  );

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

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Enter" && results.length === 1) {
      e.preventDefault();
      goToProperty(results[0].id);
    }
    if (e.key === "Enter" && results.length > 1) {
      setOpen(true);
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className="relative mb-8 w-full max-w-md animate-fade-in-up sm:mb-10"
      style={{ animationDelay: "0.25s" }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setOpen(true)}
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

      {showDropdown && (
        <div
          id="property-id-search-results"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/20 bg-white shadow-xl"
        >
          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No properties found</p>
          )}
          <ul className="max-h-72 overflow-y-auto py-1">
            {results.map((item) => {
              const ref = item.property_ref || "—";
              const statusLabel = STATUS_LABEL[item.status] ?? item.status;
              const location = [item.city, item.district?.trim()].filter(Boolean).join(", ");
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    className={cn(
                      "flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors",
                      "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    )}
                    onClick={() => goToProperty(item.id)}
                  >
                    <span className="text-sm font-bold text-foreground">Property ID #{ref}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {statusLabel}
                      {location ? ` · ${location}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
