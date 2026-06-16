-- Agent-initiated visit cancellation tracking
ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
