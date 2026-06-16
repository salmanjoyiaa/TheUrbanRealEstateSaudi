"use client";

import { cn } from "@/lib/utils";

const PHASES = [
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Visit completed" },
  { id: "closed", label: "Closed" },
] as const;

type PhaseId = (typeof PHASES)[number]["id"];

function getPhase(currentStatus: string, bookingStatus?: string): PhaseId {
  if (bookingStatus === "cancelled" || currentStatus === "deal_fail") {
    return "closed";
  }
  if (currentStatus === "deal_close" || currentStatus === "commission_got") {
    return "closed";
  }
  if (
    currentStatus === "visit_done" ||
    currentStatus === "customer_remarks" ||
    currentStatus === "deal_pending"
  ) {
    return "completed";
  }
  return "scheduled";
}

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

  const currentPhase = getPhase(currentStatus, bookingStatus);
  const currentIdx = PHASES.findIndex((p) => p.id === currentPhase);

  let closedLabel = "Closed";
  if (currentStatus === "deal_fail") closedLabel = "No deal";
  else if (currentStatus === "deal_close" || currentStatus === "commission_got") closedLabel = "Deal closed";
  else if (currentStatus === "deal_pending") closedLabel = "Deal pending";

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visit progress</p>
      <div className="flex gap-2">
        {PHASES.map((phase, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const label = phase.id === "closed" && isCurrent ? closedLabel : phase.label;
          return (
            <div
              key={phase.id}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors",
                isDone && "bg-green-100 text-green-800",
                isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                !isDone && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
