"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/dashboard/data-table";
import { formatDate } from "@/lib/format";
import type { ManualDocumentRow } from "@/lib/server/manual-document";

type DocumentsFilterProps = {
  currentType: string;
  propertyRef: string;
  labels: {
    all: string;
    invoices: string;
    receipts: string;
    propertyRef: string;
    filter: string;
    type: string;
    documentNumber: string;
    property: string;
    customer: string;
    documentDate: string;
    amount: string;
    createdAt: string;
    actions: string;
    download: string;
    empty: string;
    invoice: string;
    receipt: string;
  };
  rows: ManualDocumentRow[];
};

function formatAmount(amount: number | null) {
  if (amount == null) return "—";
  return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`;
}

export function DocumentsFilterTable({
  currentType,
  propertyRef,
  labels,
  rows,
}: DocumentsFilterProps) {
  return (
    <div className="space-y-4">
      <form action="/admin/documents" method="get" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/documents">
            <Button type="button" variant={currentType === "all" ? "default" : "outline"} size="sm">
              {labels.all}
            </Button>
          </Link>
          <Link href="/admin/documents?type=invoice">
            <Button type="button" variant={currentType === "invoice" ? "default" : "outline"} size="sm">
              {labels.invoices}
            </Button>
          </Link>
          <Link href="/admin/documents?type=receipt">
            <Button type="button" variant={currentType === "receipt" ? "default" : "outline"} size="sm">
              {labels.receipts}
            </Button>
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 sm:min-w-[220px] sm:max-w-xs">
          <label htmlFor="property-ref-filter" className="text-xs font-medium text-muted-foreground">
            {labels.propertyRef}
          </label>
          <div className="flex gap-2">
            <Input
              id="property-ref-filter"
              name="property_ref"
              defaultValue={propertyRef}
              placeholder={labels.propertyRef}
              className="min-h-10"
            />
            {currentType !== "all" ? (
              <input type="hidden" name="type" value={currentType} />
            ) : null}
            <Button type="submit" variant="secondary" className="min-h-10 shrink-0">
              {labels.filter}
            </Button>
          </div>
        </div>
      </form>

      <DataTable
        rows={rows}
        emptyText={labels.empty}
        columns={[
          {
            key: "document_type",
            title: labels.type,
            render: (row) => (
              <Badge variant="outline" className="capitalize">
                {row.document_type === "invoice" ? labels.invoice : labels.receipt}
              </Badge>
            ),
          },
          { key: "document_number", title: labels.documentNumber },
          {
            key: "property",
            title: labels.property,
            render: (row) => {
              if (row.document_type !== "receipt") return "—";
              const parts = [row.property_ref, row.property_name].filter(Boolean);
              return parts.length ? parts.join(" — ") : "—";
            },
          },
          { key: "customer_name", title: labels.customer },
          {
            key: "document_date",
            title: labels.documentDate,
            render: (row) => row.document_date || "—",
          },
          {
            key: "total_amount",
            title: labels.amount,
            render: (row) => formatAmount(row.total_amount),
          },
          {
            key: "created_at",
            title: labels.createdAt,
            render: (row) => formatDate(row.created_at),
          },
          {
            key: "actions",
            title: labels.actions,
            render: (row) => (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={`/api/admin/documents/${row.id}/download`}>
                  <Download className="h-3.5 w-3.5" />
                  {labels.download}
                </a>
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
