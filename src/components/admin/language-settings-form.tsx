"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SiteLanguage } from "@/lib/platform-language";

export function LanguageSettingsForm() {
  const [publicLang, setPublicLang] = useState<SiteLanguage>("en");
  const [dashboardLang, setDashboardLang] = useState<SiteLanguage>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/language-settings");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load settings");
        setPublicLang(json.public_site_language || "en");
        setDashboardLang(json.dashboard_language || "en");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/language-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_site_language: publicLang,
          dashboard_language: dashboardLang,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save settings");
      toast.success("Language settings saved. Refresh pages to see changes.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading settings...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language</CardTitle>
        <CardDescription>
          Control the language for the public website and dashboards. User-generated content (property titles, descriptions) is not translated.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="public-lang">Public website language</Label>
            <Select value={publicLang} onValueChange={(v) => setPublicLang(v as SiteLanguage)}>
              <SelectTrigger id="public-lang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic (Saudi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboard-lang">Dashboard language</Label>
            <Select value={dashboardLang} onValueChange={(v) => setDashboardLang(v as SiteLanguage)}>
              <SelectTrigger id="dashboard-lang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic (Saudi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save language settings
        </Button>
      </CardContent>
    </Card>
  );
}
