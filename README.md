# 📋 Job Application Tracker

> *Because "I think I applied there?" is not a career strategy.*

Live at 👉 **[jobtracker.bhattakapadi.com](http://jobtracker.bhattakapadi.com)**

---

## What is this?

A simple app that helps job seekers keep track of every application they've sent out — who you applied to, what role, when, and where things stand. No more losing track of 30 open tabs.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ Frontend | React + Vite |
| ⚙️ Backend | Node.js + Express |
| 🗄️ Database | PostgreSQL |
| 🐳 Containers | Docker + Docker Compose |
| ☁️ Hosting | Google Cloud VM |
| 🔁 CI/CD | GitHub Actions |
| 🔐 Auth | JWT + bcrypt |

---

## Features

- 🔐 **User auth** — register, login, each user sees only their own applications
- ➕ **Add applications** — company, role, salary, job URL, status
- 📁 **File uploads** — attach your CV and cover letter (PDF/DOC)
- ⬇️ **Download files** — retrieve your uploaded CV and cover letter anytime
- 🔄 **Inline status updates** — change status directly from the dashboard
- 🗑️ **Delete with confirmation** — no accidental rage-deletes
- 📊 **Dashboard stats** — see your pipeline at a glance

---

## Architecture

```
Browser
   │
   ▼
React Frontend (Vite) — port 5173
   │  /api/* proxied to backend
   ▼
Express REST API — port 5000
   │
   ▼
PostgreSQL — port 5432
```

All three services run as Docker containers, orchestrated by Docker Compose on a Google Cloud VM.

---

## CI/CD Pipeline

```
Push to main
   │
   ├── CI (GitHub Actions)
   │     ├── Build Docker images
   │     ├── Run integration tests (auth + CRUD + security)
   │     └── Tear down
   │
   └── CD (GitHub Actions) — runs only if CI passes
         ├── SSH into Google Cloud VM
         ├── Pull latest code
         ├── Write .env secrets
         └── docker compose up --build -d
```

---

## Local Development

```bash
# Clone
git clone https://github.com/bhattakapadi/Job-Application-Tracker.git
cd Job-Application-Tracker

# Add your env file
echo "JWT_SECRET=your_secret_here" > backend/.env

# Run everything
docker compose up --build
```

Then open [http://localhost:5173](http://localhost:5173).

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| GET | `/api/jobs` | ✅ | Get your jobs |
| POST | `/api/jobs` | ✅ | Add a job |
| PUT | `/api/jobs/:id` | ✅ | Update status |
| DELETE | `/api/jobs/:id` | ✅ | Delete a job |
| GET | `/api/jobs/:id/cv` | ✅ | Download CV |
| GET | `/api/jobs/:id/motivation_letter` | ✅ | Download cover letter |

---

*Built with ☕ and the quiet optimism of someone who hasn't been ghosted yet today.*
