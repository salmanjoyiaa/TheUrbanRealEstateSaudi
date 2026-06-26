import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type VisitExportPdfRow = {
  index: number;
  time: string;
  propertyRef: string;
  propertyTitle: string;
  visitor: string;
  phone: string;
  status: string;
  visitingAgent: string;
  propertyAgent: string;
};

export type VisitExportPdfGroup = {
  agentName: string;
  rows: VisitExportPdfRow[];
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f2f6a",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 10,
    color: "#334155",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    color: "#475569",
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
    backgroundColor: "#f8fafc",
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 6,
    color: "#0f2f6a",
  },
  table: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  colNo: { width: "5%" },
  colTime: { width: "9%" },
  colRef: { width: "9%" },
  colProperty: { width: "18%" },
  colVisitor: { width: "14%" },
  colPhone: { width: "12%" },
  colStatus: { width: "10%" },
  colVAgent: { width: "11%" },
  colPAgent: { width: "12%" },
  th: { fontWeight: 700, fontSize: 7 },
  cell: { fontSize: 7, color: "#1e293b", paddingRight: 2 },
  footer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingTop: 8,
    color: "#475569",
    fontSize: 8,
  },
});

function TableHeader() {
  return (
    <View style={styles.tableHeader}>
      <Text style={[styles.colNo, styles.th]}>#</Text>
      <Text style={[styles.colTime, styles.th]}>Time</Text>
      <Text style={[styles.colRef, styles.th]}>Prop ID</Text>
      <Text style={[styles.colProperty, styles.th]}>Property</Text>
      <Text style={[styles.colVisitor, styles.th]}>Visitor</Text>
      <Text style={[styles.colPhone, styles.th]}>Phone</Text>
      <Text style={[styles.colStatus, styles.th]}>Status</Text>
      <Text style={[styles.colVAgent, styles.th]}>Visiting Agent</Text>
      <Text style={[styles.colPAgent, styles.th]}>Property Agent</Text>
    </View>
  );
}

function TableRows({ rows }: { rows: VisitExportPdfRow[] }) {
  return (
    <>
      {rows.map((row) => (
        <View key={row.index} style={styles.row}>
          <Text style={[styles.colNo, styles.cell]}>{row.index}</Text>
          <Text style={[styles.colTime, styles.cell]}>{row.time}</Text>
          <Text style={[styles.colRef, styles.cell]}>{row.propertyRef}</Text>
          <Text style={[styles.colProperty, styles.cell]}>{row.propertyTitle}</Text>
          <Text style={[styles.colVisitor, styles.cell]}>{row.visitor}</Text>
          <Text style={[styles.colPhone, styles.cell]}>{row.phone}</Text>
          <Text style={[styles.colStatus, styles.cell]}>{row.status}</Text>
          <Text style={[styles.colVAgent, styles.cell]}>{row.visitingAgent}</Text>
          <Text style={[styles.colPAgent, styles.cell]}>{row.propertyAgent}</Text>
        </View>
      ))}
    </>
  );
}

export function VisitExportPdf(props: {
  title: string;
  subtitle: string;
  date: string;
  generatedAt: string;
  totalVisits: number;
  mode: "all_agents" | "visiting_agent" | "property" | "property_and_agent";
  groups?: VisitExportPdfGroup[];
  rows?: VisitExportPdfRow[];
}) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{props.title}</Text>
          <Text style={styles.subtitle}>{props.subtitle}</Text>
          <View style={styles.metaRow}>
            <Text>Date: {props.date}</Text>
            <Text>Generated: {props.generatedAt}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text>Total visits: {props.totalVisits}</Text>
        </View>

        {props.mode === "all_agents" && props.groups ? (
          props.groups.map((group) => (
            <View key={group.agentName}>
              <Text style={styles.groupTitle}>{group.agentName} ({group.rows.length})</Text>
              <View style={styles.table}>
                <TableHeader />
                <TableRows rows={group.rows} />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.table}>
            <TableHeader />
            <TableRows rows={props.rows || []} />
          </View>
        )}

        <Text style={styles.footer}>
          TheUrbanRealEstate — Visit requests export. Coordinate reschedules with operations immediately.
        </Text>
      </Page>
    </Document>
  );
}
