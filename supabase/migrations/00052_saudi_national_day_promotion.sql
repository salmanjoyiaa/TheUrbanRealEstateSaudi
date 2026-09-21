INSERT INTO platform_settings (key, value) VALUES
  ('saudi_national_day_enabled', 'false'),
  ('saudi_national_day_discount_percent', '10')
ON CONFLICT (key) DO NOTHING;
