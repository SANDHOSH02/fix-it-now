-- Fix It Now: Initial PostGIS setup
-- Run AFTER `prisma migrate dev --name init` to add spatial columns and indexes.
-- This migration is applied manually on top of the Prisma-generated baseline.

-- ─── Enable PostGIS ───────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ─── Add PostGIS geometry column for complaints ───────────────────────────────
-- Stores a POINT(lng, lat) in WGS-84 (SRID 4326)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'complaints' AND column_name = 'location'
  ) THEN
    ALTER TABLE complaints
      ADD COLUMN location geometry(Point, 4326);
  END IF;
END $$;

-- ─── Populate location from lat/lng ───────────────────────────────────────────
UPDATE complaints
SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
WHERE location IS NULL AND lat IS NOT NULL AND lng IS NOT NULL;

-- ─── Spatial index (GIST) ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_complaints_location
  ON complaints USING GIST (location);

-- ─── Full-text search vector ──────────────────────────────────────────────────
ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(city, '')), 'C')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_complaints_search_vector
  ON complaints USING GIN (search_vector);

-- ─── Trigger: keep location in sync with lat/lng on UPDATE ───────────────────
CREATE OR REPLACE FUNCTION sync_complaint_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_location ON complaints;
CREATE TRIGGER trg_sync_location
  BEFORE INSERT OR UPDATE OF lat, lng ON complaints
  FOR EACH ROW EXECUTE FUNCTION sync_complaint_location();

-- ─── Additional performance indexes ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_complaints_status_category
  ON complaints (status, category);

CREATE INDEX IF NOT EXISTS idx_complaints_created_at
  ON complaints (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_status_history_complaint
  ON status_history (complaint_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, is_read) WHERE is_read = false;
