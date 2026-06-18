"use client";

import { MapPin, MessageCircle, Phone, Image as ImageIcon, ChevronRight } from "lucide-react";
import type { AssignmentRow } from "@/types/visit-assignment";
import { getPropertyCoverImage } from "@/types/visit-assignment";
import { cn } from "@/lib/utils";

function whatsAppUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

function telUrl(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

type VisitActionIconsProps = {
  visit: AssignmentRow;
  onDetails?: () => void;
  showLayoutPhoto?: boolean;
  className?: string;
};

export function VisitActionIcons({
  visit,
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
