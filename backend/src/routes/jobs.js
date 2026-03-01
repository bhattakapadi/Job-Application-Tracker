const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const authMiddleware = require('./authMiddleware');

const upload = multer();

// All job routes require a valid JWT
router.use(authMiddleware);

// GET /api/jobs — only this user's jobs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/jobs/:id — single job, must belong to this user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/jobs — create a job tied to this user
router.post('/', upload.fields([
  { name: 'cv' },
  { name: 'job_description' },
  { name: 'motivation_letter' }
]), async (req, res) => {
  try {
    const {
      company_name,
      job_description,
      job_url,
      motivation_letter,
      position,
      salary_wished,
      current_status
    } = req.body;

    const cv             = req.files?.cv?.[0]?.buffer || null;
    const jobDescFile    = req.files?.job_description?.[0]?.buffer || null;
    const motivationFile = req.files?.motivation_letter?.[0]?.buffer || null;

    const finalJobDesc   = jobDescFile  || job_description  || null;
    const finalMotivation = motivationFile || motivation_letter || null;

    const result = await pool.query(
      `INSERT INTO jobs
        (user_id, company_name, job_description, job_url, cv, motivation_letter, position, salary_wished, current_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.userId,
        company_name,
        finalJobDesc,
        job_url       || null,
        cv,
        finalMotivation,
        position      || null,
        salary_wished || null,
        current_status || 'Applied'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/jobs/:id — update status, must belong to this user
router.put('/:id', upload.none(), async (req, res) => {
  try {
    const { id } = req.params;
    const { current_status } = req.body;

    const result = await pool.query(
      'UPDATE jobs SET current_status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [current_status, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/jobs/:id — must belong to this user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;