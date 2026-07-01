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
      toast.error(t("dashboard.receiptSlip.nameRequired"));
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
        throw new Error(json.error || t("dashboard.receiptSlip.generateFailed"));
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

      toast.success(t("dashboard.receiptSlip.generated"));
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("dashboard.receiptSlip.generateFailed"));
    } finally {
      setGenerating(false);
    }
  }

  const defaultTrigger = (
    <Button type="button" variant="outline" size="sm" className="gap-1.5">
      <FileText className="h-4 w-4" />
      {t("dashboard.receiptSlip.button")}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerNode !== undefined ? (
        triggerNode ? <DialogTrigger asChild>{triggerNode}</DialogTrigger> : null
      ) : (
        <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("dashboard.receiptSlip.title")}</DialogTitle>
          <DialogDescription>{t("dashboard.receiptSlip.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={applyAutofill} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              {t("dashboard.receiptSlip.autofill")}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>{t("dashboard.receiptSlip.voucherType")}</Label>
            <Select
              value={form.voucherType}
              onValueChange={(v) => updateField("voucherType", v as ReceiptSlipFormData["voucherType"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receipt">{t("dashboard.receiptSlip.receipt")}</SelectItem>
                <SelectItem value="payment">{t("dashboard.receiptSlip.payment")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slip-date">{t("dashboard.receiptSlip.date")}</Label>
              <Input
                id="slip-date"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slip-amount">{t("dashboard.receiptSlip.amount")}</Label>
              <Input
                id="slip-amount"
                type="number"
                min={0}
                step="0.01"
                value={form.amount ?? ""}
                onChange={(e) =>
                  updateField("amount", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slip-payee">{t("dashboard.receiptSlip.payeeName")}</Label>
            <Input
              id="slip-payee"
              value={form.payeeName}
              onChange={(e) => updateField("payeeName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slip-words">{t("dashboard.receiptSlip.amountInWords")}</Label>
            <Textarea
              id="slip-words"
              rows={2}
              value={form.amountInWords ?? ""}
              onChange={(e) => updateField("amountInWords", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slip-bank">{t("dashboard.receiptSlip.bank")}</Label>
              <Input id="slip-bank" value={form.bank ?? ""} onChange={(e) => updateField("bank", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slip-bank-date">{t("dashboard.receiptSlip.bankDate")}</Label>
              <Input
                id="slip-bank-date"
                value={form.bankDate ?? ""}
                onChange={(e) => updateField("bankDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("dashboard.receiptSlip.paymentMethod")}</Label>
              <Select
                value={form.paymentMethod ?? "cash"}
                onValueChange={(v) =>
                  updateField("paymentMethod", v as ReceiptSlipFormData["paymentMethod"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t("dashboard.receiptSlip.cash")}</SelectItem>
                  <SelectItem value="check">{t("dashboard.receiptSlip.check")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slip-check">{t("dashboard.receiptSlip.checkNumber")}</Label>
              <Input
                id="slip-check"
                value={form.checkNumber ?? ""}
                onChange={(e) => updateField("checkNumber", e.target.value)}
                disabled={form.paymentMethod !== "check"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slip-purpose">{t("dashboard.receiptSlip.purpose")}</Label>
            <Textarea
              id="slip-purpose"
              rows={2}
              value={form.purpose ?? ""}
              onChange={(e) => updateField("purpose", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slip-purpose2">{t("dashboard.receiptSlip.purposeLine2")}</Label>
            <Input
              id="slip-purpose2"
              value={form.purposeLine2 ?? ""}
              onChange={(e) => updateField("purposeLine2", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slip-receiver">{t("dashboard.receiptSlip.receiver")}</Label>
              <Input
                id="slip-receiver"
                value={form.receiver ?? ""}
                onChange={(e) => updateField("receiver", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slip-accountant">{t("dashboard.receiptSlip.accountant")}</Label>
              <Input
                id="slip-accountant"
                value={form.accountant ?? ""}
                onChange={(e) => updateField("accountant", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t("dashboard.receiptSlip.cancel")}
          </Button>
          <Button type="button" onClick={() => void handleGenerate()} disabled={generating}>
            {generating ? t("dashboard.receiptSlip.generating") : t("dashboard.receiptSlip.generate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
