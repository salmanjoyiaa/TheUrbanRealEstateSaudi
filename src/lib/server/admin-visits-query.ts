import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePropertyIdsByRef } from "@/lib/server/resolve-property-ids-by-ref";
import { sanitizePropertyRefQuery } from "@/lib/property-ref";

type AdminClient = ReturnType<typeof createAdminClient>;

export const ADMIN_VISITS_SELECT = `
  id, visitor_name, visitor_email, visitor_phone, visitor_message, request_source, parent_visit_id, reschedule_reason,
  cancellation_reason, cancellation_requested_at, cancellation_reviewed_at,
  visit_date, visit_time, status, visiting_status, customer_remarks, admin_notes, visiting_agent_id, notification_sent_at,
  commission_received_amount,
  visiting_agent:visiting_agent_id(id, full_name, phone),
  properties:property_id (
    id, title, property_ref, location_url, visiting_agent_image, visiting_agent_instructions,
    agents:agent_id (
      profiles:profile_id (full_name, phone)
    )
  )
`;

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
};

export type AdminVisitsPageFilters = {
  status?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  property_ref?: string;
};

export type AdminVisitsExportFilters = {
  date: string;
  mode: "all_agents" | "visiting_agent" | "property" | "property_and_agent";
  visiting_agent_profile_id?: string;
  property_ref?: string;
  status_filter?: "all" | "active";
};

const PAGE_SIZE = 1000;
const EMPTY_PROPERTY_SENTINEL = "00000000-0000-0000-0000-000000000000";

async function resolvePropertyIds(
  supabase: AdminClient,
  propertyRef?: string
): Promise<string[] | null> {
  const q = sanitizePropertyRefQuery(propertyRef);
  if (!q) return null;
  return resolvePropertyIdsByRef(supabase, q);
}

function applyStatusFilter<T extends { eq: (col: string, val: string) => T; in: (col: string, vals: string[]) => T }>(
  query: T,
  statusFilter?: "all" | "active",
  explicitStatus?: string
): T {
  if (explicitStatus && ["pending", "assigned", "confirmed", "cancelled", "completed"].includes(explicitStatus)) {
    return query.eq("status", explicitStatus);
  }
  if (statusFilter === "active") {
    return query.in("status", ["assigned", "confirmed"]);
  }
  return query;
}

async function fetchAllPages<T>(
  buildQuery: (from: number, to: number) => Promise<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const batch = data || [];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

export async function fetchAdminVisitsForPage(
  supabase: AdminClient,
  filters: AdminVisitsPageFilters
): Promise<AdminVisitRow[]> {
  const propertyIdsForRef = filters.property_ref
    ? await resolvePropertyIds(supabase, filters.property_ref)
    : null;

  const sortField =
    filters.sort === "visit_date_asc" || filters.sort === "visit_date_desc"
      ? "visit_date"
      : "created_at";
  const sortAsc = filters.sort === "visit_date_asc";

  return fetchAllPages((from, to) => {
    let query = supabase
      .from("visit_requests")
      .select(ADMIN_VISITS_SELECT)
      .order(sortField, { ascending: sortAsc })
      .range(from, to);

    query = applyStatusFilter(query, "all", filters.status);

    if (filters.date_from) query = query.gte("visit_date", filters.date_from);
    if (filters.date_to) query = query.lte("visit_date", filters.date_to);

    if (propertyIdsForRef !== null) {
      query = query.in(
        "property_id",
        propertyIdsForRef.length === 0 ? [EMPTY_PROPERTY_SENTINEL] : propertyIdsForRef
      );
    }

    return query as unknown as Promise<{ data: AdminVisitRow[] | null; error: { message: string } | null }>;
  });
}

export async function fetchAdminVisitsForExport(
  supabase: AdminClient,
  filters: AdminVisitsExportFilters
): Promise<AdminVisitRow[]> {
  const propertyIdsForRef =
    filters.mode === "property" || filters.mode === "property_and_agent"
      ? await resolvePropertyIds(supabase, filters.property_ref)
      : null;

  if (
    (filters.mode === "property" || filters.mode === "property_and_agent") &&
    propertyIdsForRef !== null &&
    propertyIdsForRef.length === 0
  ) {
    return [];
  }

  return fetchAllPages((from, to) => {
    let query = supabase
      .from("visit_requests")
      .select(ADMIN_VISITS_SELECT)
      .eq("visit_date", filters.date)
      .order("visit_time", { ascending: true })
      .range(from, to);

    query = applyStatusFilter(query, filters.status_filter ?? "all");

    if (filters.mode === "visiting_agent" || filters.mode === "property_and_agent") {
      query = query.eq("visiting_agent_id", filters.visiting_agent_profile_id!);
    }

    if (propertyIdsForRef !== null && propertyIdsForRef.length > 0) {
      query = query.in("property_id", propertyIdsForRef);
    }

    return query as unknown as Promise<{ data: AdminVisitRow[] | null; error: { message: string } | null }>;
  });
}

export type { AdminClient };
