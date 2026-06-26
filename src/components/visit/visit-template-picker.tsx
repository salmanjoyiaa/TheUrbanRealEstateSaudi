"use client";

import Link from "next/link";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import type { AssignmentRow } from "@/types/visit-assignment";
import type { VisitMessageTemplate } from "@/lib/visit-message-template";
import { buildVisitTemplateWhatsAppUrl } from "@/lib/visit-message-template";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type VisitTemplatePickerProps = {
  visit: AssignmentRow;
  agentName: string;
  templates: VisitMessageTemplate[];
  loading?: boolean;
  variant?: "icon" | "button";
  className?: string;
};

export function VisitTemplatePicker({
  visit,
  agentName,
  templates,
  loading = false,
  variant = "icon",
  className,
}: VisitTemplatePickerProps) {
  function handleSelect(template: VisitMessageTemplate) {
    if (!visit.visitor_phone?.replace(/\D/g, "")) {
      toast.error("Customer phone number is not available");
      return;
    }

    const url = buildVisitTemplateWhatsAppUrl(visit, agentName, template.body);
    if (!url) {
      toast.error("Could not open WhatsApp for this customer");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleOpenChange(open: boolean) {
    if (open && !loading && templates.length === 0) {
      toast.info("Create a template first", {
        description: (
          <Link href="/agent/message-templates" className="underline">
            Go to Message Templates
          </Link>
        ),
      });
    }
  }

  const iconClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-primary hover:bg-muted";

  const trigger =
    variant === "button" ? (
      <Button variant="outline" size="sm" className={cn("min-h-11 justify-start gap-2", className)}>
        {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <FileText className="h-4 w-4 shrink-0" />}
        Templates
      </Button>
    ) : (
      <button
        type="button"
        className={cn(iconClass, className)}
        aria-label="Send message template"
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      </button>
    );

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        {loading ? (
          <p className="px-3 py-2 text-sm text-muted-foreground">Loading templates...</p>
        ) : templates.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No templates yet.{" "}
            <Link href="/agent/message-templates" className="text-primary underline">
              Create one
            </Link>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => handleSelect(template)}
              >
                {template.name}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
