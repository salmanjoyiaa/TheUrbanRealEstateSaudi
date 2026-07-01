import { z } from "zod";
import { formatMonthDayYearWithComma } from "@/lib/format";

export const receiptSlipFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  payeeName: z.string().min(1, "Name is required").max(200),
  amount: z.coerce.number().nonnegative().optional().nullable(),
  amountInWords: z.string().max(500).optional().nullable(),
  bank: z.string().max(200).optional().nullable(),
  bankDate: z.string().max(50).optional().nullable(),
  paymentMethod: z.enum(["cash", "check"]).optional().nullable(),
  checkNumber: z.string().max(100).optional().nullable(),
  purpose: z.string().max(1000).optional().nullable(),
  purposeLine2: z.string().max(1000).optional().nullable(),
  accountant: z.string().max(200).optional().nullable(),
  receiver: z.string().max(200).optional().nullable(),
});

export type ReceiptSlipFormData = z.infer<typeof receiptSlipFormSchema>;

export type ReceiptSlipVisitContext = {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visit_date: string;
  status: string;
  visiting_agent_id?: string | null;
  notification_sent_at?: string | null;
  commission_received_amount?: number | null;
  visiting_agent?: { id: string; full_name: string } | null;
  properties?: {
    title: string;
    property_ref?: string | null;
  } | null;
};

export function canGenerateReceiptSlip(visit: {
  status: string;
  visiting_agent_id?: string | null;
  visiting_agent?: { id: string } | null;
  notification_sent_at?: string | null;
}): boolean {
  const hasAgent = !!(visit.visiting_agent_id ?? visit.visiting_agent?.id);
  const notified = !!visit.notification_sent_at;
  const eligibleStatus = visit.status === "confirmed" || visit.status === "completed";
  return hasAgent && notified && eligibleStatus;
}

export function splitAmount(amount: number | null | undefined): { riyals: string; halalas: string } {
  if (amount == null || Number.isNaN(amount)) {
    return { riyals: "", halalas: "" };
  }
  const fixed = Math.round(amount * 100) / 100;
  const riyals = Math.floor(fixed);
  const halalas = Math.round((fixed - riyals) * 100);
  return {
    riyals: String(riyals),
    halalas: halalas > 0 ? String(halalas).padStart(2, "0") : "",
  };
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function wordsUnder1000(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return `${TENS[t]}${o ? ` ${ONES[o]}` : ""}`.trim();
  }
  const h = Math.floor(n / 100);
  const r = n % 100;
  return `${ONES[h]} Hundred${r ? ` ${wordsUnder1000(r)}` : ""}`.trim();
}

function wordsUnderMillion(n: number): string {
  if (n < 1000) return wordsUnder1000(n);
  const t = Math.floor(n / 1000);
  const r = n % 1000;
  return `${wordsUnder1000(t)} Thousand${r ? ` ${wordsUnder1000(r)}` : ""}`.trim();
}

export function amountToEnglishWords(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount) || amount < 0) return "";
  const fixed = Math.round(amount * 100) / 100;
  const riyals = Math.floor(fixed);
  const halalas = Math.round((fixed - riyals) * 100);

  if (riyals === 0 && halalas === 0) return "Zero Saudi Riyals Only";

  const riyalPart =
    riyals === 0
      ? ""
      : riyals === 1
        ? "One Saudi Riyal"
        : `${wordsUnderMillion(riyals)} Saudi Riyals`;

  const halalaPart =
    halalas === 0
      ? ""
      : halalas === 1
        ? "One Halala"
        : `${wordsUnder1000(halalas)} Halalas`;

  if (riyalPart && halalaPart) return `${riyalPart} and ${halalaPart} Only`;
  return `${riyalPart || halalaPart} Only`;
}

export function buildReceiptSlipAutofill(
  visit: ReceiptSlipVisitContext,
  receiverName: string
): ReceiptSlipFormData {
  const propertyRef = visit.properties?.property_ref || "N/A";
  const propertyTitle = visit.properties?.title || "Property";
  const amount = visit.commission_received_amount ?? null;
  const titleAlreadyHasRef =
    propertyRef !== "N/A" &&
    (propertyTitle.includes(`ID ${propertyRef}`) ||
      propertyTitle.includes(`Property ID ${propertyRef}`) ||
      propertyTitle.includes(`#${propertyRef}`));

  const purpose = titleAlreadyHasRef
    ? `Property visit — ${propertyTitle}. Customer: ${visit.visitor_name}, ${visit.visitor_phone || "N/A"}`
    : `Property visit — ID ${propertyRef}: ${propertyTitle}. Customer: ${visit.visitor_name}, ${visit.visitor_phone || "N/A"}`;

  return {
    date: formatMonthDayYearWithComma(visit.visit_date),
    payeeName: visit.visitor_name,
    amount,
    amountInWords: amount != null ? amountToEnglishWords(amount) : "",
    bank: "",
    bankDate: "",
    paymentMethod: "cash",
    checkNumber: "",
    purpose,
    purposeLine2: "",
    accountant: "",
    receiver: receiverName,
  };
}

export function sanitizeReceiptSlipFileName(propertyRef: string | null | undefined, date: string) {
  const ref = (propertyRef || "visit").replace(/[^a-zA-Z0-9-]+/g, "-");
  const d = date.replace(/[^a-zA-Z0-9-]+/g, "-");
  return `receipt-slip-${ref}-${d}.pdf`;
}
