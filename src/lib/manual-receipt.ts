import { z } from "zod";
import { formatMonthDayYearWithComma } from "@/lib/format";
import {
  amountToEnglishWords,
  receiptSlipFormSchema,
  sanitizeReceiptSlipFileName,
  type ReceiptSlipFormData,
} from "@/lib/receipt-slip";

export { amountToEnglishWords, sanitizeReceiptSlipFileName };

export const manualReceiptFormSchema = receiptSlipFormSchema
  .extend({
    receiptNumber: z.string().min(1, "Receipt number is required").max(50),
    customerEmail: z.string().max(255).optional().nullable(),
    customerPhone: z.string().max(50).optional().nullable(),
    customerAddress: z.string().max(500).optional().nullable(),
    propertyId: z.string().uuid().optional().nullable(),
    propertyRef: z.string().max(100).optional().nullable(),
    propertyName: z.string().max(300).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const hasProperty =
      !!data.propertyRef?.trim() || !!data.propertyName?.trim();
    if (!hasProperty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Property ID or property name is required",
        path: ["propertyRef"],
      });
    }
  });

export type ManualReceiptFormData = z.infer<typeof manualReceiptFormSchema>;

export function buildRentReceiptPurpose({
  propertyRef,
  propertyName,
  payeeName,
  customerPhone,
}: {
  propertyRef?: string | null;
  propertyName?: string | null;
  payeeName?: string | null;
  customerPhone?: string | null;
}): string {
  const ref = propertyRef?.trim();
  const name = propertyName?.trim();
  const tenant = payeeName?.trim();
  const phone = customerPhone?.trim();

  let propertyPart = "";
  if (ref && name) propertyPart = `ID ${ref}: ${name}`;
  else if (ref) propertyPart = `ID ${ref}`;
  else if (name) propertyPart = name;

  const parts: string[] = [];
  if (propertyPart) parts.push(`Rent — ${propertyPart}`);
  else parts.push("Rent");

  if (tenant) {
    const tenantPart = phone ? `${tenant}, ${phone}` : tenant;
    parts.push(`Tenant: ${tenantPart}`);
  }

  return parts.join(". ");
}

export function toReceiptSlipPdfData(form: ManualReceiptFormData): ReceiptSlipFormData {
  return {
    date: form.date,
    payeeName: form.payeeName,
    amount: form.amount,
    amountInWords: form.amountInWords,
    bank: form.bank,
    bankDate: form.bankDate,
    paymentMethod: form.paymentMethod,
    checkNumber: form.checkNumber,
    purpose: form.purpose,
    purposeLine2: form.purposeLine2,
    accountant: form.accountant,
    receiver: form.receiver,
  };
}

export function defaultManualReceiptForm(): ManualReceiptFormData {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  return {
    receiptNumber: `REC-${yyyy}${mm}${dd}-001`,
    date: formatMonthDayYearWithComma(today),
    payeeName: "",
    amount: null,
    amountInWords: "",
    bank: "",
    bankDate: "",
    paymentMethod: "cash",
    checkNumber: "",
    purpose: "",
    purposeLine2: "",
    accountant: "",
    receiver: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    propertyId: null,
    propertyRef: "",
    propertyName: "",
  };
}

export function sanitizeManualReceiptFileName(
  receiptNumber: string,
  propertyRef?: string | null,
  date?: string
) {
  if (propertyRef?.trim()) {
    return sanitizeReceiptSlipFileName(propertyRef, date || receiptNumber);
  }
  const safe = (receiptNumber || "receipt").replace(/[^a-zA-Z0-9-]+/g, "-");
  return `receipt-${safe}.pdf`;
}
