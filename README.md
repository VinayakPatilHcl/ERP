# Hospital ERP

A modular ERP for hospitals/clinics. Phase 1 is a standalone single-clinic deployment; the design keeps room for a multi-tenant centralised mode later.

## Stack

- **Backend**: Java 21, Spring Boot 3.5.x, Spring Security + JWT, Spring Data JPA, Flyway, PostgreSQL, Lombok, springdoc-openapi
- **Frontend**: React 18 + TypeScript (Vite), React Router, Axios
- **Build**: Maven (backend), npm (frontend)

## Modules

1. Auth / Login
2. Dashboard
3. Patients (profile, medical history, visits)
4. Appointments (calendar, today's list, doctor selection, token, follow-up)
5. Consultations & Prescriptions (vitals, symptoms, diagnosis, diet, panchakarma, printable Rx)
6. Billing (invoice with consultation/medicine/treatment lines, GST, payments, daily collection)
7. Pharmacy (medicine master, stock)
8. Settings (clinic profile, doctors, GST rates, tax config)

## Layout

```
hospital-erp/
  backend/     Spring Boot REST API
  frontend/    React SPA
```

## Run locally

### Option A: Docker (easiest — no local JDK required)

Only requires **Docker** (with Docker Compose). This builds JDK 21, Node, and PostgreSQL inside containers automatically.

Single command to build & start everything:

```bash
docker compose up -d --build
```

Or via Makefile:

```bash
make docker-up
```

This starts three containers:

| Service | Container | URL |
|---------|-----------|-----|
| PostgreSQL 16 | `hospital-erp-db` | `localhost:5432` |
| Backend (Spring Boot) | `hospital-erp-backend` | `http://localhost:8080/api` |
| Frontend (React + nginx) | `hospital-erp-frontend` | `http://localhost:5173` |

Default admin (auto-created on first run): `admin / admin123` — **change immediately in production**.

Swagger UI: `http://localhost:8080/api/swagger-ui.html`

Useful commands:

```bash
docker compose logs -f          # or: make docker-logs
docker compose down             # or: make docker-down
docker compose up -d --build    # rebuild after code changes
```

### Option B: Makefile (native dev, requires JDK 21)

Prerequisites:

- `make` (on Windows: Git Bash / WSL / `choco install make`)
- JDK 21 and Maven 3.9+ on PATH
- Node 18+ and npm
- A running PostgreSQL instance (see Option C below), or `psql` + a superuser to run `make db-create`

```bash
make install       # install backend & frontend dependencies (one-time)
make db-create     # create PostgreSQL DB + user (one-time, needs psql)
make run           # start backend (8080) + frontend (5173) together
```

You can also run them separately:

```bash
make run-backend   # Spring Boot dev backend on port 8080
make run-frontend  # Vite dev server on port 5173
make build         # build both backend jar and frontend dist
make test          # run backend + frontend tests
make clean         # remove build artifacts
```

Run `make help` for the full list of targets.

### Option C: Manual setup

#### 1. PostgreSQL

```sql
CREATE DATABASE hospital_erp;
CREATE USER hospital WITH PASSWORD 'hospital';
GRANT ALL PRIVILEGES ON DATABASE hospital_erp TO hospital;
```

#### 2. Backend

Requires JDK 21 and Maven 3.9+ on PATH.

```powershell
cd backend
mvn spring-boot:run
```

API base URL: `http://localhost:8080/api`
Swagger UI: `http://localhost:8080/api/swagger-ui.html`

Default admin (auto-created on first run): `admin / admin123` — **change immediately in production**.

To generate a Maven Wrapper (optional): `mvn -N wrapper:wrapper`

#### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

App on http://localhost:5173.

## Roles

`ADMIN`, `DOCTOR`, `RECEPTIONIST`, `PHARMACIST`

## Deploying to another system (no source code needed)

The target machine only needs **Docker** (with Docker Compose). No JDK, Node, or source code required.

### Option 1: Push to a container registry

On the **build machine** (where you have the source):

```bash
# Build and push images (replace with your registry)
make docker-push REGISTRY=myregistry.azurecr.io TAG=1.0.0
```

On the **target machine**, copy over `docker-compose.deploy.yml` and run:

```bash
REGISTRY=myregistry.azurecr.io TAG=1.0.0 docker compose -f docker-compose.deploy.yml up -d
```

Or via Makefile (if available on target):

```bash
make deploy-up REGISTRY=myregistry.azurecr.io TAG=1.0.0
```

### Option 2: Offline / air-gapped (tar export)

On the **build machine**:

```bash
make docker-save                # exports to dist-images/
```

This creates two files:

- `dist-images/hospital-erp-backend-latest.tar` (~175 MB)
- `dist-images/hospital-erp-frontend-latest.tar` (~26 MB)

Copy these files along with `docker-compose.deploy.yml` to the target machine.

On the **target machine**:

```bash
# Load the images
docker load -i dist-images/hospital-erp-backend-latest.tar
docker load -i dist-images/hospital-erp-frontend-latest.tar

# Start the stack
docker compose -f docker-compose.deploy.yml up -d
```

Or via Makefile (if available on target):

```bash
make docker-load
make deploy-up
```

### Configuration

The deploy compose file (`docker-compose.deploy.yml`) accepts environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `REGISTRY` | *(empty — local images)* | Container registry prefix |
| `TAG` | `latest` | Image tag / version |
| `DB_NAME` | `hospital_erp` | PostgreSQL database name |
| `DB_USER` | `hospital` | PostgreSQL user |
| `DB_PASSWORD` | `hospital` | PostgreSQL password |
| `DB_PORT` | `5432` | PostgreSQL host port |
| `BACKEND_PORT` | `8080` | Backend host port |
| `FRONTEND_PORT` | `5173` | Frontend host port |
| `JWT_SECRET` | *(default)* | JWT signing secret — **change in production** |

## Deploy to the cloud (free — Render)

Deploy the full stack publicly without a paid domain. Requires a free [Render](https://render.com) account.

### Quick deploy (Blueprint)

1. Push this repo to **GitHub** (private repo is fine).
2. Go to [Render Dashboard → Blueprints](https://dashboard.render.com/blueprints) → **New Blueprint Instance**.
3. Connect your GitHub repo. Render auto-detects `render.yaml` and creates:
   - **hospital-erp-db** — free PostgreSQL
   - **hospital-erp-backend** — Spring Boot API
   - **hospital-erp-frontend** — React app served by nginx
4. After deploy, note the backend URL (e.g. `https://hospital-erp-backend.onrender.com`).
5. Go to the **frontend** service → Environment → set `BACKEND_URL` to the backend URL from step 4.
6. Redeploy the frontend.

Your app will be live at: `https://hospital-erp-frontend.onrender.com`

### Free tier notes

- Services **spin down after 15 min** of inactivity; first request after that takes ~30s (cold start).
- Free PostgreSQL **expires after 90 days** — back up and recreate if needed.
- Each service gets a free `*.onrender.com` subdomain (no custom domain needed).

### Manual deploy (without Blueprint)

If you prefer to set up services individually:

1. Create a **PostgreSQL** database (free plan) on Render.
2. Create a **Web Service** for the backend:
   - Root directory: `backend`
   - Runtime: Docker
   - Set env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `SPRING_PROFILES_ACTIVE=render`
3. Create a **Web Service** for the frontend:
   - Root directory: `frontend`
   - Dockerfile path: `Dockerfile.render`
   - Set env var: `BACKEND_URL=https://<your-backend>.onrender.com`

## Path to centralised (later)

- Add `tenant_id` column + Hibernate filter or schema-per-tenant
- Externalise auth (Keycloak / Azure AD)
- Split modules into separate services if/when needed

