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

const EN = "Helvetica";
const AR = "NotoArabic";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingHorizontal: 40,
    paddingBottom: 56,
    fontSize: 10,
    color: "#111827",
    fontFamily: EN,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBlocks: {
    width: 30,
    gap: 3,
  },
  logoBlockGrey: {
    width: 30,
    height: 15,
    backgroundColor: "#9ca3af",
  },
  logoBlockNavy: {
    width: 30,
    height: 15,
    backgroundColor: "#0f2f6a",
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f2f6a",
  },
  brandSub: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  voucherBox: {
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: 190,
  },
  voucherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  voucherLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 11,
    height: 11,
    borderWidth: 1,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  checkboxMark: {
    fontSize: 8,
    fontWeight: 700,
  },
  voucherLabelEn: {
    fontSize: 9,
    fontFamily: EN,
  },
  voucherLabelAr: {
    fontSize: 9,
    fontFamily: AR,
    textAlign: "right",
    width: 52,
  },
  bodyBox: {
    borderWidth: 1.5,
    borderColor: "#111827",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
    minHeight: 500,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginBottom: 18,
    gap: 8,
  },
  amountCol: {
    alignItems: "center",
  },
  amountBoxLarge: {
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 2,
    width: 76,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  amountBoxSmall: {
    borderWidth: 1,
    borderColor: "#111827",
    borderRadius: 2,
    width: 40,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  amountValue: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: EN,
  },
  amountLabelRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 3,
  },
  amountLabelEn: {
    fontSize: 8,
    fontFamily: EN,
    color: "#374151",
  },
  amountLabelAr: {
    fontSize: 8,
    fontFamily: AR,
    color: "#374151",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 18,
    gap: 10,
  },
  fieldLabelEn: {
    fontSize: 9.5,
    fontFamily: EN,
    width: 130,
    flexShrink: 0,
  },
  fieldLabelEnWide: {
    fontSize: 9.5,
    fontFamily: EN,
    width: 155,
    flexShrink: 0,
  },
  fieldValueWrap: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#6b7280",
    borderStyle: "dotted",
    minHeight: 16,
    justifyContent: "flex-end",
    paddingBottom: 3,
  },
  fieldValue: {
    fontSize: 10,
    fontFamily: EN,
    textAlign: "center",
  },
  fieldValueMulti: {
    fontSize: 9,
    fontFamily: EN,
    textAlign: "center",
    lineHeight: 1.35,
  },
  fieldLabelAr: {
    fontSize: 9.5,
    fontFamily: AR,
    width: 110,
    flexShrink: 0,
    textAlign: "right",
  },
  tripleRow: {
    flexDirection: "row",
    marginBottom: 18,
    gap: 14,
  },
  tripleCol: {
    flex: 1,
  },
  tripleLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  tripleLabelEn: {
    fontSize: 9,
    fontFamily: EN,
  },
  tripleLabelAr: {
    fontSize: 9,
    fontFamily: AR,
  },
  tripleValueWrap: {
    borderBottomWidth: 1,
    borderBottomColor: "#6b7280",
    borderStyle: "dotted",
    minHeight: 14,
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  tripleValue: {
    fontSize: 9,
    fontFamily: EN,
    textAlign: "center",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 28,
  },
  signatureCol: {
    flex: 1,
  },
  signatureLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  signatureLabelEn: {
    fontSize: 9.5,
    fontFamily: EN,
  },
  signatureLabelAr: {
    fontSize: 9.5,
    fontFamily: AR,
  },
  signatureLineWrap: {
    borderBottomWidth: 1,
    borderBottomColor: "#6b7280",
    borderStyle: "dotted",
    minHeight: 18,
    justifyContent: "flex-end",
    paddingBottom: 3,
  },
  signatureValue: {
    fontSize: 10,
    fontFamily: EN,
    textAlign: "center",
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 16,
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
      <View style={styles.voucherLeft}>
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
  wide = false,
  multiline = false,
}: {
  labelEn: string;
  labelAr: string;
  value?: string | null;
  wide?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={wide ? styles.fieldLabelEnWide : styles.fieldLabelEn}>{labelEn}</Text>
      <View style={styles.fieldValueWrap}>
        <Text style={multiline ? styles.fieldValueMulti : styles.fieldValue}>{value?.trim() || " "}</Text>
      </View>
      <Text style={styles.fieldLabelAr}>{labelAr}</Text>
    </View>
  );
}

function SignatureField({
  labelEn,
  labelAr,
  value,
}: {
  labelEn: string;
  labelAr: string;
  value?: string | null;
}) {
  return (
    <View style={styles.signatureCol}>
      <View style={styles.signatureLabelRow}>
        <Text style={styles.signatureLabelEn}>{labelEn}</Text>
        <Text style={styles.signatureLabelAr}>{labelAr}</Text>
      </View>
      <View style={styles.signatureLineWrap}>
        <Text style={styles.signatureValue}>{value?.trim() || " "}</Text>
      </View>
    </View>
  );
}

export type ReceiptSlipPdfProps = {
  data: ReceiptSlipFormData;
};

export function ReceiptSlipPdf({ data }: ReceiptSlipPdfProps) {
  const { riyals, halalas } = splitAmount(data.amount ?? null);
  const isReceipt = data.voucherType === "receipt";

  const paymentEn =
    data.paymentMethod === "check"
      ? data.checkNumber?.trim() || "Check"
      : data.paymentMethod === "cash"
        ? "Cash"
        : "";
  const paymentAr =
    data.paymentMethod === "check"
      ? data.checkNumber?.trim() || "شيك"
      : data.paymentMethod === "cash"
        ? "نقداً"
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
            <View style={styles.amountCol}>
              <View style={styles.amountBoxLarge}>
                <Text style={styles.amountValue}>{riyals || " "}</Text>
              </View>
              <View style={styles.amountLabelRow}>
                <Text style={styles.amountLabelEn}>S.R.</Text>
                <Text style={styles.amountLabelAr}>ريال</Text>
              </View>
            </View>
            <View style={styles.amountCol}>
              <View style={styles.amountBoxSmall}>
                <Text style={styles.amountValue}>{halalas || " "}</Text>
              </View>
              <View style={styles.amountLabelRow}>
                <Text style={styles.amountLabelEn}>H.</Text>
                <Text style={styles.amountLabelAr}>هـ.</Text>
              </View>
            </View>
          </View>

          <BilingualField labelEn="Date:" labelAr="التاريخ" value={data.date} />

          <BilingualField
            labelEn="Received From / Paid To M/s:"
            labelAr="استلمنا من / اصرفوا إلى السادة"
            value={data.payeeName}
            wide
          />

          <BilingualField
            labelEn="The Sum of SR."
            labelAr="مبلغ وقدره"
            value={data.amountInWords || undefined}
          />

          <View style={styles.tripleRow}>
            <View style={styles.tripleCol}>
              <View style={styles.tripleLabelRow}>
                <Text style={styles.tripleLabelEn}>Bank</Text>
                <Text style={styles.tripleLabelAr}>على بنك</Text>
              </View>
              <View style={styles.tripleValueWrap}>
                <Text style={styles.tripleValue}>{data.bank?.trim() || " "}</Text>
              </View>
            </View>
            <View style={styles.tripleCol}>
              <View style={styles.tripleLabelRow}>
                <Text style={styles.tripleLabelEn}>Date</Text>
                <Text style={styles.tripleLabelAr}>تاريخ</Text>
              </View>
              <View style={styles.tripleValueWrap}>
                <Text style={styles.tripleValue}>{data.bankDate?.trim() || " "}</Text>
              </View>
            </View>
            <View style={styles.tripleCol}>
              <View style={styles.tripleLabelRow}>
                <Text style={styles.tripleLabelEn}>Cash / Check No.</Text>
                <Text style={styles.tripleLabelAr}>نقداً / شيك رقم</Text>
              </View>
              <View style={styles.tripleValueWrap}>
                <Text style={styles.tripleValue}>
                  {paymentEn ? (
                    <>
                      <Text style={{ fontFamily: EN }}>{paymentEn}</Text>
                      {paymentAr ? (
                        <>
                          <Text style={{ fontFamily: EN }}> / </Text>
                          <Text style={{ fontFamily: AR }}>{paymentAr}</Text>
                        </>
                      ) : null}
                    </>
                  ) : (
                    " "
                  )}
                </Text>
              </View>
            </View>
          </View>

          <BilingualField labelEn="For" labelAr="وذلك عن" value={data.purpose || undefined} multiline />
          <BilingualField labelEn=" " labelAr=" " value={data.purposeLine2 || undefined} />

          <View style={styles.signatureRow}>
            <SignatureField labelEn="Accountant" labelAr="المحاسب" value={data.accountant} />
            <SignatureField labelEn="Receiver" labelAr="المستلم" value={data.receiver} />
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
