"use client";

import { useMemo, useState, useEffect } from "react";
import { format, isSameDay, parseISO, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/format";
import { VisitDetailModal } from "@/components/visit/visit-detail-modal";
import { useVisitMutations } from "@/hooks/use-visit-mutations";
import {
  type AssignmentRow,
  type AssignedPropertyRow,
  type AssignmentHistoryItem,
  PIPELINE_STEPS,
  VISITING_STATUS_BADGE_CLASSES,
} from "@/types/visit-assignment";
import { cn } from "@/lib/utils";

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_MINUTES = 30;

function timeToRowIndex(time: string): number {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  const totalMinutes = (h - START_HOUR) * 60 + m;
  return Math.floor(totalMinutes / SLOT_MINUTES);
}

function generateTimeLabels(): string[] {
  const labels: string[] = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    labels.push(`${String(h).padStart(2, "0")}:00`);
    labels.push(`${String(h).padStart(2, "0")}:30`);
  }
  return labels;
}

const TIME_LABELS = generateTimeLabels();
const ROW_COUNT = TIME_LABELS.length;

type VisitDayBoardProps = {
  rows: AssignmentRow[];
  assignedProperties: AssignedPropertyRow[];
  assignmentHistoryByVisit: Record<string, AssignmentHistoryItem[]>;
};

export function VisitDayBoard({
  rows,
  assignedProperties,
  assignmentHistoryByVisit,
}: VisitDayBoardProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedVisit, setSelectedVisit] = useState<AssignmentRow | null>(null);
  const { loading, cancelVisit, rescheduleVisit, completeVisit } = useVisitMutations();

  useEffect(() => {
    setSelectedVisit((current) => {
      if (!current) return null;
      return rows.find((r) => r.id === current.id) ?? null;
    });
  }, [rows]);

  const dayVisits = useMemo(
    () =>
      rows
        .filter((row) => isSameDay(parseISO(row.visit_date), date))
        .sort((a, b) => String(a.visit_time).localeCompare(String(b.visit_time))),
    [rows, date]
  );

  const columns = useMemo(() => {
    const propertyMap = new Map<string, AssignedPropertyRow>();
    for (const p of assignedProperties) {
      propertyMap.set(p.id, p);
    }
    for (const visit of dayVisits) {
      if (visit.property_id && !propertyMap.has(visit.property_id)) {
        propertyMap.set(visit.property_id, {
          id: visit.property_id,
          title: visit.properties?.title || "Property",
          property_ref: visit.properties?.property_ref || null,
        });
      }
    }
    return Array.from(propertyMap.values());
  }, [assignedProperties, dayVisits]);

  const visitsByProperty = useMemo(() => {
    const map = new Map<string, AssignmentRow[]>();
    for (const col of columns) {
      map.set(col.id, []);
    }
    for (const visit of dayVisits) {
      const list = map.get(visit.property_id) || [];
      list.push(visit);
      map.set(visit.property_id, list);
    }
    return map;
  }, [columns, dayVisits]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setDate(subDays(date, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[180px] justify-start gap-2">
                <CalendarDays className="h-4 w-4" />
                {format(date, "EEEE, MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => setDate(addDays(date, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>
            Today
          </Button>
        </div>
        <Badge variant="secondary">{dayVisits.length} visit{dayVisits.length === 1 ? "" : "s"}</Badge>
      </div>

      {columns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No assigned properties. Contact admin to get property assignments.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <div
            className="grid min-w-[640px]"
            style={{ gridTemplateColumns: `64px repeat(${columns.length}, minmax(180px, 1fr))` }}
          >
            <div className="border-b border-r bg-muted/30 p-2" />
            {columns.map((col) => (
              <div key={col.id} className="border-b border-r bg-muted/30 p-3 last:border-r-0">
                <p className="truncate text-sm font-semibold text-navy">{col.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {col.property_ref ? `ID ${col.property_ref}` : "No ref"}
                </p>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {(visitsByProperty.get(col.id) || []).length} today
                </Badge>
              </div>
            ))}

            <div className="relative border-r bg-muted/10">
              {TIME_LABELS.map((label, idx) => (
                <div
                  key={label}
                  className="border-b px-2 py-1 text-[10px] text-muted-foreground"
                  style={{ height: 48 }}
                >
                  {idx % 2 === 0 ? label : ""}
                </div>
              ))}
            </div>

            {columns.map((col) => {
              const visits = visitsByProperty.get(col.id) || [];
              return (
                <div key={col.id} className="relative border-r last:border-r-0" style={{ height: ROW_COUNT * 48 }}>
                  {TIME_LABELS.map((_, idx) => (
                    <div key={idx} className="border-b" style={{ height: 48 }} />
                  ))}
                  {visits.map((visit) => {
                    const rowIdx = timeToRowIndex(String(visit.visit_time));
                    if (rowIdx < 0 || rowIdx >= ROW_COUNT) return null;
                    const badgeClass = VISITING_STATUS_BADGE_CLASSES[visit.visiting_status] || "bg-blue-50 text-blue-800";
                    return (
                      <button
                        key={visit.id}
                        type="button"
                        onClick={() => setSelectedVisit(visit)}
                        className={cn(
                          "absolute left-1 right-1 z-10 cursor-pointer rounded-md border px-2 py-1.5 text-left shadow-sm transition hover:shadow-md",
                          badgeClass
                        )}
                        style={{ top: rowIdx * 48 + 2, minHeight: 44 }}
                      >
                        <p className="truncate text-xs font-semibold">{formatTime(visit.visit_time)}</p>
                        <p className="truncate text-[11px]">{visit.visitor_name}</p>
                        <p className="truncate text-[10px] opacity-80">
                          {PIPELINE_STEPS[visit.visiting_status] || visit.visiting_status}
                        </p>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
