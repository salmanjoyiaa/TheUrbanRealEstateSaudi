"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useVisitMutations() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const cancelVisit = useCallback(async (visitId: string, reason: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", cancellation_reason: reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel visit");
      }
      toast.success("Cancel request submitted");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const rescheduleVisit = useCallback(async (
    visitId: string,
    data: { reason: string; visit_date: string; visit_time: string }
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reschedule",
          reschedule_reason: data.reason,
          visit_date: data.visit_date,
          visit_time: data.visit_time,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reschedule visit");
      }
      toast.success("Visit rescheduled");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const completeVisit = useCallback(async (
    visitId: string,
    payload: {
      customer_remarks?: string;
      deal_outcome: "no_deal" | "deal_pending" | "deal_closed";
      commission_amount?: number;
    }
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_visit",
          ...payload,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to complete visit");
      }
      toast.success("Visit completed");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const updateStatus = useCallback(async (
    visitId: string,
    status: string,
    extra?: Record<string, string | number>
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visiting_status: status,
          ...(extra || {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update visit");
      }
      toast.success("Visit updated");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return { loading, cancelVisit, rescheduleVisit, updateStatus, completeVisit };
}
