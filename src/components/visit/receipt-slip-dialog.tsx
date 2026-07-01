"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  amountToEnglishWords,
  buildReceiptSlipAutofill,
  type ReceiptSlipFormData,
  type ReceiptSlipVisitContext,
} from "@/lib/receipt-slip";

export type ReceiptSlipDialogProps = {
  visit: ReceiptSlipVisitContext;
  apiPath: string;
  receiverName: string;
  triggerNode?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function FieldGroup({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
  );
}

export function ReceiptSlipDialog({
  visit,
  apiPath,
  receiverName,
  triggerNode,
  open: controlledOpen,
  onOpenChange,
}: ReceiptSlipDialogProps) {
  const { t } = useLocale();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [form, setForm] = useState<ReceiptSlipFormData>(() =>
    buildReceiptSlipAutofill(visit, receiverName)
  );
  const [generating, setGenerating] = useState(false);

  const applyAutofill = useCallback(() => {
    setForm(buildReceiptSlipAutofill(visit, receiverName));
  }, [visit, receiverName]);

  useEffect(() => {
    if (open) {
      applyAutofill();
    }
  }, [open, applyAutofill]);

  function updateField<K extends keyof ReceiptSlipFormData>(key: K, value: ReceiptSlipFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "amount" && typeof value === "number") {
        next.amountInWords = amountToEnglishWords(value);
      }
      return next;
    });
  }

  async function handleGenerate() {
    if (!form.payeeName.trim()) {
      toast.error(t("admin.receiptSlip.nameRequired"));
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || t("admin.receiptSlip.generateFailed"));
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const fileName = match?.[1] || "receipt-slip.pdf";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(t("admin.receiptSlip.generated"));
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("admin.receiptSlip.generateFailed"));
    } finally {
      setGenerating(false);
    }
  }

  const defaultTrigger = (
    <Button type="button" variant="outline" size="sm" className="gap-1.5">
      <FileText className="h-4 w-4" />
      {t("admin.receiptSlip.button")}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerNode !== undefined ? (
        triggerNode ? <DialogTrigger asChild>{triggerNode}</DialogTrigger> : null
      ) : (
        <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      )}
      <DialogContent
        className={cn(
          "flex max-h-[92dvh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0",
          "sm:max-h-[90vh] sm:max-w-xl sm:rounded-xl"
        )}
      >
        <DialogHeader className="shrink-0 space-y-1 border-b px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-left text-lg font-semibold leading-tight">
                {t("admin.receiptSlip.title")}
              </DialogTitle>
              <DialogDescription className="text-left text-sm">
                {t("admin.receiptSlip.subtitle")}
              </DialogDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={applyAutofill}
            className="mt-2 w-full gap-1.5 sm:w-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t("admin.receiptSlip.autofill")}
          </Button>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="space-y-6">
            <section className="space-y-3">
              <SectionTitle>{t("admin.receiptSlip.voucherType")}</SectionTitle>
              <Select
                value={form.voucherType}
                onValueChange={(v) => updateField("voucherType", v as ReceiptSlipFormData["voucherType"])}
              >
                <SelectTrigger className="min-h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">{t("admin.receiptSlip.receipt")}</SelectItem>
                  <SelectItem value="payment">{t("admin.receiptSlip.payment")}</SelectItem>
                </SelectContent>
              </Select>
            </section>

            <section className="space-y-3">
              <SectionTitle>{t("admin.receiptSlip.sectionDetails")}</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup label={t("admin.receiptSlip.date")} htmlFor="slip-date">
                  <Input
                    id="slip-date"
                    className="min-h-11"
                    value={form.date}
                    onChange={(e) => updateField("date", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label={t("admin.receiptSlip.amount")} htmlFor="slip-amount">
                  <Input
                    id="slip-amount"
                    className="min-h-11"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount ?? ""}
                    onChange={(e) =>
                      updateField("amount", e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </FieldGroup>
              </div>

              <FieldGroup label={t("admin.receiptSlip.payeeName")} htmlFor="slip-payee">
                <Input
                  id="slip-payee"
                  className="min-h-11"
                  value={form.payeeName}
                  onChange={(e) => updateField("payeeName", e.target.value)}
                />
              </FieldGroup>

              <FieldGroup label={t("admin.receiptSlip.amountInWords")} htmlFor="slip-words">
                <Textarea
                  id="slip-words"
                  rows={2}
                  className="resize-none"
                  value={form.amountInWords ?? ""}
                  onChange={(e) => updateField("amountInWords", e.target.value)}
                />
              </FieldGroup>
            </section>

            <section className="space-y-3">
              <SectionTitle>{t("admin.receiptSlip.sectionPayment")}</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup label={t("admin.receiptSlip.bank")} htmlFor="slip-bank">
                  <Input
                    id="slip-bank"
                    className="min-h-11"
                    value={form.bank ?? ""}
                    onChange={(e) => updateField("bank", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label={t("admin.receiptSlip.bankDate")} htmlFor="slip-bank-date">
                  <Input
                    id="slip-bank-date"
                    className="min-h-11"
                    value={form.bankDate ?? ""}
                    onChange={(e) => updateField("bankDate", e.target.value)}
                  />
                </FieldGroup>
              </div>

              <FieldGroup label={t("admin.receiptSlip.paymentMethod")}>
                <Select
                  value={form.paymentMethod ?? "cash"}
                  onValueChange={(v) =>
                    updateField("paymentMethod", v as ReceiptSlipFormData["paymentMethod"])
                  }
                >
                  <SelectTrigger className="min-h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t("admin.receiptSlip.cash")}</SelectItem>
                    <SelectItem value="check">{t("admin.receiptSlip.check")}</SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>

              {form.paymentMethod === "check" && (
                <FieldGroup label={t("admin.receiptSlip.checkNumber")} htmlFor="slip-check">
                  <Input
                    id="slip-check"
                    className="min-h-11"
                    value={form.checkNumber ?? ""}
                    onChange={(e) => updateField("checkNumber", e.target.value)}
                  />
                </FieldGroup>
              )}
            </section>

            <section className="space-y-3">
              <SectionTitle>{t("admin.receiptSlip.sectionPurpose")}</SectionTitle>
              <FieldGroup label={t("admin.receiptSlip.purpose")} htmlFor="slip-purpose">
                <Textarea
                  id="slip-purpose"
                  rows={3}
                  className="resize-none"
                  value={form.purpose ?? ""}
                  onChange={(e) => updateField("purpose", e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label={t("admin.receiptSlip.purposeLine2")} htmlFor="slip-purpose2">
                <Input
                  id="slip-purpose2"
                  className="min-h-11"
                  value={form.purposeLine2 ?? ""}
                  onChange={(e) => updateField("purposeLine2", e.target.value)}
                />
              </FieldGroup>
            </section>

            <section className="space-y-3">
              <SectionTitle>{t("admin.receiptSlip.sectionSignatures")}</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FieldGroup label={t("admin.receiptSlip.receiver")} htmlFor="slip-receiver">
                  <Input
                    id="slip-receiver"
                    className="min-h-11"
                    value={form.receiver ?? ""}
                    onChange={(e) => updateField("receiver", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label={t("admin.receiptSlip.accountant")} htmlFor="slip-accountant">
                  <Input
                    id="slip-accountant"
                    className="min-h-11"
                    value={form.accountant ?? ""}
                    onChange={(e) => updateField("accountant", e.target.value)}
                  />
                </FieldGroup>
              </div>
            </section>
          </div>
        </div>

        <DialogFooter
          className={cn(
            "shrink-0 gap-2 border-t bg-background px-4 py-3 sm:px-6 sm:py-4",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          )}
        >
          <Button type="button" variant="outline" className="min-h-11 flex-1 sm:flex-none" onClick={() => setOpen(false)}>
            {t("admin.receiptSlip.cancel")}
          </Button>
          <Button
            type="button"
            className="min-h-11 flex-1 sm:flex-none"
            onClick={() => void handleGenerate()}
            disabled={generating}
          >
            {generating ? t("admin.receiptSlip.generating") : t("admin.receiptSlip.generate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
