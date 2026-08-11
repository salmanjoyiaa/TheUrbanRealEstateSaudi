import { z } from "zod";

export const manualInvoiceLineItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  unitPrice: z.coerce.number().nonnegative("Unit price cannot be negative"),
});

export const manualInvoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required").max(50),
  invoiceDate: z.string().min(1, "Invoice date is required").max(50),
  dueDate: z.string().max(50).optional().nullable(),
  fromName: z.string().min(1, "Company name is required").max(200),
  fromAddress: z.string().max(500).optional().nullable(),
  fromPhone: z.string().max(50).optional().nullable(),
  fromEmail: z.string().max(255).optional().nullable(),
  toName: z.string().min(1, "Customer name is required").max(200),
  toAddress: z.string().max(500).optional().nullable(),
  toPhone: z.string().max(50).optional().nullable(),
  toEmail: z.string().max(255).optional().nullable(),
  lineItems: z.array(manualInvoiceLineItemSchema).min(1, "Add at least one line item"),
  taxPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  discount: z.coerce.number().nonnegative().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  paymentTerms: z.string().max(1000).optional().nullable(),
});

export type ManualInvoiceLineItem = z.infer<typeof manualInvoiceLineItemSchema>;
export type ManualInvoiceFormData = z.infer<typeof manualInvoiceFormSchema>;

export type InvoiceTotals = {
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
};

export function lineItemAmount(item: { quantity: number; unitPrice: number }): number {
  return Math.round(item.quantity * item.unitPrice * 100) / 100;
}

export function computeInvoiceTotals(data: {
  lineItems: Array<{ quantity: number; unitPrice: number }>;
  taxPercent?: number | null;
  discount?: number | null;
}): InvoiceTotals {
  const subtotal = Math.round(
    data.lineItems.reduce((sum, item) => sum + lineItemAmount(item), 0) * 100
  ) / 100;
  const taxPercent = data.taxPercent ?? 0;
  const taxAmount = Math.round(subtotal * (taxPercent / 100) * 100) / 100;
  const discount = Math.round((data.discount ?? 0) * 100) / 100;
  const total = Math.max(0, Math.round((subtotal + taxAmount - discount) * 100) / 100);
  return { subtotal, taxAmount, discount, total };
}

export function formatSar(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function defaultManualInvoiceForm(): ManualInvoiceFormData {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  return {
    invoiceNumber: `INV-${yyyy}${mm}${dd}-001`,
    invoiceDate: dateStr,
    dueDate: "",
    fromName: "TheUrbanRealEstateSaudi",
    fromAddress: "",
    fromPhone: "",
    fromEmail: "",
    toName: "",
    toAddress: "",
    toPhone: "",
    toEmail: "",
    lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
    taxPercent: 0,
    discount: 0,
    notes: "",
    paymentTerms: "",
  };
}

export function sanitizeInvoiceFileName(invoiceNumber: string) {
  const safe = (invoiceNumber || "invoice").replace(/[^a-zA-Z0-9-]+/g, "-");
  return `invoice-${safe}.pdf`;
}
