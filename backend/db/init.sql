-- ─────────────────────────────────────────
--  Job Application Tracker — DB Schema
-- ─────────────────────────────────────────

-- Users must be created first (jobs references it)
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,   -- bcrypt hash
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Each job belongs to exactly one user
CREATE TABLE IF NOT EXISTS jobs (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name      VARCHAR(100) NOT NULL,
  job_description   BYTEA,
  job_url           VARCHAR(255),
  cv                BYTEA,
  motivation_letter BYTEA,
  position          VARCHAR(100),
  salary_wished     VARCHAR(100),
  current_status    VARCHAR(50) DEFAULT 'Applied',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index so "get all jobs for user X" is fast
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);