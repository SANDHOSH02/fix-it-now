-- =============================================================================
-- Fix It Now — Complete PostgreSQL Database Schema
-- PostgreSQL 16 + PostGIS 3.x
--
-- Usage:
--   psql -U postgres -c "CREATE DATABASE fixitnow;"
--   psql -U postgres -d fixitnow -f schema.sql
--
-- Or one-liner:
--   psql "postgresql://postgres:password@localhost:5432/fixitnow" -f schema.sql
-- =============================================================================

-- =============================================================================
-- 0. EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;       -- spatial geometry types & functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS unaccent;      -- accent-insensitive full-text search

-- =============================================================================
-- 1. ENUMS
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('CITIZEN', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ComplaintStatus" AS ENUM (
    'reported', 'pending', 'assigned', 'in-progress', 'resolved'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ComplaintCategory" AS ENUM (
    'roads', 'water', 'garbage', 'lighting', 'drainage', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- 2. TABLES
-- =============================================================================

-- ── users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT         NOT NULL,
  email          TEXT         NOT NULL UNIQUE,
  "passwordHash" TEXT         NOT NULL,
  role           "Role"       NOT NULL DEFAULT 'CITIZEN',
  district       TEXT,
  phone          TEXT,
  "avatarUrl"    TEXT,
  "isActive"     BOOLEAN      NOT NULL DEFAULT TRUE,
  "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ── refresh_tokens ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token       TEXT        NOT NULL UNIQUE,
  "userId"    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens ("userId");
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token);

-- ── departments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id             UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT        NOT NULL UNIQUE,
  description    TEXT,
  "contactEmail" TEXT,
  "isActive"     BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── complaints ────────────────────────────────────────────────────────────────
-- lat/lng stored as plain floats; PostGIS geometry column added below
CREATE TABLE IF NOT EXISTS complaints (
  id              UUID                NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "refId"         TEXT                NOT NULL UNIQUE,  -- e.g. FIX-2026-001
  title           TEXT                NOT NULL,
  category        "ComplaintCategory" NOT NULL,
  description     TEXT                NOT NULL,
  status          "ComplaintStatus"   NOT NULL DEFAULT 'reported',
  priority        "Priority"          NOT NULL DEFAULT 'medium',

  -- Coordinates (plain columns for ORM access)
  lat             DOUBLE PRECISION    NOT NULL,
  lng             DOUBLE PRECISION    NOT NULL,
  address         TEXT                NOT NULL,
  city            TEXT                NOT NULL,
  district        TEXT                NOT NULL,

  -- Media
  "photoUrl"      TEXT,
  "voiceNoteUrl"  TEXT,

  -- AI metadata
  "aiConfidence"  INTEGER             NOT NULL DEFAULT 0,
  "isDuplicate"   BOOLEAN             NOT NULL DEFAULT FALSE,
  "duplicateOfId" UUID,

  -- Engagement
  upvotes         INTEGER             NOT NULL DEFAULT 0,

  -- Relations
  "reporterId"    UUID                NOT NULL REFERENCES users (id),
  "departmentId"  UUID                REFERENCES departments (id),

  "createdAt"     TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Scalar indexes (matches Prisma @@index directives)
CREATE INDEX IF NOT EXISTS idx_complaints_reporter   ON complaints ("reporterId");
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints ("departmentId");
CREATE INDEX IF NOT EXISTS idx_complaints_status     ON complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_category   ON complaints (category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority   ON complaints (priority);
CREATE INDEX IF NOT EXISTS idx_complaints_created    ON complaints ("createdAt" DESC);

-- Composite index for admin list queries
CREATE INDEX IF NOT EXISTS idx_complaints_status_category
  ON complaints (status, category);

-- ── status_history ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS status_history (
  id            UUID                NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "complaintId" UUID                NOT NULL REFERENCES complaints (id) ON DELETE CASCADE,
  status        "ComplaintStatus"   NOT NULL,
  note          TEXT,
  "changedById" UUID,               -- nullable — system changes have no user
  "createdAt"   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_complaint
  ON status_history ("complaintId", "createdAt");

-- ── notifications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId"    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  "isRead"    BOOLEAN     NOT NULL DEFAULT FALSE,
  type        TEXT        NOT NULL DEFAULT 'status_update',
  "refId"     TEXT,                 -- complaint refId for deep-link
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications ("userId", "isRead")
  WHERE "isRead" = FALSE;

-- ── audit_logs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action        TEXT        NOT NULL,   -- e.g. 'STATUS_CHANGED', 'ASSIGNED'
  entity        TEXT        NOT NULL,   -- e.g. 'Complaint', 'User'
  "entityId"    TEXT        NOT NULL,
  "userId"      UUID        REFERENCES users (id),
  "complaintId" UUID        REFERENCES complaints (id),
  metadata      JSONB,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity   ON audit_logs (entity, "entityId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_user     ON audit_logs ("userId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_complaint ON audit_logs ("complaintId");

-- =============================================================================
-- 3. POSTGIS SPATIAL COLUMN
-- =============================================================================
-- Adds a geometry(Point, 4326) column to complaints.
-- ST_MakePoint(lng, lat) — longitude first, then latitude (OGC convention).

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

-- Populate from existing rows
UPDATE complaints
SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
WHERE location IS NULL;

-- GIST spatial index — required for ST_DWithin / ST_Intersects performance
CREATE INDEX IF NOT EXISTS idx_complaints_location
  ON complaints USING GIST (location);

-- =============================================================================
-- 4. FULL-TEXT SEARCH VECTOR
-- =============================================================================
-- Generated STORED column — PostgreSQL auto-maintains it on INSERT/UPDATE.
-- Weighted: title (A) > description (B) > city (C)

ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
      setweight(to_tsvector('english', unaccent(coalesce(title,       ''))), 'A') ||
      setweight(to_tsvector('english', unaccent(coalesce(description, ''))), 'B') ||
      setweight(to_tsvector('english', unaccent(coalesce(city,        ''))), 'C') ||
      setweight(to_tsvector('english', unaccent(coalesce(address,     ''))), 'D')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_complaints_fts
  ON complaints USING GIN (search_vector);

-- =============================================================================
-- 5. TRIGGERS
-- =============================================================================

-- ── 5a. Keep PostGIS location in sync with lat/lng ───────────────────────────
CREATE OR REPLACE FUNCTION sync_complaint_location()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_location ON complaints;
CREATE TRIGGER trg_sync_location
  BEFORE INSERT OR UPDATE OF lat, lng ON complaints
  FOR EACH ROW EXECUTE FUNCTION sync_complaint_location();

-- ── 5b. Auto-update updatedAt on users and complaints ────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW."updatedAt" := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_complaints_updated_at ON complaints;
CREATE TRIGGER trg_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 6. SEED DATA — Departments
-- =============================================================================

INSERT INTO departments (id, name, description, "contactEmail") VALUES
  (gen_random_uuid(), 'Roads & Highways',        'Road repair, pothole filling, road marking',           'roads@tnpwd.gov.in'),
  (gen_random_uuid(), 'Water & Sanitation',       'Water supply, sewage, pipeline issues',                'water@chennaimetrowater.in'),
  (gen_random_uuid(), 'Solid Waste Management',   'Garbage collection, waste disposal, street cleaning',  'swm@chennaicorporation.gov.in'),
  (gen_random_uuid(), 'Street Lighting',          'Streetlight outages, electrical faults',               'lighting@tangedco.gov.in'),
  (gen_random_uuid(), 'Drainage & Stormwater',    'Drain blockages, flooding, stormwater management',     'drainage@chennaicorporation.gov.in'),
  (gen_random_uuid(), 'Parks & Recreation',       'Park maintenance, public spaces, trees',               'parks@chennaicorporation.gov.in'),
  (gen_random_uuid(), 'General Administration',   'Complaints that span multiple departments',             'admin@fixitnow.gov.in')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 7. SEED DATA — Admin User
-- =============================================================================
-- Default password: Admin@123  (bcrypt hash below, cost=12)
-- CHANGE THIS PASSWORD immediately after first login!

INSERT INTO users (id, name, email, "passwordHash", role, district) VALUES
  (
    gen_random_uuid(),
    'Fix It Now Admin',
    'admin@fixitnow.gov.in',
    -- bcrypt hash of 'Admin@123' with cost factor 12
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY1pFnmCFe5iBx.',
    'SUPER_ADMIN',
    'Chennai'
  )
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 8. SEED DATA — Sample Complaints (Tamil Nadu)
-- =============================================================================

DO $$
DECLARE
  v_admin_id   UUID;
  v_dept_roads UUID;
  v_dept_water UUID;
  v_dept_light UUID;
  v_dept_drain UUID;
  v_dept_waste UUID;
BEGIN
  SELECT id INTO v_admin_id   FROM users       WHERE email = 'admin@fixitnow.gov.in';
  SELECT id INTO v_dept_roads FROM departments WHERE name  = 'Roads & Highways';
  SELECT id INTO v_dept_water FROM departments WHERE name  = 'Water & Sanitation';
  SELECT id INTO v_dept_light FROM departments WHERE name  = 'Street Lighting';
  SELECT id INTO v_dept_drain FROM departments WHERE name  = 'Drainage & Stormwater';
  SELECT id INTO v_dept_waste FROM departments WHERE name  = 'Solid Waste Management';

  INSERT INTO complaints (
    "refId", title, category, description, status, priority,
    lat, lng, address, city, district,
    "aiConfidence", upvotes, "reporterId", "departmentId"
  ) VALUES
    (
      'FIX-2026-001', 'Large pothole on Anna Salai near bus stop',
      'roads', 'A 60cm deep pothole has formed near bus stop no. 42 on Anna Salai. Vehicles are swerving dangerously.',
      'assigned', 'high',
      13.0604, 80.2496, 'Anna Salai, Near Bus Stop 42', 'Chennai', 'Chennai',
      94, 23, v_admin_id, v_dept_roads
    ),
    (
      'FIX-2026-002', 'Water pipe burst — continuous leakage on Gandhi Nagar',
      'water', 'A main water pipeline has burst near Gandhi Nagar junction, causing flooding on the road and wastage of potable water.',
      'in-progress', 'high',
      13.0827, 80.2707, 'Gandhi Nagar Junction, 2nd Street', 'Chennai', 'Chennai',
      91, 18, v_admin_id, v_dept_water
    ),
    (
      'FIX-2026-003', 'Street light not working for 3 weeks — T Nagar',
      'lighting', 'Three consecutive street lights on Usman Road are non-functional. Area is very dark at night causing safety concerns.',
      'reported', 'medium',
      13.0418, 80.2341, 'Usman Road, Near Pondy Bazaar', 'Chennai', 'Chennai',
      87, 12, v_admin_id, v_dept_light
    ),
    (
      'FIX-2026-004', 'Blocked storm drain causing flooding in Adyar',
      'drainage', 'The main storm drain on Lattice Bridge Road is completely blocked with debris. The area floods even during light rain.',
      'pending', 'high',
      13.0067, 80.2568, 'Lattice Bridge Road, Adyar', 'Chennai', 'Chennai',
      96, 31, v_admin_id, v_dept_drain
    ),
    (
      'FIX-2026-005', 'Garbage pile-up near Koyambedu market',
      'garbage', 'Uncollected garbage has been accumulating outside Koyambedu wholesale market for 5 days. Severe stench and health hazard.',
      'resolved', 'medium',
      13.0694, 80.1948, 'Koyambedu Market Outer Road', 'Chennai', 'Chennai',
      89, 8, v_admin_id, v_dept_waste
    ),
    (
      'FIX-2026-006', 'Road cave-in near Coimbatore railway station',
      'roads', 'A section of road near the railway station entrance has collapsed, likely due to an underground pipe failure. Dangerous for pedestrians.',
      'assigned', 'high',
      11.0018, 76.9618, 'Station Road, Near Railway Station Entrance', 'Coimbatore', 'Coimbatore',
      93, 15, v_admin_id, v_dept_roads
    ),
    (
      'FIX-2026-007', 'No drinking water supply for 4 days — Madurai East',
      'water', 'Entire Madurai East locality has had no piped water supply for 4 consecutive days. Residents are buying water at high cost.',
      'in-progress', 'high',
      9.9252, 78.1198, 'East Madurai, 5th Cross Street', 'Madurai', 'Madurai',
      88, 42, v_admin_id, v_dept_water
    ),
    (
      'FIX-2026-008', 'Open manhole on busy road — Trichy',
      'drainage', 'A manhole cover is missing on a busy road in Trichy. Vehicles and pedestrians are at serious risk of falling in.',
      'pending', 'high',
      10.7905, 78.7047, 'Salai Road, Trichy Central', 'Tiruchirappalli', 'Tiruchirappalli',
      97, 27, v_admin_id, v_dept_drain
    )
  ON CONFLICT ("refId") DO NOTHING;

  -- Status history for resolved complaint
  INSERT INTO status_history ("complaintId", status, note, "changedById")
  SELECT id, 'reported'::  "ComplaintStatus", 'Complaint received',                       v_admin_id FROM complaints WHERE "refId" = 'FIX-2026-005'
  UNION ALL
  SELECT id, 'assigned'::  "ComplaintStatus", 'Assigned to Solid Waste Management team',  v_admin_id FROM complaints WHERE "refId" = 'FIX-2026-005'
  UNION ALL
  SELECT id, 'in-progress'::"ComplaintStatus",'Crew dispatched, cleanup started',         v_admin_id FROM complaints WHERE "refId" = 'FIX-2026-005'
  UNION ALL
  SELECT id, 'resolved'::  "ComplaintStatus", 'Area cleaned. Regular schedule updated.',  v_admin_id FROM complaints WHERE "refId" = 'FIX-2026-005'
  ON CONFLICT DO NOTHING;

END $$;

-- =============================================================================
-- 9. HELPFUL VIEWS (optional — for reporting / admin queries)
-- =============================================================================

-- Open complaints per city
CREATE OR REPLACE VIEW v_open_by_city AS
SELECT
  city,
  COUNT(*)                                  AS total,
  COUNT(*) FILTER (WHERE status = 'reported')    AS reported,
  COUNT(*) FILTER (WHERE status = 'pending')     AS pending,
  COUNT(*) FILTER (WHERE status = 'assigned')    AS assigned,
  COUNT(*) FILTER (WHERE status = 'in-progress') AS in_progress
FROM complaints
WHERE status != 'resolved'
GROUP BY city
ORDER BY total DESC;

-- Complaints with reporter and department name (replaces common JOIN)
CREATE OR REPLACE VIEW v_complaints_full AS
SELECT
  c.id,
  c."refId",
  c.title,
  c.category,
  c.status,
  c.priority,
  c.lat,
  c.lng,
  c.address,
  c.city,
  c.district,
  c."aiConfidence",
  c.upvotes,
  c."isDuplicate",
  c."createdAt",
  c."updatedAt",
  u.name        AS "reporterName",
  u.email       AS "reporterEmail",
  d.name        AS "departmentName",
  d."contactEmail" AS "departmentEmail"
FROM complaints  c
JOIN users       u ON u.id = c."reporterId"
LEFT JOIN departments d ON d.id = c."departmentId";

-- =============================================================================
-- 10. SAMPLE SPATIAL QUERIES (comments — run manually as needed)
-- =============================================================================

-- Find complaints within 500 m of a point (duplicate detection):
-- SELECT id, "refId", title
-- FROM complaints
-- WHERE ST_DWithin(
--   location,
--   ST_SetSRID(ST_MakePoint(80.2496, 13.0604), 4326)::geography,
--   500
-- );

-- Cluster complaints for heatmap (50 m radius):
-- SELECT ST_ClusterDBSCAN(location, eps := 0.0005, minpoints := 2)
--          OVER () AS cluster_id,
--        id, lat, lng, category
-- FROM complaints
-- WHERE status != 'resolved';

-- Full-text search:
-- SELECT id, "refId", title
-- FROM complaints
-- WHERE search_vector @@ plainto_tsquery('english', unaccent('pothole road'));

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
