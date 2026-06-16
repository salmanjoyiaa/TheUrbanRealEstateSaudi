"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VisitCommentRow } from "@/types/visit-assignment";

export function VisitCommentsSection({ visitId }: { visitId: string }) {
  const [comments, setComments] = useState<VisitCommentRow[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/agent/visits/${visitId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      /* ignore */
    }
  }, [visitId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAdd = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agent/visits/${visitId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        await fetchComments();
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <MessageSquare className="h-4 w-4" /> Comments
      </p>
      {comments.length > 0 ? (
        <div className="max-h-36 space-y-1.5 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="rounded-md border bg-muted/40 p-2 text-xs">
              <span className="font-medium">{c.author?.full_name || "System"}</span>
              <span className="ml-2 text-muted-foreground">{format(new Date(c.created_at), "MMM d, h:mm a")}</span>
              <p className="mt-0.5">{c.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">No comments yet.</p>
      )}
      <div className="flex gap-1.5">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="h-9 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={handleAdd} disabled={!newComment.trim() || loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
