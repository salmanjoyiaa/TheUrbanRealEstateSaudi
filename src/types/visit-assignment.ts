export type AssignmentRow = {
  id: string;
  property_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_message?: string | null;
  visit_date: string;
  visit_time: string;
  status: string;
  visiting_status: string;
  customer_remarks: string | null;
  commission_received_amount?: number | null;
  commission_received_at?: string | null;
  admin_notes?: string | null;
  cancellation_reason?: string | null;
  cancellation_requested_at?: string | null;
  cancellation_reviewed_at?: string | null;
  properties: {
    title: string;
    property_ref?: string | null;
    location_url: string | null;
    visiting_agent_instructions: string | null;
    visiting_agent_image: string | null;
    images?: string[] | null;
    cover_image_index?: number | null;
    agents: {
      profiles: {
        full_name: string;
        phone: string | null;
      } | null;
    } | null;
  } | null;
};

export type AssignedPropertyRow = {
  id: string;
  title: string;
  property_ref: string | null;
};

export type AssignmentHistoryItem = {
  id: string;
  created_at: string;
};

export type VisitCommentRow = {
  id: string;
  content: string;
  created_at: string;
  author: { full_name: string } | null;
};

export const PIPELINE_STEPS: Record<string, string> = {
  view: "To Visit",
  contact_done: "Contact Done",
  customer_confirmed: "Customer Confirmed",
  customer_arrived: "Customer Arrived",
  visit_done: "Visit Done",
  customer_remarks: "Remarks Logged",
  deal_pending: "Deal Pending",
  deal_fail: "Deal Failed",
  commission_got: "Commission Got",
  deal_close: "Deal Closed",
  reschedule: "Reschedule Requested",
};

export const VISITING_STATUS_BADGE_CLASSES: Record<string, string> = {
  view: "border-blue-200 bg-blue-50 text-blue-800",
  contact_done: "border-amber-200 bg-amber-50 text-amber-800",
  customer_confirmed: "border-amber-200 bg-amber-50 text-amber-800",
  customer_arrived: "border-amber-200 bg-amber-50 text-amber-800",
  visit_done: "border-violet-200 bg-violet-50 text-violet-800",
  customer_remarks: "border-violet-200 bg-violet-50 text-violet-800",
  deal_pending: "border-green-200 bg-green-50 text-green-800",
  deal_fail: "border-red-200 bg-red-50 text-red-800",
  commission_got: "border-green-200 bg-green-50 text-green-800",
  deal_close: "border-green-200 bg-green-50 text-green-800",
  reschedule: "border-orange-200 bg-orange-50 text-orange-800",
};

export function getPropertyCoverImage(visit: AssignmentRow): string | null {
  const props = visit.properties;
  if (!props) return null;
  const images = props.images || [];
  const idx = props.cover_image_index ?? 0;
  if (images.length > 0 && images[idx]) return images[idx];
  return props.visiting_agent_image;
}

export function isCancelRequestPending(visit: AssignmentRow): boolean {
  return Boolean(
    visit.cancellation_requested_at &&
    !visit.cancellation_reviewed_at &&
    visit.status !== "cancelled"
  );
}

export function isTerminalVisit(visit: AssignmentRow): boolean {
  return (
    visit.status === "cancelled" ||
    visit.visiting_status === "deal_close" ||
    visit.visiting_status === "deal_fail"
  );
}
