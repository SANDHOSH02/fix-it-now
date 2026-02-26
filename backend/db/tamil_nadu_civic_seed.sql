-- PostgreSQL schema + Tamil Nadu sample data for Fix-It-Now backend

DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS districts;

CREATE TABLE districts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  zone VARCHAR(50) NOT NULL
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category_id INT NOT NULL REFERENCES categories(id),
  district_id INT NOT NULL REFERENCES districts(id),
  locality VARCHAR(200) NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  reported_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP
);

INSERT INTO districts (name, zone) VALUES
('Chennai', 'North TN'),
('Coimbatore', 'West TN'),
('Madurai', 'South TN'),
('Tiruchirappalli', 'Central TN'),
('Salem', 'West TN'),
('Tirunelveli', 'South TN'),
('Thoothukudi', 'South TN'),
('Erode', 'West TN'),
('Vellore', 'North TN'),
('Thanjavur', 'Delta TN');

INSERT INTO categories (name, description) VALUES
('roads', 'Potholes, road cracks, damaged surfaces and unsafe medians'),
('water', 'Water leakage, pipeline bursts, drinking water disruption'),
('garbage', 'Garbage overflow, irregular waste collection, dumping spots'),
('lighting', 'Streetlight not working, exposed electrical hazards'),
('drainage', 'Clogged drains, sewage overflow and stagnant water');

INSERT INTO issues (
  title,
  description,
  category_id,
  district_id,
  locality,
  latitude,
  longitude,
  status,
  priority,
  reported_at,
  resolved_at
) VALUES
('Large pothole near Teynampet signal', 'A deep pothole is causing traffic slowdown and minor bike skids near the signal.', 1, 1, 'Anna Salai, Chennai', 13.041773, 80.233705, 'pending', 'high', '2026-01-06 08:10:00', NULL),
('Pipeline leak near Gandhipuram bus stand', 'Continuous water leak from underground line for more than 2 days.', 2, 2, 'Gandhipuram, Coimbatore', 11.017330, 76.967500, 'in_progress', 'high', '2026-01-04 10:25:00', NULL),
('Garbage overflow at temple street', 'Waste bins are full and spilling onto the road close to market area.', 3, 3, 'Meenakshi Amman Street, Madurai', 9.919500, 78.119300, 'pending', 'medium', '2026-01-05 07:40:00', NULL),
('Streetlights not working in Srirangam', 'Four consecutive poles are not functioning making the street unsafe at night.', 4, 4, 'Srirangam, Tiruchirappalli', 10.862900, 78.695200, 'resolved', 'medium', '2026-01-01 18:15:00', '2026-01-03 20:45:00'),
('Stormwater drain blocked after rain', 'Drain outlet is blocked causing water stagnation in residential lane.', 5, 5, 'Fairlands, Salem', 11.664300, 78.146000, 'in_progress', 'high', '2026-01-03 09:00:00', NULL),
('Broken road shoulder near Palayamkottai', 'Road shoulder has eroded making bus stop access difficult.', 1, 6, 'Palayamkottai, Tirunelveli', 8.713900, 77.756700, 'pending', 'medium', '2026-01-02 15:30:00', NULL),
('Irregular waste pickup in coastal ward', 'Household waste has not been collected for three days.', 3, 7, 'Beach Road, Thoothukudi', 8.764200, 78.134800, 'resolved', 'low', '2025-12-31 06:40:00', '2026-01-01 09:10:00'),
('Water supply interruption in Surampatti', 'Morning water supply did not arrive and line pressure is very low.', 2, 8, 'Surampatti, Erode', 11.341000, 77.717200, 'pending', 'high', '2026-01-06 05:50:00', NULL),
('Drainage overflow near CMC', 'Sewage overflow near hospital-side street needs immediate cleaning.', 5, 9, 'Bagayam, Vellore', 12.925100, 79.135300, 'in_progress', 'high', '2026-01-04 12:10:00', NULL),
('Damaged streetlight pole wiring', 'Open wiring at the base of the pole poses an electrical safety risk.', 4, 10, 'Medical College Road, Thanjavur', 10.786700, 79.137800, 'pending', 'high', '2026-01-05 19:30:00', NULL);
