import {
  calculateOfficeFeeDiscount,
  parseOfficeFeeAmount,
  type ActivePromotion,
} from "@/lib/promotion";

type OfficeFeeDisplayProps = {
  officeFee: string | null;
  promotion: ActivePromotion;
  labels: {
    officeFee: string;
    discount: string;
    finalOfficeFee: string;
  };
};

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function OfficeFeeDisplay({ officeFee, promotion, labels }: OfficeFeeDisplayProps) {
  if (!officeFee) return null;

  const amount = parseOfficeFeeAmount(officeFee);

  if (!promotion.enabled || amount == null) {
    return (
      <p>
        <span className="font-medium text-[#0f1419]">{labels.officeFee}:</span>{" "}
        <span className="text-[#536471]">SAR {officeFee}</span>
      </p>
    );
  }

  const { originalFee, discountPercent, discountAmount, finalFee } = calculateOfficeFeeDiscount({
    officeFee: amount,
    discountPercent: promotion.discountPercent,
  });

  const discountLabel = labels.discount.replace("{percent}", String(discountPercent));

  return (
    <div className="sm:col-span-2 space-y-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 px-3 py-3">
      <p className="text-[14px]">
        <span className="font-medium text-[#0f1419]">{labels.officeFee}:</span>{" "}
        <span className="text-[#536471] line-through decoration-[#536471]/60">
          SAR {formatAmount(originalFee)}
        </span>
      </p>
      <p className="text-[14px]">
        <span className="font-medium text-emerald-800">{discountLabel}:</span>{" "}
        <span className="text-emerald-800">− SAR {formatAmount(discountAmount)}</span>
      </p>
      <p className="text-[15px]">
        <span className="font-bold text-[#0f1419]">{labels.finalOfficeFee}:</span>{" "}
        <span className="font-bold text-[#0f1419]">SAR {formatAmount(finalFee)}</span>
      </p>
    </div>
  );
}
