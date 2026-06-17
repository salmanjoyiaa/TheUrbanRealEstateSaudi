"use client";

import { useState, useEffect } from "react";
import { VisitScheduleTable } from "@/components/visit/visit-schedule-table";
import { VisitDetailModal } from "@/components/visit/visit-detail-modal";
import { useVisitMutations } from "@/hooks/use-visit-mutations";
import type {
  AssignmentRow,
  AssignedPropertyRow,
  AssignmentHistoryItem,
} from "@/types/visit-assignment";

type VisitDayBoardProps = {
  rows: AssignmentRow[];
  assignedProperties: AssignedPropertyRow[];
  assignmentHistoryByVisit: Record<string, AssignmentHistoryItem[]>;
};

export function VisitDayBoard({
  rows,
  assignmentHistoryByVisit,
}: VisitDayBoardProps) {
  const [date, setDate] = useState(new Date());
  const [selectedVisit, setSelectedVisit] = useState<AssignmentRow | null>(null);
  const { loading, cancelVisit, rescheduleVisit, completeVisit } = useVisitMutations();

  useEffect(() => {
    setSelectedVisit((current) => {
      if (!current) return null;
      return rows.find((r) => r.id === current.id) ?? null;
    });
  }, [rows]);

  return (
    <>
      <VisitScheduleTable
        rows={rows}
        date={date}
        onDateChange={setDate}
        onSelectVisit={setSelectedVisit}
      />
      <VisitDetailModal
        visit={selectedVisit}
        open={!!selectedVisit}
        onOpenChange={(open) => !open && setSelectedVisit(null)}
        assignmentHistory={selectedVisit ? assignmentHistoryByVisit[selectedVisit.id] || [] : []}
        loading={loading}
        onCancel={cancelVisit}
        onReschedule={rescheduleVisit}
        onCompleteVisit={completeVisit}
      />
    </>
  );
}
