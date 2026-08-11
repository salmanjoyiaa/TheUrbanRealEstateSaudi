import path from "path";
import React from "react";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  computeInvoiceTotals,
  formatSar,
  lineItemAmount,
  type ManualInvoiceFormData,
} from "@/lib/manual-invoice";

const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansArabic-Regular.ttf");

Font.register({
  family: "NotoArabic",
  src: fontPath,
});

const EN = "Helvetica";
const AR = "NotoArabic";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 40,
    paddingBottom: 40,
    fontSize: 10,
    color: "#111827",
    fontFamily: EN,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#0f2f6a",
  },
  brand: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f2f6a",
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 8,
    color: "#6b7280",
    fontFamily: AR,
  },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f2f6a",
    textAlign: "right",
  },
  metaBlock: {
    marginTop: 6,
    alignItems: "flex-end",
  },
  metaText: {
    fontSize: 9,
    color: "#374151",
    marginTop: 2,
  },
  partiesRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  partyCol: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "#0f2f6a",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 3,
  },
  partyLine: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 2,
  },
  table: {
    marginTop: 4,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f2f6a",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 700,
    color: "#ffffff",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  colDesc: { flex: 3.2 },
  colQty: { flex: 0.8, textAlign: "right" },
  colPrice: { flex: 1.2, textAlign: "right" },
  colAmount: { flex: 1.2, textAlign: "right" },
  cell: {
    fontSize: 9,
    color: "#111827",
  },
  totalsWrap: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  totalsBox: {
    width: 220,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 9,
    color: "#4b5563",
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 700,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#0f2f6a",
  },
  grandLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0f2f6a",
  },
  grandValue: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0f2f6a",
  },
  notesBlock: {
    marginTop: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#0f2f6a",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 9,
    color: "#4b5563",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
  },
});

export type ManualInvoicePdfProps = {
  data: ManualInvoiceFormData;
};

export function ManualInvoicePdf({ data }: ManualInvoicePdfProps) {
  const totals = computeInvoiceTotals(data);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>{data.fromName || "TheUrbanRealEstateSaudi"}</Text>
            <Text style={styles.brandSub}>فاتورة / Invoice</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.metaBlock}>
              <Text style={styles.metaText}>No. {data.invoiceNumber}</Text>
              <Text style={styles.metaText}>Date: {data.invoiceDate}</Text>
              {data.dueDate ? <Text style={styles.metaText}>Due: {data.dueDate}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.partiesRow}>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>Bill From</Text>
            <Text style={styles.partyName}>{data.fromName}</Text>
            {data.fromAddress ? <Text style={styles.partyLine}>{data.fromAddress}</Text> : null}
            {data.fromPhone ? <Text style={styles.partyLine}>Tel: {data.fromPhone}</Text> : null}
            {data.fromEmail ? <Text style={styles.partyLine}>{data.fromEmail}</Text> : null}
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{data.toName}</Text>
            {data.toAddress ? <Text style={styles.partyLine}>{data.toAddress}</Text> : null}
            {data.toPhone ? <Text style={styles.partyLine}>Tel: {data.toPhone}</Text> : null}
            {data.toEmail ? <Text style={styles.partyLine}>{data.toEmail}</Text> : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit (SAR)</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>
          {data.lineItems.map((item, index) => (
            <View
              key={`${item.description}-${index}`}
              style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
            >
              <Text style={[styles.cell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.cell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.cell, styles.colPrice]}>{formatSar(item.unitPrice)}</Text>
              <Text style={[styles.cell, styles.colAmount]}>{formatSar(lineItemAmount(item))}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatSar(totals.subtotal)} SAR</Text>
            </View>
            {(data.taxPercent ?? 0) > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({data.taxPercent}%)</Text>
                <Text style={styles.totalValue}>{formatSar(totals.taxAmount)} SAR</Text>
              </View>
            ) : null}
            {totals.discount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValue}>-{formatSar(totals.discount)} SAR</Text>
              </View>
            ) : null}
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>Total</Text>
              <Text style={styles.grandValue}>{formatSar(totals.total)} SAR</Text>
            </View>
          </View>
        </View>

        {(data.notes || data.paymentTerms) && (
          <View style={styles.notesBlock}>
            {data.paymentTerms ? (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.notesTitle}>Payment Terms</Text>
                <Text style={styles.notesText}>{data.paymentTerms}</Text>
              </View>
            ) : null}
            {data.notes ? (
              <View>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{data.notes}</Text>
              </View>
            ) : null}
          </View>
        )}

        <Text style={styles.footer} fixed>
          Generated by TheUrbanRealEstateSaudi — Invoice {data.invoiceNumber}
        </Text>
      </Page>
    </Document>
  );
}
