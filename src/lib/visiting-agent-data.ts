import { createClient } from "@/lib/supabase/server";
import type {
  AssignmentRow,
  AssignedPropertyRow,
  AssignmentHistoryItem,
} from "@/types/visit-assignment";

export async function fetchVisitingAgentDashboardData(userId: string, agentId: string) {
  const supabase = await createClient();

  const { data: requestData } = (await supabase
    .from("visit_requests")
    .select(
      `
      id, property_id, visitor_name, visitor_email, visitor_phone, visitor_message,
      visit_date, visit_time, status, visiting_status, customer_remarks, admin_notes,
      visiting_agent_id, notification_sent_at,
      commission_received_amount, commission_received_at, cancellation_reason,
      cancellation_requested_at, cancellation_reviewed_at,
      properties:property_id (
        title, property_ref, location_url, visiting_agent_instructions, visiting_agent_image,
        images, cover_image_index,
        agents:agent_id (
          profiles:profile_id (full_name, phone)
        )
      )
    `
    )
    .eq("visiting_agent_id", userId)
    .order("visit_date", { ascending: true })) as { data: AssignmentRow[] | null };

  const { data: historyData } = (await supabase
    .from("visit_assignment_history")
    .select("id, visit_id, created_at")
    .or(`new_agent_id.eq.${userId},old_agent_id.eq.${userId}`)
    .order("created_at", { ascending: false })) as {
      data: Array<{ id: string; visit_id: string; created_at: string }> | null;
    };

  const { data: assignedData } = (await supabase
    .from("agent_property_assignments")
    .select("properties:property_id(id, title, property_ref)")
    .eq("agent_id", agentId)) as {
      data: Array<{ properties: AssignedPropertyRow | null }> | null;
    };

  const rows = requestData || [];
  const assignmentHistoryByVisit: Record<string, AssignmentHistoryItem[]> = {};
  for (const item of historyData || []) {
    assignmentHistoryByVisit[item.visit_id] = assignmentHistoryByVisit[item.visit_id] || [];
    assignmentHistoryByVisit[item.visit_id].push({ id: item.id, created_at: item.created_at });
  }

  const assignedProperties = (assignedData || [])
    .map((item) => item.properties)
    .filter((property): property is AssignedPropertyRow => Boolean(property));

  return { rows, assignedProperties, assignmentHistoryByVisit };
}
