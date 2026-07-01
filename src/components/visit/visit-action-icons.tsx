"use client";

import { MapPin, MessageCircle, Phone, Image as ImageIcon, ChevronRight, FileText } from "lucide-react";
import type { AssignmentRow } from "@/types/visit-assignment";
import type { VisitMessageTemplate } from "@/lib/visit-message-template";
import { getPropertyCoverImage } from "@/types/visit-assignment";
import { VisitTemplatePicker } from "@/components/visit/visit-template-picker";
import { ReceiptSlipDialog } from "@/components/visit/receipt-slip-dialog";
import { canGenerateReceiptSlip } from "@/lib/receipt-slip";
import { cn } from "@/lib/utils";

function whatsAppUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

function telUrl(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

type VisitActionIconsProps = {
  visit: AssignmentRow;
  agentName: string;
  templates: VisitMessageTemplate[];
  templatesLoading?: boolean;
  onDetails?: () => void;
  showLayoutPhoto?: boolean;
  className?: string;
};

export function VisitActionIcons({
  visit,
  agentName,
  templates,
  templatesLoading = false,
  onDetails,
  showLayoutPhoto = false,
  className,
}: VisitActionIconsProps) {
  const layoutPhoto = visit.properties?.visiting_agent_image;
  const coverImage = getPropertyCoverImage(visit);
  const photoUrl = layoutPhoto || coverImage;

  const iconClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-primary hover:bg-muted";

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {visit.properties?.location_url && (
        <a
          href={visit.properties.location_url}
          target="_blank"
          rel="noreferrer"
          className={iconClass}
          aria-label="Open map"
        >
          <MapPin className="h-4 w-4" />
        </a>
      )}
      <a
        href={whatsAppUrl(visit.visitor_phone)}
        target="_blank"
        rel="noreferrer"
        className={cn(iconClass, "text-green-700")}
        aria-label="WhatsApp customer"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <VisitTemplatePicker
        visit={visit}
        agentName={agentName}
        templates={templates}
        loading={templatesLoading}
      />
      {canGenerateReceiptSlip(visit) && (
        <ReceiptSlipDialog
          visit={visit}
          apiPath={`/api/agent/visits/${visit.id}/receipt-slip`}
          receiverName={agentName}
          triggerNode={
            <button
              type="button"
              className={cn(iconClass, "text-amber-700")}
              aria-label="Generate receipt slip"
              title="Receipt slip"
            >
              <FileText className="h-4 w-4" />
            </button>
          }
        />
      )}
      <a
        href={telUrl(visit.visitor_phone)}
        className={iconClass}
        aria-label="Call customer"
      >
        <Phone className="h-4 w-4" />
      </a>
      {showLayoutPhoto && photoUrl && (
        <a
          href={photoUrl}
          target="_blank"
          rel="noreferrer"
          className={iconClass}
          aria-label="View layout photo"
        >
          <ImageIcon className="h-4 w-4" />
        </a>
      )}
      {onDetails && (
        <button
          type="button"
          onClick={onDetails}
          className={cn(iconClass, "text-muted-foreground md:hidden")}
          aria-label="View details"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
