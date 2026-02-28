const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const upload = multer();

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single job
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new job
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

    const cv = req.files?.cv?.[0]?.buffer || null;
    const jobDescFile = req.files?.job_description?.[0]?.buffer || null;
    const motivationFile = req.files?.motivation_letter?.[0]?.buffer || null;

    const finalJobDesc = jobDescFile || job_description || null;
    const finalMotivation = motivationFile || motivation_letter || null;

    const result = await pool.query(
      `INSERT INTO jobs 
        (company_name, job_description, job_url, cv, motivation_letter, position, salary_wished, current_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [company_name, finalJobDesc, job_url || null, cv, finalMotivation, position || null, salary_wished || null, current_status || 'Applied']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE job status
router.put('/:id', upload.none(), async (req, res) => {
  try {
    const { id } = req.params;
    const { current_status } = req.body;
    const result = await pool.query(
      'UPDATE jobs SET current_status = $1 WHERE id = $2 RETURNING *',
      [current_status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE job
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;