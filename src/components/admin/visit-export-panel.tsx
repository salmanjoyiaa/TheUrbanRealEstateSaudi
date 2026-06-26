"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, FileDown, Loader2 } from "lucide-react";
import { sanitizePropertyRefQuery } from "@/lib/property-ref";

type Agent = { id: string; name: string };

type ExportMode =
  | "all_agents"
  | "visiting_agent"
  | "property"
  | "property_and_agent";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function VisitExportPanel({ visitingAgents }: { visitingAgents: Agent[] }) {
  const [date, setDate] = useState(today);
  const [visitingAgentId, setVisitingAgentId] = useState("");
  const [propertyRef, setPropertyRef] = useState("");
  const [comboPropertyRef, setComboPropertyRef] = useState("");
  const [comboAgentId, setComboAgentId] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState<ExportMode | null>(null);

  async function download(mode: ExportMode, extra?: { property_ref?: string; visiting_agent_profile_id?: string }) {
    setLoading(mode);
    try {
      const payload: Record<string, string | boolean> = {
        date,
        mode,
        status_filter: activeOnly ? "active" : "all",
      };

      if (extra?.visiting_agent_profile_id) {
        payload.visiting_agent_profile_id = extra.visiting_agent_profile_id;
      }
      if (extra?.property_ref) {
        payload.property_ref = extra.property_ref;
      }

      const res = await fetch("/api/admin/visits/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to generate PDF" }));
        throw new Error(data.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `theurbanrealestate-visits-${mode}-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download PDF");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5" />
          Download visit requests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="export-date" className="text-xs text-muted-foreground">
              Date
            </Label>
            <Input
              id="export-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 h-9"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-input"
              />
              Assigned &amp; confirmed only
            </label>
          </div>
        </div>

        <Button
          className="w-full sm:w-auto"
          disabled={!date || loading !== null}
          onClick={() => download("all_agents")}
        >
          {loading === "all_agents" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="mr-2 h-4 w-4" />
          )}
          Download all agents for day
        </Button>

        <div className="space-y-2 rounded-md border p-4">
          <p className="text-sm font-semibold">Per visiting agent</p>
          <Select value={visitingAgentId} onValueChange={setVisitingAgentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select visiting agent" />
            </SelectTrigger>
            <SelectContent>
              {visitingAgents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            disabled={!date || !visitingAgentId || loading !== null}
            onClick={() =>
              download("visiting_agent", { visiting_agent_profile_id: visitingAgentId })
            }
          >
            {loading === "visiting_agent" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Download agent day PDF
          </Button>
        </div>

        <div className="space-y-2 rounded-md border p-4">
          <p className="text-sm font-semibold">Per property</p>
          <Input
            placeholder="Property ID e.g. 45"
            value={propertyRef}
            onChange={(e) => setPropertyRef(e.target.value)}
            className="h-9"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!date || !sanitizePropertyRefQuery(propertyRef) || loading !== null}
            onClick={() => download("property", { property_ref: propertyRef })}
          >
            {loading === "property" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Download property day PDF
          </Button>
        </div>

        <div className="space-y-2 rounded-md border p-4">
          <p className="text-sm font-semibold">Property + visiting agent</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Property ID e.g. 45"
              value={comboPropertyRef}
              onChange={(e) => setComboPropertyRef(e.target.value)}
              className="h-9"
            />
            <Select value={comboAgentId} onValueChange={setComboAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {visitingAgents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={
              !date ||
              !sanitizePropertyRefQuery(comboPropertyRef) ||
              !comboAgentId ||
              loading !== null
            }
            onClick={() =>
              download("property_and_agent", {
                property_ref: comboPropertyRef,
                visiting_agent_profile_id: comboAgentId,
              })
            }
          >
            {loading === "property_and_agent" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Download property + agent PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
