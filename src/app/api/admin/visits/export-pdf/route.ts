import { NextResponse } from "next/server";
import { z } from "zod";
import { pdf } from "@react-pdf/renderer";
import { getAdminRouteContext } from "@/lib/admin";
import { formatMessageTime, formatMonthDayYearWithComma } from "@/lib/format";
import { VISIT_STATUS_LABELS } from "@/lib/visit-status";
import {
  fetchAdminVisitsForExport,
  type AdminVisitRow,
} from "@/lib/server/admin-visits-query";
import {
  VisitExportPdf,
  type VisitExportPdfGroup,
  type VisitExportPdfRow,
} from "@/components/admin/visit-export-pdf";
import { sanitizePropertyRefQuery } from "@/lib/property-ref";

const bodySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
    mode: z.enum(["all_agents", "visiting_agent", "property", "property_and_agent"]),
    visiting_agent_profile_id: z.string().uuid().optional(),
    property_ref: z.string().optional(),
    status_filter: z.enum(["all", "active"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "visiting_agent" && !data.visiting_agent_profile_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "visiting_agent_profile_id required for visiting_agent mode",
      });
    }
    if (data.mode === "property" && !sanitizePropertyRefQuery(data.property_ref)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "property_ref required for property mode",
      });
    }
    if (data.mode === "property_and_agent") {
      if (!data.visiting_agent_profile_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "visiting_agent_profile_id required for property_and_agent mode",
        });
      }
      if (!sanitizePropertyRefQuery(data.property_ref)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "property_ref required for property_and_agent mode",
        });
      }
    }
  });

function sanitizeFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function toPdfRow(visit: AdminVisitRow, index: number): VisitExportPdfRow {
  const propertyAgent = visit.properties?.agents?.profiles?.full_name || "—";
  return {
    index,
    time: formatMessageTime(String(visit.visit_time || "00:00:00")),
    propertyRef: visit.properties?.property_ref || "N/A",
    propertyTitle: visit.properties?.title || "Property",
    visitor: visit.visitor_name,
    phone: visit.visitor_phone || "—",
    status: VISIT_STATUS_LABELS[visit.status] || visit.status,
    visitingAgent: visit.visiting_agent?.full_name || "Unassigned",
    propertyAgent,
  };
}

function groupByVisitingAgent(visits: AdminVisitRow[]): VisitExportPdfGroup[] {
  const map = new Map<string, AdminVisitRow[]>();

  for (const visit of visits) {
    const key = visit.visiting_agent?.full_name || "Unassigned";
    const bucket = map.get(key) || [];
    bucket.push(visit);
    map.set(key, bucket);
  }

  const groups: VisitExportPdfGroup[] = [];
  let globalIndex = 1;

  for (const [agentName, agentVisits] of Array.from(map.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const rows = agentVisits
      .sort((a, b) => String(a.visit_time).localeCompare(String(b.visit_time)))
      .map((visit) => toPdfRow(visit, globalIndex++));
    groups.push({ agentName, rows });
  }

  return groups;
}

function modeMeta(mode: z.infer<typeof bodySchema>["mode"], propertyRef?: string) {
  switch (mode) {
    case "all_agents":
      return { title: "Visit Requests — All Agents", subtitle: "Daily export grouped by visiting agent" };
    case "visiting_agent":
      return { title: "Visit Requests — Visiting Agent", subtitle: "Daily export for selected agent" };
    case "property":
      return {
        title: `Visit Requests — Property ID ${sanitizePropertyRefQuery(propertyRef)}`,
        subtitle: "Daily export for selected property",
      };
    case "property_and_agent":
      return {
        title: `Visit Requests — Property ID ${sanitizePropertyRefQuery(propertyRef)} + Agent`,
        subtitle: "Daily export for property and visiting agent",
      };
  }
}

export async function POST(request: Request) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const { date, mode, visiting_agent_profile_id, property_ref, status_filter } = parsed.data;

  const visits = await fetchAdminVisitsForExport(admin.supabase, {
    date,
    mode,
    visiting_agent_profile_id,
    property_ref,
    status_filter: status_filter ?? "all",
  });

  if (visits.length === 0) {
    return NextResponse.json({ error: "No visits found for this selection" }, { status: 404 });
  }

  const displayDate = formatMonthDayYearWithComma(date);
  const generatedAt = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const meta = modeMeta(mode, property_ref);
  const fileSuffix = `${mode}-${sanitizeFileName(date)}`;

  let doc;
  if (mode === "all_agents") {
    const groups = groupByVisitingAgent(visits);
    doc = VisitExportPdf({
      ...meta,
      date: displayDate,
      generatedAt,
      totalVisits: visits.length,
      mode,
      groups,
    });
  } else {
    const rows = visits.map((visit, i) => toPdfRow(visit, i + 1));
    doc = VisitExportPdf({
      ...meta,
      date: displayDate,
      generatedAt,
      totalVisits: rows.length,
      mode,
      rows,
    });
  }

  const stream = await pdf(doc).toBuffer();
  const fileName = `theurbanrealestate-visits-${fileSuffix}.pdf`;

  return new NextResponse(stream as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
