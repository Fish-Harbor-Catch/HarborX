# HarborX Containerization Guide

This guide covers building, running, developing, and deploying HarborX with Docker and Docker Compose.

---

## 1. Container Architecture Overview

HarborX offers flexible containerization options tailored for development, production, and microservices:

| Mode | Compose File / Dockerfile | Description |
|---|---|---|
| **Production Stack (Unified)** | `compose.yaml` + `Dockerfile` | Multi-stage build combining Vite frontend static assets with Express Node.js API into a secure, minimal Alpine container, orchestrated alongside PostgreSQL 17. |
| **Development Stack (Live Reload)** | `compose.dev.yaml` + `Dockerfile.dev` | Mounts local source code with hot module replacement (HMR) for Vite and auto-reload for Express, plus exposed PostgreSQL for database tools. |
| **HTTPS Production Overlay** | `compose.https.yaml` + `deploy/Caddyfile` | Adds Caddy 2 for automated TLS/SSL certificate issuance and reverse proxying with secure cookie enforcement. |
| **Standalone Backend** | `backend/Dockerfile` | Minimal Node 22 Alpine container running only the Express API. |
| **Standalone Frontend** | `frontend/Dockerfile` + `frontend/nginx.conf` | Multi-stage build producing static files served by Nginx Alpine with SPA fallback routing, asset caching, and `/api` reverse proxying. |

---

## 2. Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) 24.0+ and [Docker Compose](https://docs.docker.com/compose/) v2.24+
- A configured `.env` file in the project root (copied from `.env.example`).

---

## 3. Quick Start (Production Mode)

### Step 1: Prepare Environment Variables
Copy `.env.example` to `.env` in the root folder:

```bash
# On Linux/macOS
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```

Ensure `POSTGRES_PASSWORD` and `JWT_SECRET` (minimum 32 characters) are set.

### Step 2: Build and Run
Start the complete production stack (database + application):

```bash
docker compose up --build -d
```
Or use the npm script:
```bash
npm run docker:up
```

### Step 3: Access the Application
- **Web UI & API:** Open [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Step 4: Create Initial Admin Account
Once the containers are healthy, create the administrator account using the credentials defined in `.env`:

```bash
docker compose exec app npm run create-admin
```
Or:
```bash
npm run docker:admin
```

---

## 4. Development Mode (Live Hot-Reload)

To develop inside Docker with instant hot module replacement (HMR) for React and `--watch` reload for Node:

```bash
docker compose -f compose.dev.yaml up --build
```
Or:
```bash
npm run docker:dev
```

In development mode:
- **Frontend (Vite Dev Server):** [http://localhost:5173](http://localhost:5173) (with live HMR)
- **Backend API:** [http://localhost:5050](http://localhost:5050) (with `node --watch`)
- **PostgreSQL Database:** Exposed on `localhost:5432` for GUI inspection (DBeaver, TablePlus, pgAdmin)
- **Demo Data:** `DEMO_SEED=true` pre-populates demo catches, auctions, and accounts.

To stop development containers:
```bash
npm run docker:dev:down
```

---

## 5. HTTPS Production Deployment (Caddy Reverse Proxy)

For Internet-facing production servers with automatic SSL/TLS certificates:

1. Point your domain's DNS `A`/`AAAA` records to your server.
2. In the root `.env` file, configure:
   ```env
   HARBORX_DOMAIN=harborx.yourdomain.com
   COOKIE_SECURE=true
   CLIENT_ORIGIN=https://harborx.yourdomain.com
   ```
3. Run with the HTTPS overlay:
   ```bash
   docker compose -f compose.yaml -f compose.https.yaml up --build -d
   ```

Caddy will automatically request and maintain Let's Encrypt certificates, enforce HTTPS redirection, and proxy incoming requests securely.

---

## 6. Standalone Image Builds

You can also build individual microservice images directly:

```bash
# Build standalone Backend API
docker build -f backend/Dockerfile -t harborx-backend .

# Build standalone Frontend (Nginx SPA)
docker build -f frontend/Dockerfile -t harborx-frontend .

# Build root Unified Monolith
docker build -f Dockerfile -t harborx-app .
```

---

## 7. Useful Docker Commands & NPM Scripts

| Action | NPM Script | Docker Command |
|---|---|---|
| Build production images | `npm run docker:build` | `docker compose build` |
| Start production stack | `npm run docker:up` | `docker compose up -d` |
| View container logs | `npm run docker:logs` | `docker compose logs -f` |
| Stop production stack | `npm run docker:down` | `docker compose down` |
| Start dev stack | `npm run docker:dev` | `docker compose -f compose.dev.yaml up --build` |
| Stop dev stack | `npm run docker:dev:down` | `docker compose -f compose.dev.yaml down` |
| Create admin user | `npm run docker:admin` | `docker compose exec app npm run create-admin` |
| Seed demo records | `npm run docker:seed` | `docker compose exec app npm run seed` |

---

## 8. Data Persistence & Backups

- PostgreSQL data is persisted inside the Docker named volume `harborx_database` (or `harborx_dev_database` in dev mode).
- Do not run `docker compose down -v` unless you intentionally want to delete all database records.
- To take a backup:
  ```bash
  docker compose exec database pg_dump -U harborx harborx > backup_$(date +%Y%m%d).sql
  ```
- To restore:
  ```bash
  cat backup.sql | docker compose exec -T database psql -U harborx harborx
  ```
