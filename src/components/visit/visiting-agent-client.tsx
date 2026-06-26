"use client";

import { useState, useEffect, useMemo } from "react";
import { isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitDetailModal } from "@/components/visit/visit-detail-modal";
import { VisitScheduleTable, VisitDateNav } from "@/components/visit/visit-schedule-table";
import { VisitPropertyRefFilter } from "@/components/visit/visit-property-ref-filter";
import { useVisitMutations } from "@/hooks/use-visit-mutations";
import { useVisitMessageTemplates } from "@/hooks/use-visit-message-templates";
import { matchesPropertyRef } from "@/lib/property-ref";
import {
  type AssignmentRow,
  type AssignedPropertyRow,
  type AssignmentHistoryItem,
} from "@/types/visit-assignment";

export type { AssignmentRow, AssignedPropertyRow, AssignmentHistoryItem };

export function VisitingAgentClient({
  rows,
  assignedProperties,
  assignmentHistoryByVisit,
  agentName,
}: {
  rows: AssignmentRow[];
  assignedProperties: AssignedPropertyRow[];
  assignmentHistoryByVisit: Record<string, AssignmentHistoryItem[]>;
  agentName: string;
}) {
  const [date, setDate] = useState(new Date());
  const [propertyRefQuery, setPropertyRefQuery] = useState("");
  const [selectedVisit, setSelectedVisit] = useState<AssignmentRow | null>(null);
  const { loading, cancelVisit, rescheduleVisit, completeVisit } = useVisitMutations();
  const { templates, loading: templatesLoading } = useVisitMessageTemplates();

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => matchesPropertyRef(row.properties?.property_ref, propertyRefQuery)),
    [rows, propertyRefQuery]
  );

  const filteredAssignedProperties = useMemo(
    () =>
      assignedProperties.filter((p) => matchesPropertyRef(p.property_ref, propertyRefQuery)),
    [assignedProperties, propertyRefQuery]
  );

  const bookedDates = useMemo(() => filteredRows.map((r) => parseISO(r.visit_date)), [filteredRows]);

  const selectedDateVisits = useMemo(
    () =>
      filteredRows
        .filter((row) => isSameDay(parseISO(row.visit_date), date))
        .sort((a, b) => String(a.visit_time).localeCompare(String(b.visit_time))),
    [filteredRows, date]
  );

  useEffect(() => {
    setSelectedVisit((current) => {
      if (!current) return null;
      return filteredRows.find((r) => r.id === current.id) ?? null;
    });
  }, [filteredRows]);

  return (
    <div className="space-y-4 md:space-y-6">
      <VisitPropertyRefFilter
        value={propertyRefQuery}
        onChange={setPropertyRefQuery}
        matchCount={filteredRows.length}
        totalCount={rows.length}
      />

      <div className="md:hidden">
        <VisitDateNav
          date={date}
          onDateChange={setDate}
          visitCount={selectedDateVisits.length}
          bookedDates={bookedDates}
        />
        <div className="mt-4">
          <VisitScheduleTable
            rows={filteredRows}
            date={date}
            onDateChange={setDate}
            onSelectVisit={setSelectedVisit}
            showDateNav={false}
            agentName={agentName}
            templates={templates}
            templatesLoading={templatesLoading}
          />
        </div>

        <details className="mt-6 rounded-xl border bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-navy">
            Assigned properties ({filteredAssignedProperties.length})
          </summary>
          <div className="space-y-2 border-t px-4 py-3 text-sm">
            {filteredAssignedProperties.length === 0 ? (
              <p className="text-muted-foreground">No assigned properties found.</p>
            ) : (
              filteredAssignedProperties.map((property) => (
                <div key={property.id} className="rounded-md border p-2">
                  <div className="font-medium">{property.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Property ID: {property.property_ref || "Not set"}
                  </div>
                </div>
              ))
            )}
          </div>
        </details>
      </div>

      <div className="hidden md:grid md:grid-cols-12 md:gap-6">
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
                  onSelect={(d) => d && setDate(d)}
                  className="rounded-md border shadow"
                  modifiers={{ booked: bookedDates }}
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
                {filteredAssignedProperties.length === 0 ? (
                  <p className="text-muted-foreground">No assigned properties found.</p>
                ) : (
                  filteredAssignedProperties.map((property) => (
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
          <VisitScheduleTable
            rows={filteredRows}
            date={date}
            onDateChange={setDate}
            onSelectVisit={setSelectedVisit}
            agentName={agentName}
            templates={templates}
            templatesLoading={templatesLoading}
          />
        </div>
      </div>

      <VisitDetailModal
        visit={selectedVisit}
        open={!!selectedVisit}
        onOpenChange={(open) => !open && setSelectedVisit(null)}
        assignmentHistory={selectedVisit ? assignmentHistoryByVisit[selectedVisit.id] || [] : []}
        agentName={agentName}
        templates={templates}
        templatesLoading={templatesLoading}
        loading={loading}
        onCancel={cancelVisit}
        onReschedule={rescheduleVisit}
        onCompleteVisit={completeVisit}
      />
    </div>
  );
}
