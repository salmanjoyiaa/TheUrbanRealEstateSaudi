"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatTime } from "@/lib/format";
import { VisitPipelineProgress } from "@/components/visit/visit-pipeline-progress";
import { VisitCommentsSection } from "@/components/visit/visit-comments-section";
import { VisitCancelDialog } from "@/components/visit/visit-cancel-dialog";
import { VisitReschedulePanel } from "@/components/visit/visit-reschedule-panel";
import { VisitConfirmWizard } from "@/components/visit/visit-confirm-wizard";
import {
  type AssignmentRow,
  type AssignmentHistoryItem,
  PIPELINE_STEPS,
  VISITING_STATUS_BADGE_CLASSES,
  getPropertyCoverImage,
  isTerminalVisit,
} from "@/types/visit-assignment";
import { getVisitStatusBadgeClass, getVisitStatusLabel } from "@/lib/visit-status";

export type VisitDetailModalProps = {
  visit: AssignmentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentHistory?: AssignmentHistoryItem[];
  onCancel: (visitId: string, reason: string) => Promise<void>;
  onReschedule: (visitId: string, data: { reason: string; visit_date: string; visit_time: string }) => Promise<void>;
  onStatusUpdate: (visitId: string, status: string, extra?: Record<string, string | number>) => Promise<void>;
  loading?: boolean;
};

function whatsAppUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function VisitDetailModal({
  visit,
  open,
  onOpenChange,
  assignmentHistory = [],
  onCancel,
  onReschedule,
  onStatusUpdate,
  loading,
}: VisitDetailModalProps) {
  const [mode, setMode] = useState<"view" | "reschedule" | "confirm">("view");
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!visit) return null;

  const coverImage = getPropertyCoverImage(visit);
  const terminal = isTerminalVisit(visit);
  const statusBadgeClass = VISITING_STATUS_BADGE_CLASSES[visit.visiting_status] || getVisitStatusBadgeClass(visit.status);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMode("view");
      setCancelOpen(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          {coverImage && (
            <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt={visit.properties?.title || "Property"}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col">
            <DialogHeader className="shrink-0 space-y-2 px-6 pt-5 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-lg leading-snug text-navy">
                    {visit.properties?.title || "Unknown Property"}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(visit.visit_date)} at {formatTime(visit.visit_time)}
                    {visit.properties?.property_ref && (
                      <span className="ml-2 font-mono text-xs">ID {visit.properties.property_ref}</span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="outline" className={statusBadgeClass}>
                    {PIPELINE_STEPS[visit.visiting_status] || visit.visiting_status}
                  </Badge>
                  <Badge variant="outline" className={getVisitStatusBadgeClass(visit.status)}>
                    {getVisitStatusLabel(visit.status)}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {visit.properties?.location_url && (
                  <Button variant="outline" size="sm" asChild className="h-8">
                    <a href={visit.properties.location_url} target="_blank" rel="noreferrer">
                      <MapPin className="mr-1.5 h-3.5 w-3.5" />
                      Map
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild className="h-8 text-green-700">
                  <a href={whatsAppUrl(visit.visitor_phone)} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    WhatsApp customer
                  </a>
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
              {mode === "reschedule" && (
                <VisitReschedulePanel
                  propertyId={visit.property_id}
                  loading={loading}
                  onCancel={() => setMode("view")}
                  onSubmit={async (data) => {
                    await onReschedule(visit.id, data);
                    setMode("view");
                  }}
                />
              )}

              {mode === "confirm" && !terminal && (
                <VisitConfirmWizard
                  visit={visit}
                  loading={loading}
                  onClose={() => setMode("view")}
                  onStatusUpdate={async (status, extra) => {
                    await onStatusUpdate(visit.id, status, extra);
                  }}
                />
              )}

              {mode === "view" && (
                <>
                  <VisitPipelineProgress
                    currentStatus={visit.visiting_status}
                    bookingStatus={visit.status}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoBlock title="Customer" icon={User}>
                      <p>{visit.visitor_name}</p>
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {visit.visitor_phone}
                      </p>
                      {visit.visitor_email && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" /> {visit.visitor_email}
                        </p>
                      )}
                      {visit.visitor_message && (
                        <p className="mt-2 rounded-md bg-blue-50 px-2 py-1.5 text-xs text-blue-900">
                          &ldquo;{visit.visitor_message}&rdquo;
                        </p>
                      )}
                    </InfoBlock>

                    <InfoBlock title="Property agent" icon={User}>
                      <p>{visit.properties?.agents?.profiles?.full_name || "—"}</p>
                      {visit.properties?.agents?.profiles?.phone && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" /> {visit.properties.agents.profiles.phone}
                        </p>
                      )}
                    </InfoBlock>
                  </div>

                  {visit.properties?.visiting_agent_instructions && (
                    <InfoBlock title="Instructions" icon={FileText}>
                      <p className="whitespace-pre-wrap text-muted-foreground">
                        {visit.properties.visiting_agent_instructions}
                      </p>
                    </InfoBlock>
                  )}

                  {visit.properties?.visiting_agent_image && (
                    <a
                      href={visit.properties.visiting_agent_image}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ImageIcon className="h-4 w-4" />
                      View layout / door photo
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {visit.customer_remarks && (
                    <InfoBlock title="Customer remarks">
                      <p className="italic text-muted-foreground">&ldquo;{visit.customer_remarks}&rdquo;</p>
                    </InfoBlock>
                  )}

                  {visit.commission_received_amount != null && (
                    <InfoBlock title="Commission">
                      <p className="font-medium text-green-700">
                        SAR {visit.commission_received_amount.toLocaleString()}
                        {visit.commission_received_at && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            on {format(new Date(visit.commission_received_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </p>
                    </InfoBlock>
                  )}

                  {visit.admin_notes && (
                    <InfoBlock title="Admin notes">
                      <p className="text-muted-foreground">{visit.admin_notes}</p>
                    </InfoBlock>
                  )}

                  <Separator />

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Assignment history
                    </p>
                    {assignmentHistory.length > 0 ? (
                      <div className="space-y-1">
                        {assignmentHistory.map((item) => (
                          <p key={item.id} className="text-xs text-muted-foreground">
                            Reassigned: {format(new Date(item.created_at), "MMM d, yyyy h:mm a")}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No reassignment history.</p>
                    )}
                  </div>

                  <VisitCommentsSection visitId={visit.id} />
                </>
              )}
            </div>

            {!terminal && mode === "view" && (
              <div className="shrink-0 border-t bg-muted/20 px-6 py-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => setCancelOpen(true)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setMode("reschedule")}
                    disabled={loading}
                  >
                    Reschedule
                  </Button>
                  <Button className="flex-1" onClick={() => setMode("confirm")} disabled={loading}>
                    Confirm
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <VisitCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        loading={loading}
        onConfirm={async (reason) => {
          await onCancel(visit.id, reason);
          handleClose(false);
        }}
      />
    </>
  );
}

function InfoBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {title}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}
