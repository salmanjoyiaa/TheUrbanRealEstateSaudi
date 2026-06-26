"use client";

import { useState, useEffect, useMemo } from "react";
import { VisitScheduleTable } from "@/components/visit/visit-schedule-table";
import { VisitDetailModal } from "@/components/visit/visit-detail-modal";
import { VisitPropertyRefFilter } from "@/components/visit/visit-property-ref-filter";
import { useVisitMutations } from "@/hooks/use-visit-mutations";
import { matchesPropertyRef } from "@/lib/property-ref";
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
  const [propertyRefQuery, setPropertyRefQuery] = useState("");
  const [selectedVisit, setSelectedVisit] = useState<AssignmentRow | null>(null);
  const { loading, cancelVisit, rescheduleVisit, completeVisit } = useVisitMutations();

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => matchesPropertyRef(row.properties?.property_ref, propertyRefQuery)),
    [rows, propertyRefQuery]
  );

  useEffect(() => {
    setSelectedVisit((current) => {
      if (!current) return null;
      return filteredRows.find((r) => r.id === current.id) ?? null;
    });
  }, [filteredRows]);

  return (
    <div className="space-y-4">
      <VisitPropertyRefFilter
        value={propertyRefQuery}
        onChange={setPropertyRefQuery}
        matchCount={filteredRows.length}
        totalCount={rows.length}
      />
      <VisitScheduleTable
        rows={filteredRows}
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
    </div>
  );
}
