"use client";

import { cn } from "@/lib/utils";
import { PIPELINE_STEPS } from "@/types/visit-assignment";

const PIPELINE_ORDER = [
  "view",
  "contact_done",
  "customer_confirmed",
  "customer_arrived",
  "visit_done",
  "customer_remarks",
  "deal_pending",
  "commission_got",
  "deal_close",
] as const;

type VisitPipelineProgressProps = {
  currentStatus: string;
  bookingStatus?: string;
  className?: string;
};

export function VisitPipelineProgress({ currentStatus, bookingStatus, className }: VisitPipelineProgressProps) {
  if (bookingStatus === "cancelled") {
    return (
      <div className={cn("rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800", className)}>
        Visit cancelled
      </div>
    );
  }

  if (currentStatus === "deal_fail") {
    return (
      <div className={cn("rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800", className)}>
        Deal failed
      </div>
    );
  }

  const currentIdx = PIPELINE_ORDER.indexOf(currentStatus as (typeof PIPELINE_ORDER)[number]);

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visit progress</p>
      <div className="flex flex-wrap gap-1.5">
        {PIPELINE_ORDER.slice(0, -1).map((step, idx) => {
          const isDone = currentIdx > idx || currentStatus === "deal_close";
          const isCurrent = currentStatus === step;
          return (
            <div
              key={step}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                isDone && "bg-green-100 text-green-800",
                isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                !isDone && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {PIPELINE_STEPS[step] || step}
            </div>
          );
        })}
      </div>
    </div>
  );
}
