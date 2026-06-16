"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { SlotGrid } from "@/components/visit/slot-grid";
import { useVisitSlots } from "@/queries/visits";
import {
  getVisitBookingMaxDate,
  getVisitBookingMinDate,
  isWithinVisitBookingWindow,
} from "@/lib/slots";
import { VISIT_BOOKING_WINDOW_DAYS } from "@/lib/constants";

type VisitReschedulePanelProps = {
  propertyId: string;
  onSubmit: (data: { reason: string; visit_date: string; visit_time: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function VisitReschedulePanel({ propertyId, onSubmit, onCancel, loading }: VisitReschedulePanelProps) {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string | null>(null);

  const dateKey = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date]);
  const { data: slots = [], isLoading: loadingSlots } = useVisitSlots(propertyId, dateKey, !!dateKey);
  const availableSlots = useMemo(() => slots.filter((s) => s.available), [slots]);

  useEffect(() => {
    setSlot(null);
  }, [dateKey]);

  const minDate = getVisitBookingMinDate(new Date());
  const maxDate = getVisitBookingMaxDate(new Date(), VISIT_BOOKING_WINDOW_DAYS);
  const isDateDisabled = (day: Date) => !isWithinVisitBookingWindow(day, new Date(), VISIT_BOOKING_WINDOW_DAYS);

  const canSubmit = reason.trim().length >= 3 && dateKey && slot;

  return (
    <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Reschedule visit</p>
        <p className="text-xs text-muted-foreground">Pick a new date and time. The customer will be notified immediately.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reschedule-reason">Reason</Label>
        <Textarea
          id="reschedule-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this visit being rescheduled?"
          rows={2}
          className="resize-none bg-white"
        />
      </div>
      <div className="space-y-2">
        <Label>New date</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={isDateDisabled}
          fromDate={minDate}
          toDate={maxDate}
          className="rounded-md border bg-white"
        />
      </div>
      {dateKey && (
        <div className="space-y-2">
          <Label>New time slot</Label>
          {loadingSlots ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading slots...
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No slots available on this day.</p>
          ) : (
            <SlotGrid slots={availableSlots} selectedSlot={slot} onSelect={setSlot} />
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
          Back
        </Button>
        <Button
          size="sm"
          onClick={() => canSubmit && onSubmit({ reason: reason.trim(), visit_date: dateKey, visit_time: slot! })}
          disabled={!canSubmit || loading}
        >
          {loading ? "Rescheduling..." : "Confirm reschedule"}
        </Button>
      </div>
    </div>
  );
}
