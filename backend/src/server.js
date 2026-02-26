const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS server_time');
    return res.json({ status: 'ok', dbTime: result.rows[0].server_time });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/api/districts', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM districts ORDER BY name');
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/api/issues', async (req, res) => {
  const { district, category, status } = req.query;

  const conditions = [];
  const values = [];

  if (district) {
    values.push(district);
    conditions.push(`d.name = $${values.length}`);
  }

  if (category) {
    values.push(category);
    conditions.push(`c.name = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`i.status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT
      i.id,
      i.title,
      i.description,
      c.name AS category,
      d.name AS district,
      i.locality,
      i.latitude,
      i.longitude,
      i.status,
      i.priority,
      i.reported_at,
      i.resolved_at
    FROM issues i
    JOIN categories c ON c.id = i.category_id
    JOIN districts d ON d.id = i.district_id
    ${whereClause}
    ORDER BY i.reported_at DESC
  `;

  try {
    const { rows } = await pool.query(query, values);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/api/stats/overview', async (_req, res) => {
  try {
    const query = `
      SELECT
        COUNT(*)::int AS total_issues,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved
      FROM issues
    `;

    const { rows } = await pool.query(query);
    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get('/api/stats/by-district', async (_req, res) => {
  try {
    const query = `
      SELECT
        d.name AS district,
        COUNT(i.id)::int AS total_issues,
        COUNT(i.id) FILTER (WHERE i.status = 'resolved')::int AS resolved_issues
      FROM districts d
      LEFT JOIN issues i ON i.district_id = d.id
      GROUP BY d.name
      ORDER BY total_issues DESC, d.name ASC
    `;

    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post('/api/issues', async (req, res) => {
  const {
    title,
    description,
    category_id: categoryId,
    district_id: districtId,
    locality,
    latitude,
    longitude,
    priority = 'medium',
    status = 'pending',
  } = req.body;

  if (!title || !description || !categoryId || !districtId || !locality) {
    return res.status(400).json({
      message: 'title, description, category_id, district_id and locality are required',
    });
  }

  try {
    const query = `
      INSERT INTO issues (
        title,
        description,
        category_id,
        district_id,
        locality,
        latitude,
        longitude,
        priority,
        status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;

    const values = [
      title,
      description,
      categoryId,
      districtId,
      locality,
      latitude || null,
      longitude || null,
      priority,
      status,
    ];

    const { rows } = await pool.query(query, values);
    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
