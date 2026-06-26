"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  VISIT_MESSAGE_PLACEHOLDERS,
  type VisitMessageTemplate,
} from "@/lib/visit-message-template";
import { useVisitMessageTemplates } from "@/hooks/use-visit-message-templates";

type FormState = { name: string; body: string };

const emptyForm: FormState = { name: "", body: "" };

export function VisitMessageTemplateManager() {
  const { templates, loading, refresh } = useVisitMessageTemplates();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VisitMessageTemplate | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(template: VisitMessageTemplate) {
    setEditing(template);
    setForm({ name: template.name, body: template.body });
    setDialogOpen(true);
  }

  function insertPlaceholder(token: string) {
    const el = bodyRef.current;
    if (!el) {
      setForm((prev) => ({ ...prev, body: `${prev.body}${token}` }));
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const nextBody = form.body.slice(0, start) + token + form.body.slice(end);
    setForm((prev) => ({ ...prev, body: nextBody }));

    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + token.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  async function handleSave() {
    const name = form.name.trim();
    const body = form.body.trim();
    if (!name || !body) {
      toast.error("Name and message body are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/agent/message-templates/${editing.id}` : "/api/agent/message-templates",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, body }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save template");
      }

      toast.success(editing ? "Template updated" : "Template created");
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(template: VisitMessageTemplate) {
    if (!window.confirm(`Delete template "${template.name}"?`)) return;

    setDeletingId(template.id);
    try {
      const res = await fetch(`/api/agent/message-templates/${template.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete template");
      }
      toast.success("Template deleted");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete template");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Message Templates</h1>
          <p className="text-sm text-muted-foreground">
            Create named WhatsApp templates with placeholders. Use them from My Assignments when messaging customers.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No templates yet</h3>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              Create your first template with customer and property placeholders, then send it from any visit in My Assignments.
            </p>
            <Button variant="outline" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-3 whitespace-pre-wrap pt-1">
                      {template.body}
                    </CardDescription>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(template)}
                      aria-label={`Edit ${template.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(template)}
                      disabled={deletingId === template.id}
                      aria-label={`Delete ${template.name}`}
                    >
                      {deletingId === template.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template name</Label>
              <Input
                id="template-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Arrival reminder"
                maxLength={80}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-body">Message</Label>
              <Textarea
                id="template-body"
                ref={bodyRef}
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Hello {{customer_name}}, your visit for {{property_name}} (ID {{property_id}}) is on {{visit_date}} at {{visit_time}}."
                rows={8}
                maxLength={4000}
              />
            </div>

            <div className="space-y-2">
              <Label>Insert placeholder</Label>
              <div className="flex flex-wrap gap-2">
                {VISIT_MESSAGE_PLACEHOLDERS.map(({ token, label }) => (
                  <Button
                    key={token}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => insertPlaceholder(token)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
