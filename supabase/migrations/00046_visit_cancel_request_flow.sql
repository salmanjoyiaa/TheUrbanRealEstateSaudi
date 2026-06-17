-- Visit cancel request flow (agent requests, admin approves/rejects)
ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS cancellation_requested_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reviewed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS cancellation_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_review_note TEXT;

CREATE INDEX IF NOT EXISTS idx_visit_requests_cancel_request_pending
  ON visit_requests(cancellation_requested_at)
  WHERE cancellation_requested_at IS NOT NULL AND cancellation_reviewed_at IS NULL;
