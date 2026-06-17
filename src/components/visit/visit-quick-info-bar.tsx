"use client";

import type { AssignmentRow } from "@/types/visit-assignment";
import { formatDate, formatTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle, Phone, Image as ImageIcon } from "lucide-react";
import { getPropertyCoverImage } from "@/types/visit-assignment";

type VisitQuickInfoBarProps = {
  visit: AssignmentRow;
};

function whatsAppUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

function telUrl(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function VisitQuickInfoBar({ visit }: VisitQuickInfoBarProps) {
  const layoutPhoto = visit.properties?.visiting_agent_image;
  const coverImage = getPropertyCoverImage(visit);

  return (
    <div className="space-y-3 rounded-xl border border-[#eff3f4] bg-muted/30 p-4">
      <div>
        <p className="text-lg font-bold text-navy">{visit.visitor_name}</p>
        <a
          href={telUrl(visit.visitor_phone)}
          className="mt-0.5 inline-flex items-center gap-1.5 text-base font-medium text-primary hover:underline"
        >
          <Phone className="h-4 w-4 shrink-0" />
          {visit.visitor_phone}
        </a>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(visit.visit_date)} · {formatTime(visit.visit_time)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visit.properties?.location_url && (
          <Button variant="outline" size="sm" asChild className="min-h-11 justify-start gap-2">
            <a href={visit.properties.location_url} target="_blank" rel="noreferrer">
              <MapPin className="h-4 w-4 shrink-0" />
              Map
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild className="min-h-11 justify-start gap-2 text-green-700">
          <a href={whatsAppUrl(visit.visitor_phone)} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4 shrink-0" />
            WhatsApp
          </a>
        </Button>
        {(layoutPhoto || coverImage) && (
          <Button variant="outline" size="sm" asChild className="min-h-11 justify-start gap-2 col-span-2 sm:col-span-1">
            <a href={layoutPhoto || coverImage!} target="_blank" rel="noreferrer">
              <ImageIcon className="h-4 w-4 shrink-0" />
              Layout photo
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
