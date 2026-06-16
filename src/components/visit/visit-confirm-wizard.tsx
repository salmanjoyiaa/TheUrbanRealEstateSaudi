"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PIPELINE_STEPS } from "@/types/visit-assignment";
import type { AssignmentRow } from "@/types/visit-assignment";

type VisitConfirmWizardProps = {
  visit: AssignmentRow;
  onStatusUpdate: (status: string, extra?: Record<string, string | number>) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
};

export function VisitConfirmWizard({ visit, onStatusUpdate, onClose, loading }: VisitConfirmWizardProps) {
  const [remarks, setRemarks] = useState(visit.customer_remarks || "");
  const [commissionAmount, setCommissionAmount] = useState("");

  const status = visit.visiting_status;
  const amount = Number(commissionAmount);
  const canSubmitCommission = Number.isFinite(amount) && amount > 0;

  const renderStep = () => {
    if (status === "view") {
      return (
        <WizardStep
          title="Contact customer"
          description="Confirm you have contacted the customer about this visit."
          actionLabel="Mark contact done"
          onAction={() => onStatusUpdate("contact_done")}
          loading={loading}
        />
      );
    }
    if (status === "contact_done") {
      return (
        <WizardStep
          title="Customer confirmed"
          description="Confirm the customer will attend at the scheduled time."
          actionLabel="Customer confirmed"
          onAction={() => onStatusUpdate("customer_confirmed")}
          loading={loading}
        />
      );
    }
    if (status === "customer_confirmed") {
      return (
        <WizardStep
          title="Customer arrived"
          description="Confirm the customer has arrived at the property."
          actionLabel="Customer arrived"
          onAction={() => onStatusUpdate("customer_arrived")}
          loading={loading}
        />
      );
    }
    if (status === "customer_arrived") {
      return (
        <WizardStep
          title="Complete visit"
          description="Mark the property visit as completed."
          actionLabel="Mark visit done"
          onAction={() => onStatusUpdate("visit_done")}
          loading={loading}
        />
      );
    }
    if (status === "visit_done") {
      return (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Customer remarks</p>
            <p className="text-xs text-muted-foreground">Record feedback from the customer after the visit.</p>
          </div>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter customer feedback..."
            rows={3}
            className="resize-none bg-white"
          />
          <Button
            size="sm"
            onClick={() => onStatusUpdate("customer_remarks", { customer_remarks: remarks })}
            disabled={!remarks.trim() || loading}
          >
            {loading ? "Saving..." : "Save remarks & continue"}
          </Button>
        </div>
      );
    }
    if (status === "customer_remarks") {
      return (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Deal outcome</p>
            <p className="text-xs text-muted-foreground">Is this visit leading to a deal?</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onStatusUpdate("deal_pending")} disabled={loading}>
              Deal pending
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onStatusUpdate("deal_fail")} disabled={loading}>
              Deal failed
            </Button>
          </div>
        </div>
      );
    }
    if (status === "deal_pending") {
      return (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Commission received</p>
            <p className="text-xs text-muted-foreground">Enter the commission amount received for this deal.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="commission-amount">Amount (SAR)</Label>
            <Input
              id="commission-amount"
              type="number"
              min="0"
              step="0.01"
              value={commissionAmount}
              onChange={(e) => setCommissionAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="bg-white"
            />
          </div>
          <Button
            size="sm"
            className="text-green-700"
            variant="outline"
            onClick={() => onStatusUpdate("commission_got", { commission_received_amount: amount })}
            disabled={!canSubmitCommission || loading}
          >
            {loading ? "Saving..." : "Confirm commission received"}
          </Button>
        </div>
      );
    }
    if (status === "commission_got") {
      return (
        <WizardStep
          title="Close deal"
          description="Finalize and close this successful deal."
          actionLabel="Close deal"
          onAction={() => onStatusUpdate("deal_close")}
          loading={loading}
        />
      );
    }
    return (
      <p className="text-sm text-muted-foreground">
        Visit is at stage: {PIPELINE_STEPS[status] || status}. No further actions needed.
      </p>
    );
  };

  return (
    <div className="space-y-3 rounded-lg border border-green-200 bg-green-50/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Confirm visit progress</p>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
          Close
        </Button>
      </div>
      {renderStep()}
    </div>
  );
}

function WizardStep({
  title,
  description,
  actionLabel,
  onAction,
  loading,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  loading?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button size="sm" onClick={onAction} disabled={loading}>
        {loading ? "Updating..." : actionLabel}
      </Button>
    </div>
  );
}
