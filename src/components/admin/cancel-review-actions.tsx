"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function CancelReviewActions({ visitId }: { visitId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  const submit = async (action: "approve" | "reject", reviewNote: string) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/visits/${visitId}/cancel-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: reviewNote || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to review cancel request");
      toast.success(action === "approve" ? "Cancel request approved" : "Cancel request rejected");
      setDialogAction(null);
      setNote("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to review cancel request");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => setDialogAction("approve")}
          disabled={loading !== null}
        >
          {loading === "approve" ? "Approving..." : "Approve cancel"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 px-2 text-xs"
          onClick={() => setDialogAction("reject")}
          disabled={loading !== null}
        >
          {loading === "reject" ? "Rejecting..." : "Reject"}
        </Button>
      </div>

      <Dialog open={dialogAction !== null} onOpenChange={(open) => !open && setDialogAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "approve" ? "Approve cancellation" : "Reject cancel request"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "approve"
                ? "The visit will be cancelled and the customer will be notified."
                : "The visit will remain active. The visiting agent will see your note."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancel-review-note">Note (optional)</Label>
            <Textarea
              id="cancel-review-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)} disabled={loading !== null}>
              Back
            </Button>
            <Button
              variant={dialogAction === "approve" ? "destructive" : "default"}
              onClick={() => dialogAction && submit(dialogAction, note)}
              disabled={loading !== null}
            >
              {loading ? "Saving..." : dialogAction === "approve" ? "Confirm cancel" : "Reject request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
