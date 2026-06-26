import { z } from "zod";
import type { AssignmentRow } from "@/types/visit-assignment";
import { formatDate, formatTime } from "@/lib/format";

export const visitMessageTemplateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  body: z.string().trim().min(1, "Message body is required").max(4000),
});

export type VisitMessageTemplateInput = z.infer<typeof visitMessageTemplateSchema>;

export type VisitMessageTemplate = {
  id: string;
  agent_profile_id: string;
  name: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export const VISIT_MESSAGE_PLACEHOLDERS = [
  { token: "{{customer_name}}", label: "Customer name" },
  { token: "{{customer_phone}}", label: "Customer phone" },
  { token: "{{property_name}}", label: "Property name" },
  { token: "{{property_id}}", label: "Property ID" },
  { token: "{{visit_date}}", label: "Visit date" },
  { token: "{{visit_time}}", label: "Visit time" },
  { token: "{{map_link}}", label: "Map link" },
  { token: "{{property_agent_name}}", label: "Property agent name" },
  { token: "{{property_agent_phone}}", label: "Property agent phone" },
  { token: "{{agent_name}}", label: "Your name" },
] as const;

export type VisitMessageTemplateContext = Record<
  (typeof VISIT_MESSAGE_PLACEHOLDERS)[number]["token"],
  string
>;

const FALLBACK = "Not provided";

export function buildTemplateContext(
  visit: AssignmentRow,
  agentName: string
): VisitMessageTemplateContext {
  const propertyAgent = visit.properties?.agents?.profiles;

  return {
    "{{customer_name}}": visit.visitor_name || FALLBACK,
    "{{customer_phone}}": visit.visitor_phone || FALLBACK,
    "{{property_name}}": visit.properties?.title || FALLBACK,
    "{{property_id}}": visit.properties?.property_ref || FALLBACK,
    "{{visit_date}}": visit.visit_date ? formatDate(visit.visit_date) : FALLBACK,
    "{{visit_time}}": visit.visit_time ? formatTime(visit.visit_time) : FALLBACK,
    "{{map_link}}": visit.properties?.location_url || FALLBACK,
    "{{property_agent_name}}": propertyAgent?.full_name || FALLBACK,
    "{{property_agent_phone}}": propertyAgent?.phone || FALLBACK,
    "{{agent_name}}": agentName || FALLBACK,
  };
}

export function interpolateVisitMessageTemplate(
  body: string,
  context: VisitMessageTemplateContext
): string {
  let result = body;
  for (const { token } of VISIT_MESSAGE_PLACEHOLDERS) {
    result = result.split(token).join(context[token]);
  }
  return result;
}

export function buildVisitWhatsAppUrl(
  phone: string | null | undefined,
  message: string
): string | null {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  if (!clean) return null;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function buildVisitTemplateWhatsAppUrl(
  visit: AssignmentRow,
  agentName: string,
  templateBody: string
): string | null {
  const context = buildTemplateContext(visit, agentName);
  const message = interpolateVisitMessageTemplate(templateBody, context);
  return buildVisitWhatsAppUrl(visit.visitor_phone, message);
}
