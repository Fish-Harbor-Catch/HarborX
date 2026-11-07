# HarborX

HarborX is a modern platform for fish harbor catch and auction management, connecting fishermen, auctioneers, buyers, and harbor authorities to streamline maritime market operations.

---

## Quick Start with Docker

The fastest way to get HarborX running locally:

```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Start PostgreSQL and HarborX in containers
docker compose up -d

# 3. Create the initial administrator account
docker compose exec app npm run create-admin
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

For development with hot reload:
```bash
docker compose -f compose.dev.yaml up
```

For full containerization and deployment details, see the [Containerization Guide](docs/DOCKER.md).

---

## Local Development (Without Docker)

Requirements: Node.js >= 22

```bash
# Install dependencies
npm install

# Start both backend and frontend concurrently
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5050](http://localhost:5050)

---

## Documentation

- [Docker & Containerization Guide](docs/DOCKER.md)
- [Backend API Specification](docs/API.md)
- [Demonstration & Account Guide](docs/DEMO-GUIDE.md)
- [Progressive Web App (PWA) Offline Guide](docs/PWA.md)
- [Login & Authentication Debugging](docs/LOGIN-DEBUGGING.md)
