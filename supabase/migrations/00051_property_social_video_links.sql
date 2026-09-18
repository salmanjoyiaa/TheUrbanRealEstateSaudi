ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS facebook_video_url text,
  ADD COLUMN IF NOT EXISTS instagram_video_url text,
  ADD COLUMN IF NOT EXISTS youtube_video_url text,
  ADD COLUMN IF NOT EXISTS tiktok_video_url text;
