"use client";

import { useCallback, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
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
import { useLocale } from "@/providers/locale-provider";
import { PropertySearchPicker } from "@/components/admin/property-search-picker";
import {
  amountToEnglishWords,
  buildRentReceiptPurpose,
  defaultManualReceiptForm,
  type ManualReceiptFormData,
} from "@/lib/manual-receipt";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>
  );
}

export function ManualReceiptForm() {
  const { t } = useLocale();
  const [form, setForm] = useState<ManualReceiptFormData>(() => defaultManualReceiptForm());
  const [generating, setGenerating] = useState(false);

  const syncPurpose = useCallback((next: ManualReceiptFormData) => {
    next.purpose = buildRentReceiptPurpose({
      propertyRef: next.propertyRef,
      propertyName: next.propertyName,
      payeeName: next.payeeName,
      customerPhone: next.customerPhone,
    });
    return next;
  }, []);

  function updateField<K extends keyof ManualReceiptFormData>(
    key: K,
    value: ManualReceiptFormData[K],
    options?: { syncPurpose?: boolean }
  ) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "amount" && typeof value === "number") {
        next.amountInWords = amountToEnglishWords(value);
      }
      if (
        options?.syncPurpose ||
        key === "propertyRef" ||
        key === "propertyName" ||
        key === "payeeName" ||
        key === "customerPhone"
      ) {
        return syncPurpose(next);
      }
      return next;
    });
  }

  function handlePropertySelect(selection: {
    id: string;
    propertyRef: string;
    propertyName: string;
  }) {
    setForm((prev) =>
      syncPurpose({
        ...prev,
        propertyId: selection.id,
        propertyRef: selection.propertyRef,
        propertyName: selection.propertyName,
      })
    );
  }

  function clearPropertyLink() {
    setForm((prev) =>
      syncPurpose({
        ...prev,
        propertyId: null,
      })
    );
  }

  const selectedPropertyLabel =
    form.propertyRef?.trim() || form.propertyName?.trim()
      ? [form.propertyRef?.trim(), form.propertyName?.trim()].filter(Boolean).join(" — ")
      : null;

  async function handleDownload() {
    if (!form.payeeName.trim()) {
      toast.error(t("admin.manualReceipt.payeeRequired"));
      return;
    }
    if (!form.propertyRef?.trim() && !form.propertyName?.trim()) {
      toast.error(t("admin.manualReceipt.propertyRequired"));
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/admin/manual-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || t("admin.manualReceipt.generateFailed"));
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const fileName = match?.[1] || "receipt.pdf";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(t("admin.manualReceipt.generated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("admin.manualReceipt.generateFailed"));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <SectionTitle>{t("admin.manualReceipt.sectionReceipt")}</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("admin.manualReceipt.receiptNumber")} htmlFor="rec-number">
            <Input
              id="rec-number"
              className="min-h-11"
              value={form.receiptNumber}
              onChange={(e) => updateField("receiptNumber", e.target.value)}
            />
          </Field>
          <Field label={t("admin.receiptSlip.date")} htmlFor="rec-date">
            <Input
              id="rec-date"
              className="min-h-11"
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <SectionTitle>{t("admin.manualReceipt.sectionProperty")}</SectionTitle>
        <Field label={t("admin.manualReceipt.searchProperty")}>
          <PropertySearchPicker
            searchLabel={t("admin.manualReceipt.searchProperty")}
            clearLabel={t("admin.manualReceipt.clearProperty")}
            placeholder={t("admin.manualReceipt.searchPropertyPlaceholder")}
            selectedLabel={form.propertyId ? selectedPropertyLabel : null}
            onSelect={handlePropertySelect}
            onClear={form.propertyId ? clearPropertyLink : undefined}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("admin.manualReceipt.propertyRef")} htmlFor="rec-property-ref">
            <Input
              id="rec-property-ref"
              className="min-h-11"
              value={form.propertyRef ?? ""}
              onChange={(e) => updateField("propertyRef", e.target.value)}
            />
          </Field>
          <Field label={t("admin.manualReceipt.propertyName")} htmlFor="rec-property-name">
            <Input
              id="rec-property-name"
              className="min-h-11"
              value={form.propertyName ?? ""}
              onChange={(e) => updateField("propertyName", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <SectionTitle>{t("admin.manualReceipt.sectionCustomer")}</SectionTitle>
        <Field label={t("admin.receiptSlip.payeeName")} htmlFor="rec-payee">
          <Input
            id="rec-payee"
            className="min-h-11"
            value={form.payeeName}
            onChange={(e) => updateField("payeeName", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("admin.manualInvoice.phone")} htmlFor="rec-phone">
            <Input
              id="rec-phone"
              className="min-h-11"
              value={form.customerPhone ?? ""}
              onChange={(e) => updateField("customerPhone", e.target.value)}
            />
          </Field>
          <Field label={t("admin.manualInvoice.email")} htmlFor="rec-email">
            <Input
              id="rec-email"
              className="min-h-11"
              value={form.customerEmail ?? ""}
              onChange={(e) => updateField("customerEmail", e.target.value)}
            />
          </Field>
        </div>
        <Field label={t("admin.manualInvoice.address")} htmlFor="rec-address">
          <Textarea
            id="rec-address"
            rows={2}
            value={form.customerAddress ?? ""}
            onChange={(e) => updateField("customerAddress", e.target.value)}
          />
        </Field>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <SectionTitle>{t("admin.receiptSlip.sectionDetails")}</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("admin.receiptSlip.amount")} htmlFor="rec-amount">
            <Input
              id="rec-amount"
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
          </Field>
        </div>
        <Field label={t("admin.receiptSlip.amountInWords")} htmlFor="rec-words">
          <Textarea
            id="rec-words"
            rows={2}
            value={form.amountInWords ?? ""}
            onChange={(e) => updateField("amountInWords", e.target.value)}
          />
        </Field>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <SectionTitle>{t("admin.receiptSlip.sectionPayment")}</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("admin.receiptSlip.bank")} htmlFor="rec-bank">
            <Input
              id="rec-bank"
              className="min-h-11"
              value={form.bank ?? ""}
              onChange={(e) => updateField("bank", e.target.value)}
            />
          </Field>
          <Field label={t("admin.receiptSlip.bankDate")} htmlFor="rec-bank-date">
            <Input
              id="rec-bank-date"
              className="min-h-11"
              value={form.bankDate ?? ""}
              onChange={(e) => updateField("bankDate", e.target.value)}
            />
          </Field>
        </div>
        <Field label={t("admin.receiptSlip.paymentMethod")}>
          <Select
            value={form.paymentMethod ?? "cash"}
            onValueChange={(v) =>
              updateField("paymentMethod", v as ManualReceiptFormData["paymentMethod"])
            }
          >
            <SelectTrigger className="min-h-11 w-full sm:max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">{t("admin.receiptSlip.cash")}</SelectItem>
              <SelectItem value="check">{t("admin.receiptSlip.check")}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {form.paymentMethod === "check" && (
          <Field label={t("admin.receiptSlip.checkNumber")} htmlFor="rec-check">
            <Input
              id="rec-check"
              className="min-h-11"
              value={form.checkNumber ?? ""}
              onChange={(e) => updateField("checkNumber", e.target.value)}
            />
          </Field>
        )}
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <SectionTitle>{t("admin.receiptSlip.sectionPurpose")}</SectionTitle>
        <p className="text-xs text-muted-foreground">{t("admin.manualReceipt.purposeHint")}</p>
        <Field label={t("admin.receiptSlip.purpose")} htmlFor="rec-purpose">
          <Textarea
            id="rec-purpose"
            rows={3}
            value={form.purpose ?? ""}
            onChange={(e) => updateField("purpose", e.target.value, { syncPurpose: false })}
          />
        </Field>
        <Field label={t("admin.receiptSlip.purposeLine2")} htmlFor="rec-purpose2">
          <Input
            id="rec-purpose2"
            className="min-h-11"
            value={form.purposeLine2 ?? ""}
            onChange={(e) => updateField("purposeLine2", e.target.value)}
          />
        </Field>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <SectionTitle>{t("admin.receiptSlip.sectionSignatures")}</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("admin.receiptSlip.receiver")} htmlFor="rec-receiver">
            <Input
              id="rec-receiver"
              className="min-h-11"
              value={form.receiver ?? ""}
              onChange={(e) => updateField("receiver", e.target.value)}
            />
          </Field>
          <Field label={t("admin.receiptSlip.accountant")} htmlFor="rec-accountant">
            <Input
              id="rec-accountant"
              className="min-h-11"
              value={form.accountant ?? ""}
              onChange={(e) => updateField("accountant", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="min-h-11 gap-2"
          onClick={() => void handleDownload()}
          disabled={generating}
        >
          <Download className="h-4 w-4" />
          {generating ? t("admin.manualReceipt.generating") : t("admin.manualReceipt.download")}
        </Button>
      </div>
    </div>
  );
}
