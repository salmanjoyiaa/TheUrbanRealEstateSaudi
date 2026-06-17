"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Mail,
  User,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle2,
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
import { VisitPipelineProgress } from "@/components/visit/visit-pipeline-progress";
import { VisitCommentsSection } from "@/components/visit/visit-comments-section";
import { VisitCancelDialog } from "@/components/visit/visit-cancel-dialog";
import { VisitReschedulePanel } from "@/components/visit/visit-reschedule-panel";
import { VisitCompleteForm, type CompleteVisitPayload } from "@/components/visit/visit-complete-form";
import { VisitQuickInfoBar } from "@/components/visit/visit-quick-info-bar";
import {
  type AssignmentRow,
  type AssignmentHistoryItem,
  PIPELINE_STEPS,
  VISITING_STATUS_BADGE_CLASSES,
  getPropertyCoverImage,
  isTerminalVisit,
  isCancelRequestPending,
} from "@/types/visit-assignment";
import { getVisitStatusBadgeClass, getVisitStatusLabel } from "@/lib/visit-status";

export type VisitDetailModalProps = {
  visit: AssignmentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentHistory?: AssignmentHistoryItem[];
  onCancel: (visitId: string, reason: string) => Promise<void>;
  onReschedule: (visitId: string, data: { reason: string; visit_date: string; visit_time: string }) => Promise<void>;
  onCompleteVisit: (visitId: string, payload: CompleteVisitPayload) => Promise<void>;
  loading?: boolean;
};

export function VisitDetailModal({
  visit,
  open,
  onOpenChange,
  assignmentHistory = [],
  onCancel,
  onReschedule,
  onCompleteVisit,
  loading,
}: VisitDetailModalProps) {
  const [mode, setMode] = useState<"view" | "reschedule" | "complete">("view");
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!visit) return null;

  const coverImage = getPropertyCoverImage(visit);
  const terminal = isTerminalVisit(visit);
  const cancelPending = isCancelRequestPending(visit);
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
        <DialogContent
          className="flex max-h-[100dvh] w-[100vw] max-w-[100vw] flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {coverImage && (
            <div className="relative h-40 w-full shrink-0 overflow-hidden bg-muted sm:h-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt={visit.properties?.title || "Property"}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col">
            <DialogHeader className="shrink-0 space-y-3 px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-lg leading-snug text-navy">
                    {visit.properties?.title || "Unknown Property"}
                  </DialogTitle>
                  {visit.properties?.property_ref && (
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      ID {visit.properties.property_ref}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {cancelPending && (
                    <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-800">
                      Cancel pending
                    </Badge>
                  )}
                  <Badge variant="outline" className={statusBadgeClass}>
                    {PIPELINE_STEPS[visit.visiting_status] || visit.visiting_status}
                  </Badge>
                  <Badge variant="outline" className={getVisitStatusBadgeClass(visit.status)}>
                    {getVisitStatusLabel(visit.status)}
                  </Badge>
                </div>
              </div>

              <VisitQuickInfoBar visit={visit} />
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 sm:px-6">
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

              {mode === "complete" && !terminal && (
                <VisitCompleteForm
                  loading={loading}
                  initialRemarks={visit.customer_remarks}
                  onCancel={() => setMode("view")}
                  onSubmit={async (payload) => {
                    await onCompleteVisit(visit.id, payload);
                    handleClose(false);
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
                    <InfoBlock title="Customer details" icon={User}>
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
                      {!visit.visitor_email && !visit.visitor_message && (
                        <p className="text-muted-foreground">No additional details.</p>
                      )}
                    </InfoBlock>

                    <InfoBlock title="Property agent" icon={User}>
                      <p>{visit.properties?.agents?.profiles?.full_name || "—"}</p>
                      {visit.properties?.agents?.profiles?.phone && (
                        <p className="text-muted-foreground">{visit.properties.agents.profiles.phone}</p>
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

                  {cancelPending && visit.cancellation_reason && (
                    <InfoBlock title="Cancel request">
                      <p className="text-muted-foreground">{visit.cancellation_reason}</p>
                      <p className="mt-1 text-xs text-orange-700">Awaiting admin approval.</p>
                    </InfoBlock>
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
              <div className="shrink-0 border-t bg-muted/20 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="min-h-11 flex-1 text-destructive hover:text-destructive"
                    onClick={() => setCancelOpen(true)}
                    disabled={loading || cancelPending}
                    title={cancelPending ? "Cancel request already pending" : undefined}
                  >
                    {cancelPending ? "Cancel pending" : "Cancel"}
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11 flex-1"
                    onClick={() => setMode("reschedule")}
                    disabled={loading || cancelPending}
                  >
                    Reschedule
                  </Button>
                  <Button className="min-h-11 flex-1" onClick={() => setMode("complete")} disabled={loading}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Complete
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
