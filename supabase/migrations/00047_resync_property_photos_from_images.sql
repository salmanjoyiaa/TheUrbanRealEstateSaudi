-- Resync property_photos from properties.images for all properties with drifted or stale gallery data.
-- Fixes public detail pages that read property_photos after admin edits updated only properties.images.

DELETE FROM property_photos;

INSERT INTO property_photos (property_id, url, ordering_index, alt_text)
SELECT
  p.id,
  img.url,
  img.ordinality - 1 AS ordering_index,
  NULL AS alt_text
FROM properties p
CROSS JOIN LATERAL unnest(p.images) WITH ORDINALITY AS img(url, ordinality)
WHERE p.images IS NOT NULL
  AND cardinality(p.images) > 0;
