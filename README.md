# PharmaWatch — Drug Safety Signal Intelligence Platform

Automated B2B SaaS for pharmaceutical companies. Every night a cloud script scans new medical papers, uses BioBERT AI to extract side effects, and pushes a prioritized alert feed to your dashboard.

---

## Tech Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | React 18 + Recharts + React Router v6        |
| Backend    | Java 17 + Spring Boot 3 + Spring Security    |
| Database   | PostgreSQL (Supabase free tier)              |
| Auth       | JWT (access + refresh tokens) + BCrypt       |
| AI Engine  | Python + Hugging Face BioBERT                |
| DevOps     | Docker + Docker Compose + GitHub Actions     |

---

## Project Structure

```
pharmawatch/
├── backend/                  # Spring Boot REST API
│   ├── src/main/java/com/pharmawatch/
│   │   ├── config/           # Security, CORS, exception handler
│   │   ├── controller/       # Auth, Dashboard REST endpoints
│   │   ├── dto/              # Request/Response DTOs
│   │   ├── entity/           # JPA entities (User, Company, Alert, Drug)
│   │   ├── repository/       # Spring Data JPA repos
│   │   ├── security/         # JWT filter + utility
│   │   └── service/          # Business logic
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # AlertCard, MetricCard, Chart, Layout
│   │   ├── hooks/            # useAuth context
│   │   ├── pages/            # Login, Register, ForgotPassword, Dashboard
│   │   ├── services/         # Axios API client
│   │   └── styles/           # Global CSS variables
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── ai-engine/                # Python nightly scanner
│   ├── scan.py               # PubMed → BioBERT → DB pipeline
│   └── requirements.txt
│
├── .github/workflows/        # GitHub Actions CI/CD + nightly cron
├── docker-compose.yml        # Full stack (prod-like)
├── docker-compose.dev.yml    # Dev override with hot reload
├── .env.example              # Copy to .env and fill in
└── README.md
```

---

## Prerequisites

Install these before starting:

- **Docker Desktop** — https://www.docker.com/products/docker-desktop
- **Git** — https://git-scm.com
- **Node.js 20+** (only needed for local frontend dev) — https://nodejs.org
- **Java 17+** (only needed for local backend dev) — https://adoptium.net
- **Maven 3.9+** (only needed for local backend dev) — https://maven.apache.org

---

## Option A — Run Everything with Docker (Recommended)

This is the easiest path. One command starts the database, backend, and frontend.

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-org/pharmawatch.git
cd pharmawatch
```

### Step 2 — Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in:
- `JWT_SECRET` — any random 64+ character string (run `openssl rand -base64 48` to generate one)
- `MAIL_USERNAME` / `MAIL_PASSWORD` — your Gmail + App Password (see Gmail setup below)
- Leave `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` as-is for local Docker

**Gmail App Password setup:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Create an app password for "Mail"
5. Paste the 16-character password into `MAIL_PASSWORD`

> Forgot password emails won't crash the app if mail is misconfigured — they just log a warning.

### Step 3 — Start all services

```bash
docker-compose up --build
```

First build takes ~3–5 minutes (Maven + npm downloads). Subsequent starts are fast.

Wait until you see:
```
pharmawatch-backend  | Started PharmaWatchApplication in X.X seconds
```

### Step 4 — Open the app

| Service   | URL                        |
|-----------|----------------------------|
| App (UI)  | http://localhost:80         |
| API       | http://localhost:8080/api  |

### Step 5 — Register your first account

1. Go to **http://localhost:80**
2. Click **Create account**
3. Fill in your details and company name
4. You're redirected to the dashboard with demo data pre-loaded

### Stop the stack

```bash
docker-compose down          # Stop containers (keep DB data)
docker-compose down -v       # Stop + delete all data
```

---

## Option B — Run Locally Without Docker (Dev Mode)

Better for active development with hot reload.

### Step 1 — Start PostgreSQL only via Docker

```bash
docker-compose up postgres -d
```

This gives you a clean local Postgres without running the other services in Docker.

### Step 2 — Configure and run the backend

```bash
cd backend
```

Create `src/main/resources/application-local.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pharmawatch
spring.datasource.username=pharmawatch_user
spring.datasource.password=pharmawatch_dev_pass
app.jwt.secret=local-dev-secret-key-minimum-256-bits-long-replace-in-prod
spring.mail.host=smtp.gmail.com
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
app.frontend-url=http://localhost:3000
app.cors.allowed-origins=http://localhost:3000
```

Run:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Backend starts at **http://localhost:8080**

### Step 3 — Run the frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Frontend starts at **http://localhost:3000**

---

## Option C — Supabase (Free Cloud Database)

Replace the local Postgres with Supabase's free tier.

### Step 1 — Create Supabase project

1. Sign up at https://supabase.com (free)
2. Create a new project
3. Go to **Settings → Database**
4. Copy the **Connection string** (URI format)

### Step 2 — Update environment

In `.env` (for Docker) or `application.properties` (for local):
```
DATABASE_URL=jdbc:postgresql://db.<your-project-ref>.supabase.co:5432/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<your-supabase-db-password>
```

The app uses `spring.jpa.hibernate.ddl-auto=update` so all tables are created automatically on first boot.

---

## API Reference

### Authentication Endpoints

| Method | URL                          | Body                                   | Description         |
|--------|------------------------------|----------------------------------------|---------------------|
| POST   | `/api/auth/register`         | firstName, lastName, email, password, jobTitle, companyName, companyDomain | Register + auto login |
| POST   | `/api/auth/login`            | email, password                        | Login               |
| POST   | `/api/auth/forgot-password`  | email                                  | Send reset link     |
| POST   | `/api/auth/reset-password`   | token, newPassword                     | Reset password      |

### Dashboard Endpoints (require Bearer token)

| Method | URL                                  | Description              |
|--------|--------------------------------------|--------------------------|
| GET    | `/api/dashboard`                     | Get all dashboard data   |
| PATCH  | `/api/dashboard/alerts/{id}/read`    | Mark alert as read       |

### Example — Register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@acme-pharma.com",
    "password": "SecurePass123",
    "jobTitle": "Pharmacovigilance Lead",
    "companyName": "Acme Pharmaceuticals",
    "companyDomain": "acme-pharma.com"
  }'
```

### Example — Login

```bash
curl -X POST http://localhost:8080/api/localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@acme-pharma.com", "password": "SecurePass123"}'
```

Save the `accessToken` from the response, then use it:

```bash
curl -H "Authorization: Bearer <accessToken>" http://localhost:8080/api/dashboard
```

---

## Running the AI Scanner Manually

The Python scanner runs automatically every night at 2 AM via GitHub Actions, but you can trigger it locally:

```bash
cd ai-engine
pip install -r requirements.txt

# Set env vars
export DATABASE_URL="jdbc:postgresql://localhost:5432/pharmawatch"
export HF_API_KEY="hf_your_key"  # from huggingface.co/settings/tokens

python scan.py
```

Get a free Hugging Face API key at https://huggingface.co/settings/tokens

---

## GitHub Actions Setup (CI/CD + Nightly Scan)

### Step 1 — Push to GitHub

```bash
git remote add origin https://github.com/your-org/pharmawatch.git
git push -u origin main
```

### Step 2 — Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret Name         | Value                                    |
|---------------------|------------------------------------------|
| `DATABASE_URL`      | Your Supabase JDBC connection string     |
| `DATABASE_USERNAME` | postgres                                 |
| `DATABASE_PASSWORD` | Your Supabase DB password                |
| `JWT_SECRET`        | Your 64-char random string               |
| `HF_API_KEY`        | Your Hugging Face API token              |
| `PUBMED_API_KEY`    | PubMed API key (optional)                |
| `REACT_APP_API_URL` | https://your-backend-domain.com/api      |

### Step 3 — Actions run automatically

- **On every push** → tests run + Docker images built
- **Every night at 2 AM UTC** → `scan.py` runs, new alerts appear in dashboard

---

## Common Issues & Fixes

### "Connection refused" on backend start
The backend tries to connect to PostgreSQL immediately. Make sure Postgres is running:
```bash
docker-compose up postgres -d
# Wait 10 seconds, then start backend
```

### CORS errors in browser
Make sure `CORS_ORIGINS` in `.env` includes the exact URL you're accessing from (including port).

### "Invalid or expired reset token"
Password reset tokens expire after 1 hour. Request a new one.

### Frontend shows blank page after login
Check browser console. Usually means `REACT_APP_API_URL` is wrong in `.env`.
For Docker: it should be `http://localhost:8080/api`
For production: it should be your actual backend URL.

### "Email already registered" on register
The email is taken. Use a different email or log in instead.

### Maven build fails (Java version)
Make sure Java 17+ is installed:
```bash
java -version  # should show 17 or higher
```

---

## Production Deployment Checklist

- [ ] Set a strong random `JWT_SECRET` (min 64 chars)
- [ ] Use Supabase or managed PostgreSQL (not local Docker)
- [ ] Configure real SMTP credentials
- [ ] Set `CORS_ORIGINS` to your actual frontend domain
- [ ] Set `FRONTEND_URL` to your actual frontend URL
- [ ] Enable HTTPS (via reverse proxy like Nginx or Cloudflare)
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` in production
- [ ] Add GitHub secrets for the nightly scan workflow

---

## License

MIT — see LICENSE file.
