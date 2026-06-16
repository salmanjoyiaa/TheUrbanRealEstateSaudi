"use client";

import { useState, useEffect } from "react";
import { isSameDay, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatTime } from "@/lib/format";
import { VisitDetailModal } from "@/components/visit/visit-detail-modal";
import { useVisitMutations } from "@/hooks/use-visit-mutations";
import {
  type AssignmentRow,
  type AssignedPropertyRow,
  type AssignmentHistoryItem,
  PIPELINE_STEPS,
  VISITING_STATUS_BADGE_CLASSES,
} from "@/types/visit-assignment";
import { getVisitStatusBadgeClass, getVisitStatusLabel } from "@/lib/visit-status";
import { cn } from "@/lib/utils";

export type { AssignmentRow, AssignedPropertyRow, AssignmentHistoryItem };

export function VisitingAgentClient({
  rows,
  assignedProperties,
  assignmentHistoryByVisit,
}: {
  rows: AssignmentRow[];
  assignedProperties: AssignedPropertyRow[];
  assignmentHistoryByVisit: Record<string, AssignmentHistoryItem[]>;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedVisit, setSelectedVisit] = useState<AssignmentRow | null>(null);
  const { loading, cancelVisit, rescheduleVisit, completeVisit } = useVisitMutations();

  useEffect(() => {
    setSelectedVisit((current) => {
      if (!current) return null;
      return rows.find((r) => r.id === current.id) ?? null;
    });
  }, [rows]);

  const selectedDateVisits = rows
    .filter((row) => (date ? isSameDay(parseISO(row.visit_date), date) : false))
    .sort((a, b) => String(a.visit_time).localeCompare(String(b.visit_time)));

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <div className="md:col-span-4 lg:col-span-4">
        <div className="space-y-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view assignments.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
                modifiers={{ booked: rows.map((r) => parseISO(r.visit_date)) }}
                modifiersClassNames={{
                  booked: "font-bold text-primary underline underline-offset-4 decoration-primary",
                }}
              />
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Assigned Properties</CardTitle>
              <CardDescription>Properties currently assigned by admin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {assignedProperties.length === 0 ? (
                <p className="text-muted-foreground">No assigned properties found.</p>
              ) : (
                assignedProperties.map((property) => (
                  <div key={property.id} className="rounded-md border p-2">
                    <div className="font-medium">{property.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Property ID: {property.property_ref || "Not set"}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="md:col-span-8 lg:col-span-8">
        <h2 className="mb-4 text-xl font-semibold text-navy">
          Assignments on {date ? formatDate(date) : "Selected Date"}
        </h2>

        {selectedDateVisits.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            No visits assigned for this date.
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateVisits.map((visit) => {
              const statusClass =
                VISITING_STATUS_BADGE_CLASSES[visit.visiting_status] ||
                getVisitStatusBadgeClass(visit.status);
              return (
                <button
                  key={visit.id}
                  type="button"
                  onClick={() => setSelectedVisit(visit)}
                  className="flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <div className="w-16 shrink-0 text-center">
                    <p className="text-sm font-bold text-navy">{formatTime(visit.visit_time)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">
                      {visit.properties?.title || "Unknown Property"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{visit.visitor_name}</p>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", statusClass)}>
                    {PIPELINE_STEPS[visit.visiting_status] || getVisitStatusLabel(visit.status)}
                  </Badge>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </div>

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
