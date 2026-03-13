-- ============================================================================
-- Fix It Now — Seed Data (matches Prisma migration column names)
-- Run with: npx prisma db execute --stdin < prisma/seed.sql
-- ============================================================================

-- ─── Departments ────────────────────────────────────────────────────────────────
INSERT INTO departments (id, name, description, "contactEmail", "isActive", "createdAt") VALUES
  (gen_random_uuid(), 'Roads Dept.',        'Road maintenance and pothole repair',        'roads@tn.gov.in',      true, NOW()),
  (gen_random_uuid(), 'CMWSSB',             'Chennai water supply and sewerage',          'cmwssb@tn.gov.in',     true, NOW()),
  (gen_random_uuid(), 'TWAD Board',         'Tamil Nadu Water Supply & Drainage Board',   'twad@tn.gov.in',       true, NOW()),
  (gen_random_uuid(), 'Electrical Dept.',    'Street lighting and electrical maintenance', 'electrical@tn.gov.in', true, NOW()),
  (gen_random_uuid(), 'Sanitation',          'Garbage collection and waste management',    'sanitation@tn.gov.in', true, NOW()),
  (gen_random_uuid(), 'Public Works',        'Public infrastructure maintenance',          'pwd@tn.gov.in',        true, NOW()),
  (gen_random_uuid(), 'Parks & Recreation',  'Parks and public spaces maintenance',        'parks@tn.gov.in',      true, NOW()),
  (gen_random_uuid(), 'Urban Development',   'Urban planning and development',             'urban@tn.gov.in',      true, NOW())
ON CONFLICT (name) DO NOTHING;

-- ─── Users ──────────────────────────────────────────────────────────────────────
-- All passwords: "password123" → bcrypt hash
INSERT INTO users (id, name, email, "passwordHash", role, district, phone, "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), 'Arjun Ravi',       'arjun@example.com',    '$2a$12$2uK/tdg3sZAmJpzS6sTBUekALw.Y7WMBOTO8pDZdKXlw.T.chCUBC', 'CITIZEN',     'Chennai',          '9876543210', true, NOW(), NOW()),
  (gen_random_uuid(), 'Priya Lakshmi',    'priya@example.com',    '$2a$12$2uK/tdg3sZAmJpzS6sTBUekALw.Y7WMBOTO8pDZdKXlw.T.chCUBC', 'CITIZEN',     'Coimbatore',       '9876543211', true, NOW(), NOW()),
  (gen_random_uuid(), 'Karthik Murugan',  'karthik@example.com',  '$2a$12$2uK/tdg3sZAmJpzS6sTBUekALw.Y7WMBOTO8pDZdKXlw.T.chCUBC', 'CITIZEN',     'Madurai',          '9876543212', true, NOW(), NOW()),
  (gen_random_uuid(), 'Divya Sundaram',   'divya@example.com',    '$2a$12$2uK/tdg3sZAmJpzS6sTBUekALw.Y7WMBOTO8pDZdKXlw.T.chCUBC', 'CITIZEN',     'Salem',            '9876543213', true, NOW(), NOW()),
  (gen_random_uuid(), 'Raj Kumar',        'raj@example.com',      '$2a$12$2uK/tdg3sZAmJpzS6sTBUekALw.Y7WMBOTO8pDZdKXlw.T.chCUBC', 'CITIZEN',     'Tiruchirappalli',  '9876543214', true, NOW(), NOW()),
  (gen_random_uuid(), 'Meena Devi',       'meena@example.com',    '$2a$12$2uK/tdg3sZAmJpzS6sTBUekALw.Y7WMBOTO8pDZdKXlw.T.chCUBC', 'CITIZEN',     'Tirunelveli',      '9876543215', true, NOW(), NOW()),
  (gen_random_uuid(), 'Admin User',       'admin@fixitnow.gov.in','$2a$12$2uK/tdg3sZAmJpzS6sTBUekALw.Y7WMBOTO8pDZdKXlw.T.chCUBC', 'ADMIN',       'Chennai',          '9876543200', true, NOW(), NOW()),
  (gen_random_uuid(), 'Super Admin',      'super@fixitnow.gov.in','$2a$12$2uK/tdg3sZAmJpzS6sTBUekALw.Y7WMBOTO8pDZdKXlw.T.chCUBC', 'SUPER_ADMIN', 'Chennai',          '9876543201', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ─── Complaints ─────────────────────────────────────────────────────────────────
INSERT INTO complaints (
  id, "refId", title, category, description, status, priority,
  lat, lng, address, city, district,
  "aiConfidence", "isDuplicate", upvotes,
  "reporterId", "departmentId", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  'FIX-2026-' || LPAD(row_number() OVER ()::text, 3, '0'),
  c.title, c.category::"ComplaintCategory", c.description, c.status::"ComplaintStatus", c.priority::"Priority",
  c.lat, c.lng, c.address, c.city, c.district,
  c.ai_confidence, c.is_duplicate, c.upvotes,
  (SELECT id FROM users WHERE email = c.reporter_email LIMIT 1),
  CASE WHEN c.dept_name IS NOT NULL THEN (SELECT id FROM departments WHERE name = c.dept_name LIMIT 1) ELSE NULL END,
  c.created_at, c.created_at
FROM (VALUES
  ('Large pothole causing accidents on Anna Salai',
   'roads', 'Deep pothole approximately 2 feet wide near Anna Salai bus stop. Multiple two-wheeler accidents reported.',
   'reported', 'high',
   13.0598, 80.2478, 'Anna Salai, near LIC Building', 'Chennai', 'Chennai',
   85, false, 12, 'arjun@example.com', 'Roads Dept.',
   NOW() - INTERVAL '2 days'),

  ('Water pipe burst flooding RS Puram main road',
   'water', 'Major water pipe burst near RS Puram market. Road is flooded and water is being wasted.',
   'assigned', 'high',
   11.0183, 76.9622, 'RS Puram Main Road', 'Coimbatore', 'Coimbatore',
   92, false, 8, 'priya@example.com', 'CMWSSB',
   NOW() - INTERVAL '1 day'),

  ('Garbage not collected for 5 days near Meenakshi Temple area',
   'garbage', 'Garbage bins overflowing near Meenakshi Temple east entrance. Foul smell affecting nearby shops.',
   'in-progress', 'medium',
   9.9195, 78.1193, 'East Masi Street, near Temple', 'Madurai', 'Madurai',
   78, false, 15, 'karthik@example.com', 'Sanitation',
   NOW() - INTERVAL '5 days'),

  ('Multiple street lights out on Omalur Main Road',
   'lighting', 'Entire stretch of 500m has no working street lights. Area is very dark at night.',
   'pending', 'medium',
   11.6651, 78.1464, 'Omalur Main Road', 'Salem', 'Salem',
   71, false, 6, 'divya@example.com', 'Electrical Dept.',
   NOW() - INTERVAL '3 days'),

  ('Storm drain blocked causing flooding in Srirangam',
   'drainage', 'Storm water drain completely blocked near Srirangam temple road. Light rain causes knee-deep flooding.',
   'assigned', 'high',
   10.8631, 78.6900, 'Srirangam Temple Road', 'Tiruchirappalli', 'Tiruchirappalli',
   88, false, 20, 'raj@example.com', 'Public Works',
   NOW() - INTERVAL '4 days'),

  ('Road surface caved in near T. Nagar bus terminus',
   'roads', 'Large section of road has caved in creating a dangerous pit. Barricades needed immediately.',
   'in-progress', 'high',
   13.0418, 80.2341, 'T. Nagar Bus Terminus', 'Chennai', 'Chennai',
   95, false, 25, 'arjun@example.com', 'Roads Dept.',
   NOW() - INTERVAL '1 day'),

  ('Tap water has brown color in Palayamkottai',
   'water', 'Residents receiving contaminated brown-colored water supply for the past 3 days.',
   'reported', 'high',
   8.7139, 77.7567, 'Palayamkottai Main Road', 'Tirunelveli', 'Tirunelveli',
   82, false, 10, 'meena@example.com', 'TWAD Board',
   NOW() - INTERVAL '3 days'),

  ('Public garbage bin removed and not replaced at Gandhipuram',
   'garbage', 'Public waste bin at Gandhipuram central bus stand was removed 2 weeks ago. Waste piling up.',
   'pending', 'low',
   11.0168, 76.9558, 'Gandhipuram Central Bus Stand', 'Coimbatore', 'Coimbatore',
   65, false, 4, 'priya@example.com', NULL,
   NOW() - INTERVAL '14 days'),

  ('Natesan Park playground equipment broken and unsafe',
   'other', 'Swing set and slide in Natesan Park are rusted and broken. Children have been injured.',
   'resolved', 'medium',
   13.0337, 80.2503, 'Natesan Park, T. Nagar', 'Chennai', 'Chennai',
   74, false, 9, 'arjun@example.com', 'Parks & Recreation',
   NOW() - INTERVAL '20 days'),

  ('Open drain emitting foul smell on Bypass Road',
   'drainage', 'Open drainage channel along Bypass Road emitting unbearable stench. Mosquito breeding observed.',
   'assigned', 'medium',
   9.9400, 78.1400, 'Madurai Bypass Road', 'Madurai', 'Madurai',
   69, false, 7, 'karthik@example.com', 'Sanitation',
   NOW() - INTERVAL '7 days'),

  ('Flickering street lights near Chatram Bus Stand',
   'lighting', 'Street lights keep flickering on and off throughout the night. Electrical hazard with exposed wiring.',
   'reported', 'medium',
   10.8050, 78.6856, 'Chatram Bus Stand Area', 'Tiruchirappalli', 'Tiruchirappalli',
   73, false, 3, 'raj@example.com', NULL,
   NOW() - INTERVAL '2 days'),

  ('Zebra crossing markings completely faded at Five Roads junction',
   'roads', 'Pedestrian crossing markings at the busy Five Roads junction are invisible. Pedestrians at risk.',
   'resolved', 'low',
   11.6550, 78.1580, 'Five Roads Junction', 'Salem', 'Salem',
   60, false, 5, 'divya@example.com', 'Roads Dept.',
   NOW() - INTERVAL '30 days'),

  ('No water supply for 3 days in Palace area',
   'water', 'Entire Palace area in Thanjavur has not received water supply for 72 hours.',
   'in-progress', 'high',
   10.7834, 79.1318, 'Palace Area, Big Street', 'Thanjavur', 'Thanjavur',
   90, false, 18, 'meena@example.com', 'TWAD Board',
   NOW() - INTERVAL '3 days'),

  ('Construction debris dumped on Adyar riverbank',
   'garbage', 'Large quantities of construction waste illegally dumped along Adyar river near Kotturpuram bridge.',
   'reported', 'medium',
   13.0127, 80.2410, 'Adyar Riverbank, Kotturpuram', 'Chennai', 'Chennai',
   77, false, 11, 'arjun@example.com', NULL,
   NOW() - INTERVAL '1 day'),

  ('Multiple potholes on VIT road stretch',
   'roads', 'Series of deep potholes on the main road leading to VIT campus. Dangerous for motorcyclists.',
   'pending', 'medium',
   12.9692, 79.1559, 'VIT Main Road', 'Vellore', 'Vellore',
   80, false, 7, 'divya@example.com', 'Roads Dept.',
   NOW() - INTERVAL '6 days')

) AS c(title, category, description, status, priority, lat, lng, address, city, district, ai_confidence, is_duplicate, upvotes, reporter_email, dept_name, created_at)
WHERE NOT EXISTS (SELECT 1 FROM complaints LIMIT 1);

-- ─── Status History ──────────────────────────────────────────────────────────
INSERT INTO status_history (id, "complaintId", status, note, "createdAt")
SELECT gen_random_uuid(), comp.id, 'reported'::"ComplaintStatus",
  'Complaint submitted via Fix It Now app', comp."createdAt"
FROM complaints comp
WHERE NOT EXISTS (SELECT 1 FROM status_history WHERE "complaintId" = comp.id);

INSERT INTO status_history (id, "complaintId", status, note, "createdAt")
SELECT gen_random_uuid(), comp.id, 'pending'::"ComplaintStatus",
  'Under review by admin team', comp."createdAt" + INTERVAL '6 hours'
FROM complaints comp
WHERE comp.status IN ('pending', 'assigned', 'in-progress', 'resolved')
  AND NOT EXISTS (SELECT 1 FROM status_history WHERE "complaintId" = comp.id AND status = 'pending');

INSERT INTO status_history (id, "complaintId", status, note, "createdAt")
SELECT gen_random_uuid(), comp.id, 'assigned'::"ComplaintStatus",
  'Assigned to department for action', comp."createdAt" + INTERVAL '12 hours'
FROM complaints comp
WHERE comp.status IN ('assigned', 'in-progress', 'resolved')
  AND NOT EXISTS (SELECT 1 FROM status_history WHERE "complaintId" = comp.id AND status = 'assigned');

INSERT INTO status_history (id, "complaintId", status, note, "createdAt")
SELECT gen_random_uuid(), comp.id, 'in-progress'::"ComplaintStatus",
  'Work in progress by assigned team', comp."createdAt" + INTERVAL '1 day'
FROM complaints comp
WHERE comp.status IN ('in-progress', 'resolved')
  AND NOT EXISTS (SELECT 1 FROM status_history WHERE "complaintId" = comp.id AND status = 'in-progress');

INSERT INTO status_history (id, "complaintId", status, note, "createdAt")
SELECT gen_random_uuid(), comp.id, 'resolved'::"ComplaintStatus",
  'Issue has been resolved and verified', comp."createdAt" + INTERVAL '5 days'
FROM complaints comp
WHERE comp.status = 'resolved'
  AND NOT EXISTS (SELECT 1 FROM status_history WHERE "complaintId" = comp.id AND status = 'resolved');

-- ─── Verify ─────────────────────────────────────────────────────────────────────
SELECT 'Departments: ' || COUNT(*)::text FROM departments;
SELECT 'Users: '       || COUNT(*)::text FROM users;
SELECT 'Complaints: '  || COUNT(*)::text FROM complaints;
SELECT 'Status History: ' || COUNT(*)::text FROM status_history;
