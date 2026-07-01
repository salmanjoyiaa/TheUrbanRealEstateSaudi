-- =============================================
-- Migration 49: Platform language settings
-- =============================================

INSERT INTO platform_settings (key, value) VALUES
  ('public_site_language', 'en'),
  ('dashboard_language', 'en')
ON CONFLICT (key) DO NOTHING;
