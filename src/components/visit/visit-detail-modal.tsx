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
import { formatDate, formatTime } from "@/lib/format";
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
import type { VisitMessageTemplate } from "@/lib/visit-message-template";
import { cn } from "@/lib/utils";

export type VisitDetailModalProps = {
  visit: AssignmentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentHistory?: AssignmentHistoryItem[];
  agentName: string;
  templates: VisitMessageTemplate[];
  templatesLoading?: boolean;
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
  agentName,
  templates,
  templatesLoading = false,
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
  const primaryStatusLabel = cancelPending
    ? "Cancel pending"
    : PIPELINE_STEPS[visit.visiting_status] || visit.visiting_status;

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMode("view");
      setCancelOpen(false);
    }
    onOpenChange(nextOpen);
  };

  const showActionFooter = !terminal && mode === "view";

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className={cn(
            "flex h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] flex-col gap-0 overflow-hidden rounded-none border-0 p-0",
            "max-sm:fixed max-sm:inset-0 max-sm:left-0 max-sm:top-0 max-sm:translate-x-0 max-sm:translate-y-0",
            "sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg sm:border"
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Mobile sticky header */}
          <div className="shrink-0 border-b bg-background pr-12 sm:hidden">
            <DialogTitle className="sr-only">
              {visit.visitor_name} — {visit.properties?.title || "Visit details"}
            </DialogTitle>
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-navy">{visit.visitor_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(visit.visit_date)} · {formatTime(visit.visit_time)}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 text-[10px]",
                  cancelPending ? "border-orange-200 bg-orange-50 text-orange-800" : statusBadgeClass
                )}
              >
                {primaryStatusLabel}
              </Badge>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {/* Desktop fixed header */}
            <div className="hidden sm:block">
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
              <DialogHeader className="shrink-0 space-y-3 px-6 pt-5 pb-3">
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
                <VisitQuickInfoBar
                  visit={visit}
                  agentName={agentName}
                  templates={templates}
                  templatesLoading={templatesLoading}
                  variant="default"
                />
              </DialogHeader>
            </div>

            {/* Scroll body */}
            <div
              className={cn(
                "flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6",
                "[-webkit-overflow-scrolling:touch]"
              )}
            >
              {/* Mobile scroll content: thumbnail, title, quick info */}
              <div className="space-y-3 pt-3 sm:hidden">
                {coverImage && (
                  <div className="aspect-[16/9] max-h-32 w-full overflow-hidden rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt={visit.properties?.title || "Property"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-semibold leading-snug text-navy">
                    {visit.properties?.title || "Unknown Property"}
                  </h2>
                  {visit.properties?.property_ref && (
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      ID {visit.properties.property_ref}
                    </p>
                  )}
                </div>
                <VisitQuickInfoBar
                  visit={visit}
                  agentName={agentName}
                  templates={templates}
                  templatesLoading={templatesLoading}
                  variant="compact"
                />
              </div>

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

            {showActionFooter && (
              <div
                className={cn(
                  "shrink-0 border-t bg-background px-4 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]",
                  "pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4"
                )}
              >
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="min-h-10 flex-1 text-xs text-destructive hover:text-destructive sm:min-h-11 sm:text-sm"
                    onClick={() => setCancelOpen(true)}
                    disabled={loading || cancelPending}
                    title={cancelPending ? "Cancel request already pending" : undefined}
                  >
                    {cancelPending ? "Pending" : "Cancel"}
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-10 flex-1 text-xs sm:min-h-11 sm:text-sm"
                    onClick={() => setMode("reschedule")}
                    disabled={loading || cancelPending}
                  >
                    Reschedule
                  </Button>
                  <Button
                    className="min-h-10 flex-1 text-xs sm:min-h-11 sm:text-sm"
                    onClick={() => setMode("complete")}
                    disabled={loading}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
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
