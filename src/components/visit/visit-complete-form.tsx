"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type DealOutcome = "no_deal" | "deal_pending" | "deal_closed";

export type CompleteVisitPayload = {
  customer_remarks?: string;
  deal_outcome: DealOutcome;
  commission_amount?: number;
};

type VisitCompleteFormProps = {
  onSubmit: (payload: CompleteVisitPayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialRemarks?: string | null;
};

const OUTCOME_OPTIONS: { value: DealOutcome; label: string; description: string }[] = [
  {
    value: "no_deal",
    label: "No deal",
    description: "Visit done but customer is not proceeding",
  },
  {
    value: "deal_pending",
    label: "Deal pending",
    description: "Customer is interested — deal still in progress",
  },
  {
    value: "deal_closed",
    label: "Commission received",
    description: "Deal closed and commission collected",
  },
];

export function VisitCompleteForm({
  onSubmit,
  onCancel,
  loading,
  initialRemarks,
}: VisitCompleteFormProps) {
  const [remarks, setRemarks] = useState(initialRemarks || "");
  const [dealOutcome, setDealOutcome] = useState<DealOutcome>("deal_pending");
  const [commissionAmount, setCommissionAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amount = Number(commissionAmount);
  const canSubmitCommission = Number.isFinite(amount) && amount > 0;

  const handleSubmit = async () => {
    setError(null);

    if (dealOutcome === "deal_closed" && !canSubmitCommission) {
      setError("Enter the commission amount received.");
      return;
    }

    await onSubmit({
      customer_remarks: remarks.trim() || undefined,
      deal_outcome: dealOutcome,
      ...(dealOutcome === "deal_closed" ? { commission_amount: amount } : {}),
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-green-200 bg-green-50/50 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Complete visit</p>
        <p className="text-xs text-muted-foreground">
          Record how the visit went and the deal outcome in one step.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="complete-remarks">Customer remarks (optional)</Label>
        <Textarea
          id="complete-remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Any feedback from the customer..."
          rows={3}
          className="resize-none bg-white"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label>Deal outcome</Label>
        <div className="space-y-2">
          {OUTCOME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDealOutcome(option.value)}
              disabled={loading}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                dealOutcome === option.value
                  ? "border-primary bg-white ring-2 ring-primary/20"
                  : "border-border bg-white hover:border-primary/40"
              )}
            >
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {dealOutcome === "deal_closed" && (
        <div className="space-y-2">
          <Label htmlFor="complete-commission">Commission received (SAR)</Label>
          <Input
            id="complete-commission"
            type="number"
            min="0"
            step="0.01"
            value={commissionAmount}
            onChange={(e) => setCommissionAmount(e.target.value)}
            placeholder="e.g. 5000"
            className="bg-white"
            disabled={loading}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
          Back
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={loading} className="flex-1">
          {loading ? "Finishing..." : "Finish visit"}
        </Button>
      </div>
    </div>
  );
}
