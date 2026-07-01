import path from "path";
import React from "react";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReceiptSlipFormData } from "@/lib/receipt-slip";
import { splitAmount } from "@/lib/receipt-slip";

const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansArabic-Regular.ttf");

Font.register({
  family: "NotoArabic",
  src: fontPath,
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingHorizontal: 36,
    paddingBottom: 48,
    fontSize: 10,
    color: "#111827",
    fontFamily: "Helvetica",
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBlocks: {
    width: 28,
    gap: 2,
  },
  logoBlockGrey: {
    width: 28,
    height: 14,
    backgroundColor: "#9ca3af",
  },
  logoBlockNavy: {
    width: 28,
    height: 14,
    backgroundColor: "#0f2f6a",
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f2f6a",
    letterSpacing: 0.2,
  },
  brandSub: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  voucherBox: {
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 2,
    padding: 8,
    minWidth: 180,
  },
  voucherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  checkboxMark: {
    fontSize: 9,
    fontWeight: 700,
  },
  voucherLabelEn: {
    fontSize: 9,
    flex: 1,
  },
  voucherLabelAr: {
    fontSize: 9,
    fontFamily: "NotoArabic",
    textAlign: "right",
    flex: 1,
  },
  bodyBox: {
    borderWidth: 1.5,
    borderColor: "#111827",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    minHeight: 520,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 14,
    gap: 6,
  },
  amountBoxLarge: {
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 2,
    minWidth: 72,
    minHeight: 28,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  amountBoxSmall: {
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 2,
    minWidth: 36,
    minHeight: 28,
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  amountLabelRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    marginTop: 2,
  },
  amountValue: {
    fontSize: 11,
    fontWeight: 700,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
    gap: 8,
  },
  fieldLabelEn: {
    fontSize: 10,
    minWidth: 120,
  },
  fieldValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    borderStyle: "dotted",
    paddingBottom: 2,
    fontSize: 10,
    textAlign: "center",
  },
  fieldLabelAr: {
    fontSize: 10,
    fontFamily: "NotoArabic",
    minWidth: 80,
    textAlign: "right",
  },
  tripleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
    gap: 12,
  },
  tripleField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  tripleValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    borderStyle: "dotted",
    paddingBottom: 2,
    fontSize: 9,
    textAlign: "center",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    gap: 24,
  },
  signatureBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 14,
    flexDirection: "row",
  },
  footerDark: {
    width: "25%",
    backgroundColor: "#111827",
  },
  footerGrey: {
    flex: 1,
    backgroundColor: "#6b7280",
  },
  smallLabel: {
    fontSize: 8,
    color: "#374151",
  },
});

function CheckItem({
  checked,
  labelEn,
  labelAr,
}: {
  checked: boolean;
  labelEn: string;
  labelAr: string;
}) {
  return (
    <View style={styles.voucherRow}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View style={styles.checkbox}>
          {checked ? <Text style={styles.checkboxMark}>X</Text> : null}
        </View>
        <Text style={styles.voucherLabelEn}>{labelEn}</Text>
      </View>
      <Text style={styles.voucherLabelAr}>{labelAr}</Text>
    </View>
  );
}

function BilingualField({
  labelEn,
  labelAr,
  value,
}: {
  labelEn: string;
  labelAr: string;
  value?: string | null;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabelEn}>{labelEn}</Text>
      <Text style={styles.fieldValue}>{value || " "}</Text>
      <Text style={styles.fieldLabelAr}>{labelAr}</Text>
    </View>
  );
}

export type ReceiptSlipPdfProps = {
  data: ReceiptSlipFormData;
};

export function ReceiptSlipPdf({ data }: ReceiptSlipPdfProps) {
  const { riyals, halalas } = splitAmount(data.amount ?? null);
  const isReceipt = data.voucherType === "receipt";
  const paymentDetail =
    data.paymentMethod === "check"
      ? data.checkNumber || "Check"
      : data.paymentMethod === "cash"
        ? "Cash / نقداً"
        : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <View style={styles.logoBlocks}>
              <View style={styles.logoBlockGrey} />
              <View style={styles.logoBlockNavy} />
            </View>
            <View>
              <Text style={styles.brandTitle}>TheUrbanRealEstateSaudi</Text>
              <Text style={styles.brandSub}>Real Estate Services</Text>
            </View>
          </View>

          <View style={styles.voucherBox}>
            <CheckItem checked={isReceipt} labelEn="Receipt" labelAr="سند قبض" />
            <CheckItem checked={!isReceipt} labelEn="Payment Voucher" labelAr="سند صرف" />
          </View>
        </View>

        <View style={styles.bodyBox}>
          <View style={styles.amountRow}>
            <View>
              <View style={styles.amountBoxLarge}>
                <Text style={styles.amountValue}>{riyals || " "}</Text>
              </View>
              <View style={styles.amountLabelRow}>
                <Text style={styles.smallLabel}>S.R.</Text>
                <Text style={[styles.smallLabel, { fontFamily: "NotoArabic" }]}>ريال</Text>
              </View>
            </View>
            <View>
              <View style={styles.amountBoxSmall}>
                <Text style={styles.amountValue}>{halalas || " "}</Text>
              </View>
              <View style={styles.amountLabelRow}>
                <Text style={styles.smallLabel}>H.</Text>
                <Text style={[styles.smallLabel, { fontFamily: "NotoArabic" }]}>هـ.</Text>
              </View>
            </View>
          </View>

          <BilingualField labelEn="Date:" labelAr="التاريخ" value={data.date} />

          <BilingualField
            labelEn="Received From / Paid To M/s:"
            labelAr="استلمنا من / اصرفوا الى السادة"
            value={data.payeeName}
          />

          <BilingualField
            labelEn="The Sum of SR."
            labelAr="مبلغ وقدره"
            value={data.amountInWords || undefined}
          />

          <View style={styles.tripleRow}>
            <View style={styles.tripleField}>
              <Text style={styles.fieldLabelEn}>Bank</Text>
              <Text style={styles.tripleValue}>{data.bank || " "}</Text>
              <Text style={[styles.fieldLabelAr, { minWidth: 40 }]}>على بنك</Text>
            </View>
            <View style={styles.tripleField}>
              <Text style={styles.fieldLabelEn}>Date</Text>
              <Text style={styles.tripleValue}>{data.bankDate || " "}</Text>
              <Text style={[styles.fieldLabelAr, { minWidth: 30 }]}>تاريخ</Text>
            </View>
            <View style={styles.tripleField}>
              <Text style={[styles.fieldLabelAr, { minWidth: 70 }]}>نقداً / شيك رقم</Text>
              <Text style={styles.tripleValue}>{paymentDetail || " "}</Text>
            </View>
          </View>

          <BilingualField labelEn="For" labelAr="وذلك عن" value={data.purpose || undefined} />
          <View style={[styles.fieldRow, { marginTop: -8 }]}>
            <Text style={styles.fieldLabelEn}> </Text>
            <Text style={styles.fieldValue}>{data.purposeLine2 || " "}</Text>
            <Text style={styles.fieldLabelAr}> </Text>
          </View>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.fieldLabelEn}>Accountant</Text>
              <Text style={[styles.fieldValue, { flex: 1 }]}>{data.accountant || " "}</Text>
              <Text style={styles.fieldLabelAr}>المحاسب</Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.fieldLabelEn}>Receiver</Text>
              <Text style={[styles.fieldValue, { flex: 1 }]}>{data.receiver || " "}</Text>
              <Text style={styles.fieldLabelAr}>المستلم</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerBar} fixed>
          <View style={styles.footerDark} />
          <View style={styles.footerGrey} />
        </View>
      </Page>
    </Document>
  );
}
