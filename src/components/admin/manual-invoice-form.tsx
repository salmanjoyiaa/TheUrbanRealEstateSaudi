"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/providers/locale-provider";
import {
  computeInvoiceTotals,
  defaultManualInvoiceForm,
  formatSar,
  type ManualInvoiceFormData,
  type ManualInvoiceLineItem,
} from "@/lib/manual-invoice";

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

export function ManualInvoiceForm() {
  const { t } = useLocale();
  const [form, setForm] = useState<ManualInvoiceFormData>(() => defaultManualInvoiceForm());
  const [generating, setGenerating] = useState(false);

  const totals = useMemo(() => computeInvoiceTotals(form), [form]);

  function updateField<K extends keyof ManualInvoiceFormData>(key: K, value: ManualInvoiceFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateLineItem(index: number, patch: Partial<ManualInvoiceLineItem>) {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function addLineItem() {
    setForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: "", quantity: 1, unitPrice: 0 }],
    }));
  }

  function removeLineItem(index: number) {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.length <= 1 ? prev.lineItems : prev.lineItems.filter((_, i) => i !== index),
    }));
  }

  async function handleDownload() {
    if (!form.toName.trim()) {
      toast.error(t("admin.manualInvoice.customerRequired"));
      return;
    }
    if (form.lineItems.some((item) => !item.description.trim())) {
      toast.error(t("admin.manualInvoice.lineItemRequired"));
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/admin/manual-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || t("admin.manualInvoice.generateFailed"));
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const fileName = match?.[1] || "invoice.pdf";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(t("admin.manualInvoice.generated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("admin.manualInvoice.generateFailed"));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("admin.manualInvoice.sectionInvoice")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label={t("admin.manualInvoice.invoiceNumber")} htmlFor="inv-number">
            <Input
              id="inv-number"
              className="min-h-11"
              value={form.invoiceNumber}
              onChange={(e) => updateField("invoiceNumber", e.target.value)}
            />
          </Field>
          <Field label={t("admin.manualInvoice.invoiceDate")} htmlFor="inv-date">
            <Input
              id="inv-date"
              type="date"
              className="min-h-11"
              value={form.invoiceDate}
              onChange={(e) => updateField("invoiceDate", e.target.value)}
            />
          </Field>
          <Field label={t("admin.manualInvoice.dueDate")} htmlFor="inv-due">
            <Input
              id="inv-due"
              type="date"
              className="min-h-11"
              value={form.dueDate ?? ""}
              onChange={(e) => updateField("dueDate", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("admin.manualInvoice.sectionFrom")}
          </h2>
          <Field label={t("admin.manualInvoice.fromName")} htmlFor="from-name">
            <Input
              id="from-name"
              className="min-h-11"
              value={form.fromName}
              onChange={(e) => updateField("fromName", e.target.value)}
            />
          </Field>
          <Field label={t("admin.manualInvoice.address")} htmlFor="from-address">
            <Textarea
              id="from-address"
              rows={2}
              value={form.fromAddress ?? ""}
              onChange={(e) => updateField("fromAddress", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("admin.manualInvoice.phone")} htmlFor="from-phone">
              <Input
                id="from-phone"
                className="min-h-11"
                value={form.fromPhone ?? ""}
                onChange={(e) => updateField("fromPhone", e.target.value)}
              />
            </Field>
            <Field label={t("admin.manualInvoice.email")} htmlFor="from-email">
              <Input
                id="from-email"
                className="min-h-11"
                value={form.fromEmail ?? ""}
                onChange={(e) => updateField("fromEmail", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("admin.manualInvoice.sectionTo")}
          </h2>
          <Field label={t("admin.manualInvoice.toName")} htmlFor="to-name">
            <Input
              id="to-name"
              className="min-h-11"
              value={form.toName}
              onChange={(e) => updateField("toName", e.target.value)}
            />
          </Field>
          <Field label={t("admin.manualInvoice.address")} htmlFor="to-address">
            <Textarea
              id="to-address"
              rows={2}
              value={form.toAddress ?? ""}
              onChange={(e) => updateField("toAddress", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("admin.manualInvoice.phone")} htmlFor="to-phone">
              <Input
                id="to-phone"
                className="min-h-11"
                value={form.toPhone ?? ""}
                onChange={(e) => updateField("toPhone", e.target.value)}
              />
            </Field>
            <Field label={t("admin.manualInvoice.email")} htmlFor="to-email">
              <Input
                id="to-email"
                className="min-h-11"
                value={form.toEmail ?? ""}
                onChange={(e) => updateField("toEmail", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("admin.manualInvoice.sectionItems")}
          </h2>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addLineItem}>
            <Plus className="h-4 w-4" />
            {t("admin.manualInvoice.addItem")}
          </Button>
        </div>

        <div className="space-y-3">
          {form.lineItems.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[1fr_100px_120px_auto]"
            >
              <Field label={t("admin.manualInvoice.description")} htmlFor={`item-desc-${index}`}>
                <Input
                  id={`item-desc-${index}`}
                  className="min-h-11"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, { description: e.target.value })}
                />
              </Field>
              <Field label={t("admin.manualInvoice.quantity")} htmlFor={`item-qty-${index}`}>
                <Input
                  id={`item-qty-${index}`}
                  type="number"
                  min={0}
                  step="0.01"
                  className="min-h-11"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, { quantity: Number(e.target.value) || 0 })}
                />
              </Field>
              <Field label={t("admin.manualInvoice.unitPrice")} htmlFor={`item-price-${index}`}>
                <Input
                  id={`item-price-${index}`}
                  type="number"
                  min={0}
                  step="0.01"
                  className="min-h-11"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(index, { unitPrice: Number(e.target.value) || 0 })}
                />
              </Field>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11 text-destructive"
                  onClick={() => removeLineItem(index)}
                  disabled={form.lineItems.length <= 1}
                  aria-label={t("admin.manualInvoice.removeItem")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={t("admin.manualInvoice.taxPercent")} htmlFor="tax">
            <Input
              id="tax"
              type="number"
              min={0}
              max={100}
              step="0.01"
              className="min-h-11"
              value={form.taxPercent ?? 0}
              onChange={(e) => updateField("taxPercent", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label={t("admin.manualInvoice.discount")} htmlFor="discount">
            <Input
              id="discount"
              type="number"
              min={0}
              step="0.01"
              className="min-h-11"
              value={form.discount ?? 0}
              onChange={(e) => updateField("discount", Number(e.target.value) || 0)}
            />
          </Field>
          <div className="rounded-lg border bg-background p-3 sm:col-span-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t("admin.manualInvoice.subtotal")}</span>
              <span>{formatSar(totals.subtotal)} SAR</span>
            </div>
            <div className="mt-1 flex justify-between text-sm text-muted-foreground">
              <span>{t("admin.manualInvoice.tax")}</span>
              <span>{formatSar(totals.taxAmount)} SAR</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
              <span>{t("admin.manualInvoice.total")}</span>
              <span>{formatSar(totals.total)} SAR</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("admin.manualInvoice.sectionNotes")}
        </h2>
        <Field label={t("admin.manualInvoice.paymentTerms")} htmlFor="terms">
          <Textarea
            id="terms"
            rows={2}
            value={form.paymentTerms ?? ""}
            onChange={(e) => updateField("paymentTerms", e.target.value)}
          />
        </Field>
        <Field label={t("admin.manualInvoice.notes")} htmlFor="notes">
          <Textarea
            id="notes"
            rows={3}
            value={form.notes ?? ""}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="min-h-11 gap-2"
          onClick={() => void handleDownload()}
          disabled={generating}
        >
          <Download className="h-4 w-4" />
          {generating ? t("admin.manualInvoice.generating") : t("admin.manualInvoice.download")}
        </Button>
      </div>
    </div>
  );
}
