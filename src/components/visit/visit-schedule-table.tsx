"use client";

import { useMemo } from "react";
import { format, isSameDay, parseISO, addDays, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, ChevronRight as ChevronRightIcon } from "lucide-react";
import { VisitActionIcons } from "@/components/visit/visit-action-icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/format";
import {
  type AssignmentRow,
  PIPELINE_STEPS,
  VISITING_STATUS_BADGE_CLASSES,
  isCancelRequestPending,
} from "@/types/visit-assignment";
import { getVisitStatusBadgeClass, getVisitStatusLabel } from "@/lib/visit-status";
import { cn } from "@/lib/utils";

type VisitScheduleTableProps = {
  rows: AssignmentRow[];
  date: Date;
  onDateChange: (date: Date) => void;
  onSelectVisit: (visit: AssignmentRow) => void;
  showDateNav?: boolean;
};

function statusLabel(visit: AssignmentRow) {
  if (isCancelRequestPending(visit)) return "Cancel pending";
  return PIPELINE_STEPS[visit.visiting_status] || getVisitStatusLabel(visit.status);
}

function statusClass(visit: AssignmentRow) {
  if (isCancelRequestPending(visit)) return "border-orange-200 bg-orange-50 text-orange-800";
  return VISITING_STATUS_BADGE_CLASSES[visit.visiting_status] || getVisitStatusBadgeClass(visit.status);
}

export function VisitScheduleTable({
  rows,
  date,
  onDateChange,
  onSelectVisit,
  showDateNav = true,
}: VisitScheduleTableProps) {
  const dayVisits = useMemo(
    () =>
      rows
        .filter((row) => isSameDay(parseISO(row.visit_date), date))
        .sort((a, b) => String(a.visit_time).localeCompare(String(b.visit_time))),
    [rows, date]
  );

  return (
    <div className="space-y-4">
      {showDateNav && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => onDateChange(subDays(date, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-h-10 min-w-[160px] justify-start gap-2 text-sm sm:min-w-[200px]">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span className="truncate">{format(date, "EEE, MMM d, yyyy")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={(d) => d && onDateChange(d)} />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => onDateChange(addDays(date, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="min-h-10" onClick={() => onDateChange(new Date())}>
              Today
            </Button>
          </div>
          <Badge variant="secondary">
            {dayVisits.length} visit{dayVisits.length === 1 ? "" : "s"}
          </Badge>
        </div>
      )}

      {dayVisits.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-muted-foreground">
          No visits assigned for this date.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dayVisits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30"
                    onClick={() => onSelectVisit(visit)}
                  >
                    <td className="px-4 py-3 font-semibold text-navy whitespace-nowrap">{formatTime(visit.visit_time)}</td>
                    <td className="max-w-[200px] px-4 py-3">
                      <p className="truncate">{visit.properties?.title || "—"}</p>
                      {visit.properties?.property_ref && (
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          ID {visit.properties.property_ref}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{visit.visitor_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{visit.visitor_phone}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-xs", statusClass(visit))}>
                        {statusLabel(visit)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <VisitActionIcons visit={visit} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {dayVisits.map((visit) => (
              <div
                key={visit.id}
                className="rounded-xl border bg-white p-4 shadow-sm active:bg-muted/20"
              >
                <button
                  type="button"
                  onClick={() => onSelectVisit(visit)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-navy">{formatTime(visit.visit_time)}</span>
                    <Badge variant="outline" className={cn("shrink-0 text-[10px]", statusClass(visit))}>
                      {statusLabel(visit)}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate font-medium text-navy">{visit.properties?.title || "Unknown Property"}</p>
                  {visit.properties?.property_ref && (
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      ID {visit.properties.property_ref}
                    </p>
                  )}
                  <p className="truncate text-sm text-muted-foreground">{visit.visitor_name}</p>
                  <p className="truncate text-sm text-muted-foreground">{visit.visitor_phone}</p>
                </button>
                <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                  <VisitActionIcons visit={visit} onDetails={() => onSelectVisit(visit)} />
                  <Button variant="ghost" size="sm" className="min-h-9 text-xs" onClick={() => onSelectVisit(visit)}>
                    Details
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function VisitDateNav({
  date,
  onDateChange,
  visitCount,
  bookedDates,
}: {
  date: Date;
  onDateChange: (date: Date) => void;
  visitCount: number;
  bookedDates?: Date[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => onDateChange(subDays(date, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-h-10 flex-1 justify-start gap-2 px-3 text-sm sm:min-w-[180px] sm:flex-none">
              <CalendarDays className="h-4 w-4 shrink-0" />
              {format(date, "EEE, MMM d")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && onDateChange(d)}
              modifiers={bookedDates ? { booked: bookedDates } : undefined}
              modifiersClassNames={bookedDates ? { booked: "font-bold text-primary underline" } : undefined}
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => onDateChange(addDays(date, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Badge variant="secondary">{visitCount} visit{visitCount === 1 ? "" : "s"}</Badge>
    </div>
  );
}
