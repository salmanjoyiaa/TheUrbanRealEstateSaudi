"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, FileText, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { VisitRowActions } from "@/components/admin/visit-row-actions";
import { RescheduleReviewActions } from "@/components/admin/reschedule-review-actions";
import { CancelReviewActions } from "@/components/admin/cancel-review-actions";
import {
  formatDate,
  formatTime,
  formatMessageDate,
  formatMessageTime,
  formatMonthDayYearWithComma,
} from "@/lib/format";
import { VISIT_STATUS_LABELS, getVisitStatusBadgeClass } from "@/lib/visit-status";
import { cn } from "@/lib/utils";
import { ReceiptSlipDialog } from "@/components/visit/receipt-slip-dialog";
import { canGenerateReceiptSlip } from "@/lib/receipt-slip";

const PAGE_SIZE = 10;

export type AdminVisitRow = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_message?: string | null;
  request_source?: string | null;
  parent_visit_id?: string | null;
  reschedule_reason?: string | null;
  cancellation_reason?: string | null;
  cancellation_requested_at?: string | null;
  cancellation_reviewed_at?: string | null;
  visit_date: string;
  visit_time: string;
  status: string;
  visiting_status?: string | null;
  visiting_agent_id?: string | null;
  notification_sent_at?: string | null;
  commission_received_amount?: number | null;
  customer_remarks?: string | null;
  admin_notes?: string | null;
  properties: {
    title: string;
    id: string;
    property_ref: string | null;
    location_url: string | null;
    visiting_agent_image: string | null;
    visiting_agent_instructions: string | null;
    agents: {
      profiles: {
        full_name: string;
        phone: string | null;
      } | null;
    } | null;
  } | null;
  visiting_agent: {
    id: string;
    full_name: string;
    phone: string | null;
  } | null;
  busyAgentIds: string[];
};

type VisitingAgentOption = { id: string; name: string };

type ViewMode = "day" | "table";

function buildCustomerMessage(row: AdminVisitRow): string {
  const property = row.properties?.title || "the property";
  const propId = row.properties?.property_ref || "N/A";
  const date = formatMessageDate(row.visit_date);
  const time = formatMessageTime(row.visit_time);
  const vaName = row.visiting_agent?.full_name || "your assigned agent";
  const vaPhone = row.visiting_agent?.phone || "Not provided";
  const mapLink = row.properties?.location_url || "";

  const blocks = [
    `*Hello ${row.visitor_name},*`,
    "Thank you for choosing TheUrbanRealEstateSaudi!",
    `*We are pleased to inform you that your upcoming property visit for "${property}" has been officially confirmed.*`,
    "Your visit is scheduled on",
    `- *Property ID : ${propId}*`,
    `- *Date :* ${date}`,
    `- *Visiting Time :* ${time}`,
    `- *Visiting Agent :* *${vaName}*  *Contact :* ${vaPhone}`,
    mapLink ? `The location of the property on Google Maps is:\n${mapLink}` : "",
    "We look forward to showing you the property!",
  ];

  return blocks.filter(Boolean).join("\n\n");
}

function buildPropertyAgentMessage(row: AdminVisitRow): string {
  const agentName = row.properties?.agents?.profiles?.full_name || "Agent";
  const propId = row.properties?.property_ref || "N/A";
  const vaName = row.visiting_agent?.full_name || "Not assigned";
  const vaPhone = row.visiting_agent?.phone || "Not provided";
  const mapLink = row.properties?.location_url || "Not provided";

  return [
    `*Hello ${agentName},*`,
    "Great news! We have successfully scheduled a confirmed visit booking for your listed property.",
    "Here are the details for the upcoming viewing:",
    `- *Property ID: ${propId}*`,
    `- *Customer Name:* ${row.visitor_name}`,
    `- *Assigned Visiting Agent:* ${vaName}`,
    `- *Visiting Agent Contact:* ${vaPhone}`,
    `- *Property Map:* ${mapLink}`,
    "The designated visiting agent will handle the tour on your behalf.",
  ].join("\n\n");
}

function buildVisitingAgentMessage(row: AdminVisitRow): string {
  const vaName = row.visiting_agent?.full_name || "Agent";
  const property = row.properties?.title || "the property";
  const propId = row.properties?.property_ref || "N/A";
  const date = formatMessageDate(row.visit_date);
  const time = formatMessageTime(row.visit_time);
  const paName = row.properties?.agents?.profiles?.full_name || "Not provided";
  const paPhone = row.properties?.agents?.profiles?.phone || "Not provided";
  const mapLink = row.properties?.location_url || "Not provided";
  const instructions = row.properties?.visiting_agent_instructions || "None";
  const frontDoor = row.properties?.visiting_agent_image || "";

  const blocks = [
    `*Hello ${vaName},*`,
    "This is a notification from TheUrbanRealEstateSaudi to let you know that you have been assigned to a new property visit. Please review the details below.",
    `- *Property Name:* "${property}"`,
    `- *Property ID:* ${propId}\n- *Date of Visit:* ${date}\n- *Time of Visit:* ${time}`,
    `*Client Details:*\n- *Customer Name:* ${row.visitor_name}\n- *Customer Phone:* ${row.visitor_phone || "Not provided"}`,
    `*Listing Agent Details:*\n- *Property Agent:* ${paName}\n- *Agent Phone:* ${paPhone}`,
    `*Google Map Link:* ${mapLink}`,
    `*Confidential Property Instructions:*\n${instructions}${frontDoor ? `\nProperty Front Door Photo: ${frontDoor}` : ""}`,
    "Please ensure you arrive early and contact the customer if necessary.",
  ];

  return blocks.join("\n\n");
}

function waLink(phone: string | null | undefined, message: string): string | null {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  if (!clean) return null;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

function normalizeTime(time: string): string {
  return String(time || "").slice(0, 5);
}

function sortRowsForDayView(rows: AdminVisitRow[], sortMode: string): AdminVisitRow[] {
  const dayAsc = sortMode === "visit_date_asc";
  const dayDesc = sortMode === "visit_date_desc";

  return [...rows].sort((a, b) => {
    const dayCmp = a.visit_date.localeCompare(b.visit_date);
    const dayOrder = dayAsc ? dayCmp : dayDesc ? -dayCmp : -dayCmp;
    if (dayOrder !== 0) return dayOrder;
    return normalizeTime(a.visit_time).localeCompare(normalizeTime(b.visit_time));
  });
}

function groupRowsByDay(rows: AdminVisitRow[], sortMode: string): { date: string; rows: AdminVisitRow[] }[] {
  const sorted = sortRowsForDayView(rows, sortMode);
  const map = new Map<string, AdminVisitRow[]>();
  for (const row of sorted) {
    const bucket = map.get(row.visit_date) ?? [];
    bucket.push(row);
    map.set(row.visit_date, bucket);
  }

  const dates = Array.from(map.keys());
  if (sortMode === "visit_date_asc") {
    dates.sort((a, b) => a.localeCompare(b));
  } else {
    dates.sort((a, b) => b.localeCompare(a));
  }

  return dates.map((date) => ({
    date,
    rows: (map.get(date) ?? []).sort((a, b) =>
      normalizeTime(a.visit_time).localeCompare(normalizeTime(b.visit_time))
    ),
  }));
}

function useVisitColumns(visitingAgents: VisitingAgentOption[]) {
  return useMemo(
    () => [
      { key: "property", title: "Property", render: (row: AdminVisitRow) => row.properties?.title || "—" },
      {
        key: "property_id",
        title: "Property ID",
        render: (row: AdminVisitRow) => (
          <span className="font-mono text-xs">{row.properties?.property_ref || "Not set"}</span>
        ),
      },
      {
        key: "property_agent",
        title: "Property Agent",
        render: (row: AdminVisitRow) => row.properties?.agents?.profiles?.full_name || "—",
      },
      {
        key: "visiting_agent",
        title: "Visiting Agent",
        render: (row: AdminVisitRow) =>
          row.visiting_agent?.full_name ? (
            <Badge variant="secondary">{row.visiting_agent.full_name}</Badge>
          ) : (
            "—"
          ),
      },
      { key: "visitor_name", title: "Visitor" },
      {
        key: "visitor_phone",
        title: "Phone",
        render: (row: AdminVisitRow) => <span className="text-sm">{row.visitor_phone || "—"}</span>,
      },
      {
        key: "schedule",
        title: "Schedule",
        render: (row: AdminVisitRow) => (
          <div className="text-sm">
            <span>
              {formatDate(row.visit_date)} · {formatTime(row.visit_time)}
            </span>
            {row.properties?.property_ref && (
              <span className="block text-xs font-mono text-muted-foreground mt-0.5">
                ID: {row.properties.property_ref}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        title: "Status",
        render: (row: AdminVisitRow) => (
          <Badge variant="outline" className={getVisitStatusBadgeClass(row.status)}>
            {VISIT_STATUS_LABELS[row.status] || row.status}
          </Badge>
        ),
      },
      {
        key: "cancel_request",
        title: "Cancel Request",
        render: (row: AdminVisitRow) =>
          row.cancellation_requested_at && !row.cancellation_reviewed_at && row.status !== "cancelled" ? (
            <div className="space-y-1">
              <Badge variant="outline" className="border-red-200 bg-red-50 text-[10px] text-red-800">
                Cancel Request
              </Badge>
              <div className="text-xs text-muted-foreground">{row.cancellation_reason || "No reason"}</div>
              <CancelReviewActions visitId={row.id} />
            </div>
          ) : (
            "—"
          ),
      },
      {
        key: "reschedule",
        title: "Reschedule",
        render: (row: AdminVisitRow) =>
          row.request_source === "visiting_agent_reschedule" ? (
            <div className="space-y-1">
              <Badge variant="outline" className="text-[10px]">
                Reschedule Request
              </Badge>
              <div className="text-xs text-muted-foreground">{row.reschedule_reason || "No reason"}</div>
              {row.status === "pending" ? <RescheduleReviewActions visitId={row.id} /> : null}
            </div>
          ) : (
            "—"
          ),
      },
      {
        key: "whatsapp",
        title: "WhatsApp",
        render: (row: AdminVisitRow) => {
          const customerLink = waLink(row.visitor_phone, buildCustomerMessage(row));
          const paLink = waLink(row.properties?.agents?.profiles?.phone, buildPropertyAgentMessage(row));
          const vaLink = waLink(row.visiting_agent?.phone, buildVisitingAgentMessage(row));

          return (
            <div className="flex items-center gap-1.5">
              {canGenerateReceiptSlip(row) && (
                <ReceiptSlipDialog
                  visit={row}
                  apiPath={`/api/admin/visits/${row.id}/receipt-slip`}
                  receiverName={row.visiting_agent?.full_name || ""}
                  triggerNode={
                    <button
                      type="button"
                      title="Generate receipt slip"
                      aria-label="Generate receipt slip"
                      className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-amber-700" />
                    </button>
                  }
                />
              )}
              {customerLink ? (
                <a
                  href={customerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Send to Customer"
                  aria-label="Send template to Customer"
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                </a>
              ) : (
                <span
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-muted opacity-40"
                  title="Customer phone missing"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              )}
              {paLink ? (
                <a
                  href={paLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Send to Property Agent"
                  aria-label="Send template to Property Agent"
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-blue-600" />
                </a>
              ) : (
                <span
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-muted opacity-40"
                  title="Property Agent phone missing"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              )}
              {vaLink ? (
                <a
                  href={vaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Send to Visiting Agent"
                  aria-label="Send template to Visiting Agent"
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-purple-600" />
                </a>
              ) : (
                <span
                  className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-muted opacity-40"
                  title="Visiting Agent phone missing"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "actions",
        title: "Actions",
        render: (row: AdminVisitRow) => (
          <VisitRowActions
            visit={row}
            visitingAgents={visitingAgents}
            busyAgentIds={row.busyAgentIds}
          />
        ),
      },
    ],
    [visitingAgents]
  );
}

type AdminVisitsTableProps = {
  rows: AdminVisitRow[];
  visitingAgents: VisitingAgentOption[];
  pageSize?: number;
  defaultView?: ViewMode;
  sortMode?: string;
};

export function AdminVisitsTable({
  rows,
  visitingAgents,
  pageSize = PAGE_SIZE,
  defaultView = "day",
  sortMode = "",
}: AdminVisitsTableProps) {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [page, setPage] = useState(1);
  const columns = useVisitColumns(visitingAgents);

  const dayGroups = useMemo(() => groupRowsByDay(rows, sortMode), [rows, sortMode]);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleDay = (date: string, index: number) => {
    setExpandedDays((prev) => {
      const defaultOpen = index < 3;
      const isOpen = prev[date] ?? defaultOpen;
      return { ...prev, [date]: !isOpen };
    });
  };

  const isDayOpen = (date: string, index: number) => expandedDays[date] ?? index < 3;

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setView("day")}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            view === "day" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          By day
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            view === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          All in one table
        </button>
      </div>

      {view === "table" ? (
        <>
          <DataTable rows={paginatedRows} columns={columns} emptyText="No visit requests match your filters." />
          {rows.length > pageSize && (
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-muted-foreground">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No visit requests match your filters.
        </p>
      ) : (
        <div className="space-y-4">
          {dayGroups.map((group, index) => {
            const open = isDayOpen(group.date, index);
            const statusCounts = group.rows.reduce<Record<string, number>>((acc, row) => {
              acc[row.status] = (acc[row.status] ?? 0) + 1;
              return acc;
            }, {});

            return (
              <section key={group.date} className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleDay(group.date, index)}
                  className="flex w-full items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3 text-left hover:bg-muted/50"
                >
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {formatMonthDayYearWithComma(group.date)}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {group.rows.length} {group.rows.length === 1 ? "visit" : "visits"}
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <span key={status} className="ml-2">
                          · {VISIT_STATUS_LABELS[status] || status}: {count}
                        </span>
                      ))}
                    </p>
                  </div>
                  {open ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {open ? (
                  <div className="overflow-x-auto p-2">
                    <DataTable rows={group.rows} columns={columns} emptyText="No visits this day." />
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
