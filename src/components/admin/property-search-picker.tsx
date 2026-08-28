"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPropertyRefDisplay } from "@/lib/format";
import { cn } from "@/lib/utils";

type PropertySearchResult = {
  id: string;
  property_ref: string | null;
  title: string;
  status: string;
  city: string;
  district: string | null;
};

export type PropertySearchSelection = {
  id: string;
  propertyRef: string;
  propertyName: string;
};

type PropertySearchPickerProps = {
  onSelect: (selection: PropertySearchSelection) => void;
  onClear?: () => void;
  selectedLabel?: string | null;
  searchLabel: string;
  clearLabel: string;
  placeholder: string;
  className?: string;
};

export function PropertySearchPicker({
  onSelect,
  onClear,
  selectedLabel,
  searchLabel,
  clearLabel,
  placeholder,
  className,
}: PropertySearchPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PropertySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (result: PropertySearchResult) => {
      onSelect({
        id: result.id,
        propertyRef: result.property_ref || "",
        propertyName: result.title,
      });
      setQuery("");
      setResults([]);
      setOpen(false);
    },
    [onSelect]
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
        const json = (await res.json()) as { data?: PropertySearchResult[] };
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
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="min-h-11 pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={searchLabel}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {open && query.trim().length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            {results.length === 0 && !loading ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No properties found</p>
            ) : (
              <ul className="max-h-56 overflow-y-auto py-1">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-muted"
                      onClick={() => handleSelect(result)}
                    >
                      <span className="text-sm font-medium">
                        {formatPropertyRefDisplay(result.property_ref)}
                      </span>
                      <span className="text-xs text-muted-foreground">{result.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {selectedLabel ? (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {selectedLabel}
          </Badge>
          {onClear ? (
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2" onClick={onClear}>
              <X className="h-3.5 w-3.5" />
              {clearLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
