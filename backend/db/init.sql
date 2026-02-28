CREATE TABLE IF NOT EXISTS jobs (
  id                    SERIAL PRIMARY KEY,
  company_name          VARCHAR(100) NOT NULL,
  job_description       BYTEA,
  job_url               VARCHAR(255),
  cv                    BYTEA,
  motivation_letter     BYTEA,
  position              VARCHAR(100),
  salary_wished         VARCHAR(100),
  current_status        VARCHAR(50) DEFAULT 'Applied',
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);