-- =============================================
-- Migration 48: Visit message templates (visiting agents)
-- =============================================

CREATE TABLE IF NOT EXISTS visit_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agent_profile_id, name)
);

CREATE INDEX IF NOT EXISTS idx_visit_message_templates_agent
  ON visit_message_templates(agent_profile_id);

ALTER TABLE visit_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visiting agents manage own message templates"
  ON visit_message_templates FOR ALL
  USING (auth.uid() = agent_profile_id)
  WITH CHECK (auth.uid() = agent_profile_id);

CREATE POLICY "Admins can view all message templates"
  ON visit_message_templates FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
