"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type VisitPropertyRefFilterProps = {
  value: string;
  onChange: (value: string) => void;
  matchCount?: number;
  totalCount?: number;
};

export function VisitPropertyRefFilter({
  value,
  onChange,
  matchCount,
  totalCount,
}: VisitPropertyRefFilterProps) {
  return (
    <div className="space-y-1">
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by Property ID e.g. 45"
          className="h-9 pl-9 pr-9"
        />
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9"
            onClick={() => onChange("")}
            aria-label="Clear property search"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      {value && matchCount !== undefined && totalCount !== undefined ? (
        <p className="text-xs text-muted-foreground">
          {matchCount} of {totalCount} visit{totalCount === 1 ? "" : "s"} match Property ID &quot;{value}&quot;
        </p>
      ) : null}
    </div>
  );
}
