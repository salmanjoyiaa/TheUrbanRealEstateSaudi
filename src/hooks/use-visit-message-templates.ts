"use client";

import { useCallback, useEffect, useState } from "react";
import type { VisitMessageTemplate } from "@/lib/visit-message-template";

export function useVisitMessageTemplates() {
  const [templates, setTemplates] = useState<VisitMessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/message-templates");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load templates");
      }
      setTemplates(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { templates, loading, error, refresh };
}
