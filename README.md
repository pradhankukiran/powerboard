<div align="center">

<br />

<img src="https://img.icons8.com/3d-fluency/94/combo-chart.png" alt="PowerBoard Logo" width="80" />

# PowerBoard

**Unified MSP Client Portal with Embedded BI Dashboards**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-5FA04E?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

<br />

A full-stack client portal designed for **Managed Service Providers (MSPs)** to give their clients a single pane of glass into tickets, devices, alerts, SLA metrics, and print tracking — powered by embedded analytics from **Grafana**, **Metabase**, and **Apache Superset**.

<br />

[Getting Started](#-getting-started) &nbsp;&bull;&nbsp; [Architecture](#-architecture) &nbsp;&bull;&nbsp; [API Reference](#-api-reference) &nbsp;&bull;&nbsp; [Configuration](#%EF%B8%8F-configuration) &nbsp;&bull;&nbsp; [Deployment](#-deployment)

<br />

---

</div>

<br />

## Screenshots

| Dashboard | Monitoring | Analytics |
|:---------:|:----------:|:---------:|
| Ticket & device stats at a glance | Real-time alert monitoring | Embedded Metabase dashboards |

<br />

## Highlights

- **Monorepo** — pnpm workspaces with shared TypeScript config
- **Three BI engines** — Grafana, Metabase, and Superset, all embedded via secure tokens
- **Realistic seed data** — 2,500+ tickets across 12 months with weighted distributions, log-normal resolution times, and incident spike weeks
- **JWT auth** — role-based access (admin, technician, viewer)
- **One command setup** — `make up && make seed` gets you a fully populated local environment
- **Docker-native** — all six services orchestrated with health checks, dependency ordering, and restart policies

<br />

## Tech Stack

<table>
<tr>
<td align="center" width="150">

**Frontend**

</td>
<td>

React 19, Redux Toolkit (RTK Query), React Router 7, Tailwind CSS 4, Vite 6

</td>
</tr>
<tr>
<td align="center">

**Backend**

</td>
<td>

Express 4, Sequelize 6, PostgreSQL 16, JWT authentication

</td>
</tr>
<tr>
<td align="center">

**Analytics**

</td>
<td>

Grafana 11.4 (provisioned dashboards), Metabase 0.51 (embed tokens), Apache Superset 4.1 (guest tokens)

</td>
</tr>
<tr>
<td align="center">

**Infra**

</td>
<td>

Docker Compose, Nginx (SPA + reverse proxy), Railway (production)

</td>
</tr>
<tr>
<td align="center">

**Language**

</td>
<td>

TypeScript 5.9 (strict mode, ESM throughout)

</td>
</tr>
</table>

<br />

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | >= 22 |
| [pnpm](https://pnpm.io/) | >= 9 |
| [Docker](https://www.docker.com/) | >= 24 |
| [Docker Compose](https://docs.docker.com/compose/) | >= 2.20 |

### Quick Start (Docker)

```bash
# Clone the repo
git clone https://github.com/pradhankukiran/powerboard.git
cd powerboard

# Copy environment variables
cp .env.example .env

# Start all services
make up

# Seed the database with realistic demo data
make seed
```

That's it. Open [http://localhost:3000](http://localhost:3000) and sign in.

### Quick Start (Local Dev)

```bash
# Install dependencies
pnpm install

# Start Postgres (via Docker)
docker compose up postgres -d

# Run API and Web in parallel
pnpm dev:api   # http://localhost:3001
pnpm dev:web   # http://localhost:5173

# Seed data
pnpm seed
```

### Default Credentials

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **PowerBoard** | [localhost:3000](http://localhost:3000) | `admin@powerboard.local` | `admin123` |
| **Grafana** | [localhost:3002](http://localhost:3002) | `admin` | `admin` |
| **Metabase** | [localhost:3003](http://localhost:3003) | — | Setup on first visit |
| **Superset** | [localhost:8088](http://localhost:8088) | `admin` | `admin` |

<br />

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Nginx :3000 │  SPA + reverse proxy
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │    Express API :3001     │
              │  JWT Auth · REST · ORM  │
              └────┬──────┬──────┬──────┘
                   │      │      │
          ┌────────▼┐ ┌───▼────┐ ┌▼────────┐
          │ Grafana  │ │Metabase│ │ Superset │
          │  :3002   │ │ :3003  │ │  :8088   │
          └────┬─────┘ └───┬────┘ └┬────────┘
               │           │       │
               └───────────▼───────┘
                    ┌──────────┐
                    │PostgreSQL│
                    │  :5432   │
                    └──────────┘
```

### Project Structure

```
powerboard/
├── apps/
│   ├── api/                  # Express + Sequelize backend
│   │   ├── src/
│   │   │   ├── config/       # Database & environment config
│   │   │   ├── middleware/    # Auth & error handling
│   │   │   ├── models/       # Sequelize models (8 entities)
│   │   │   ├── routes/       # REST endpoints
│   │   │   ├── seed/         # Realistic data generators
│   │   │   ├── services/     # Grafana, Metabase, Superset integrations
│   │   │   └── utils/        # JWT & password helpers
│   │   └── Dockerfile
│   └── web/                  # React 19 SPA
│       ├── src/
│       │   ├── app/          # Redux store & RTK Query base
│       │   ├── components/   # Layout (AppShell, Sidebar, EmbedFrame)
│       │   ├── features/     # Feature modules (auth, dashboard, etc.)
│       │   ├── lib/          # Utility functions
│       │   └── styles/       # Tailwind globals
│       └── Dockerfile
├── infra/
│   ├── docker/               # Postgres init scripts
│   ├── grafana/              # Provisioned datasources & dashboards
│   ├── metabase/             # Metabase config
│   ├── railway/              # Railway deployment configs
│   └── superset/             # Superset config
├── docker-compose.yml
├── Makefile
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

<br />

## Data Model

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client   │───<│  Device   │───<│  Alert    │
└─────┬────┘    └─────┬────┘    └──────────┘
      │               │
      │         ┌─────▼────┐    ┌──────────┐
      ├────────<│  Ticket   │───>│   User   │
      │         └──────────┘    └─────┬────┘
      │                               │
      │         ┌──────────┐    ┌─────▼────┐
      ├────────<│ PrintJob  │   │Technician │
      │         └──────────┘    └──────────┘
      │
      │         ┌──────────┐
      └────────<│SLAMetric  │
                └──────────┘
```

| Model | Description | Records (seeded) |
|-------|-------------|:----------------:|
| **Client** | MSP customer organizations | ~15 |
| **Device** | Workstations, servers, printers, firewalls, etc. | ~300 |
| **Ticket** | Support tickets with priority, SLA tracking | ~2,500 |
| **Alert** | Device monitoring alerts (CPU, disk, offline, etc.) | ~1,500 |
| **User** | Portal users with roles (admin, technician, viewer) | ~20 |
| **Technician** | Tech profiles linked to users | ~10 |
| **PrintJob** | Print tracking with page counts and costs | ~800 |
| **SLAMetric** | Daily SLA snapshots per client | ~5,000 |

<br />

## API Reference

All endpoints are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Login, returns JWT token |
| `GET` | `/auth/me` | Get current user profile |

### Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tickets` | List tickets (paginated, filterable) |
| `GET` | `/tickets/stats` | Ticket aggregate stats |
| `POST` | `/tickets` | Create ticket |
| `PATCH` | `/tickets/:id` | Update ticket status/priority |
| `GET` | `/devices` | List devices |
| `GET` | `/devices/stats` | Device stats by type/status |
| `GET` | `/alerts` | List alerts |
| `GET` | `/alerts/stats` | Alert stats by severity/type |
| `PATCH` | `/alerts/:id/acknowledge` | Acknowledge alert |
| `GET` | `/clients` | List clients |
| `GET` | `/technicians` | List technicians |
| `GET` | `/print-jobs` | List print jobs |
| `GET` | `/print-jobs/stats` | Print job stats |
| `GET` | `/sla` | List SLA metrics |
| `GET` | `/sla/summary` | Aggregated SLA summary |

### Embeds

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/embed/grafana-url` | Get Grafana embed URL |
| `POST` | `/embed/metabase-token` | Generate Metabase embed token |
| `POST` | `/embed/superset-token` | Generate Superset guest token |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check (includes DB status) |
| `POST` | `/seed` | Seed database with demo data |
| `POST` | `/seed/reset` | Drop all tables and re-seed |

### Pagination & Filtering

All list endpoints support:

```
GET /api/v1/tickets?page=1&limit=25&status=open&priority=high&clientId=<uuid>
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 25 | Items per page (max: 100) |

<br />

## Configuration

### Environment Variables

<details>
<summary><strong>API Server</strong></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `NODE_ENV` | `development` | Environment mode |
| `DATABASE_URL` | `postgresql://...localhost:5432/powerboard` | Postgres connection string |
| `JWT_SECRET` | `dev-jwt-secret-change-me` | JWT signing secret |
| `GRAFANA_URL` | `http://localhost:3002` | Internal Grafana URL |
| `GRAFANA_PUBLIC_URL` | Same as `GRAFANA_URL` | Public-facing Grafana URL |
| `METABASE_URL` | `http://localhost:3003` | Metabase URL |
| `METABASE_EMBEDDING_SECRET` | — | Metabase embedding secret key |
| `SUPERSET_URL` | `http://localhost:8088` | Superset URL |
| `SUPERSET_ADMIN_USER` | `admin` | Superset admin username |
| `SUPERSET_ADMIN_PASSWORD` | `admin` | Superset admin password |

</details>

<details>
<summary><strong>Web App</strong></summary>

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `""` (uses proxy) | API base URL |
| `VITE_SUPERSET_URL` | `http://localhost:8088` | Superset URL for embeds |
| `VITE_SUPERSET_DASHBOARD_UUID` | `260fa443-...` | Superset dashboard UUID |

</details>

<br />

## Makefile Commands

```bash
make up       # Start all services via Docker Compose
make down     # Stop all services
make logs     # Tail service logs
make ps       # Show running containers
make seed     # Seed the database
make reset    # Drop and re-seed the database
```

<br />

## Deployment

PowerBoard includes Railway deployment configs in `infra/railway/`. Each service has its own `*.railway.json` with health check paths and resource settings.

### Services to deploy:

| Service | Config | Health Check |
|---------|--------|:------------:|
| API | `infra/railway/api.railway.json` | `/api/v1/health` |
| Web | `infra/railway/web.railway.json` | `/` |
| PostgreSQL | Railway managed | Built-in |
| Grafana | Custom Dockerfile | `/api/health` |
| Superset | Custom Dockerfile | `/health` |

<br />

## Development

### Scripts

```bash
# Development servers (hot reload)
pnpm dev:api          # API with tsx watch
pnpm dev:web          # Vite dev server with HMR

# Type checking
pnpm typecheck        # Check both apps

# Build
pnpm build:api        # Compile TypeScript
pnpm build:web        # Vite production build

# Database
pnpm seed             # Seed via CLI
```

### Code Organization

The frontend follows a **feature-based** structure:

```
features/
├── auth/           # Login, auth API, auth state slice
├── dashboard/      # Stats cards, ticket/device/alert/SLA queries
├── monitoring/     # Real-time alert monitoring
├── analytics/      # Metabase embedded dashboards
├── reports/        # Superset embedded dashboards
└── settings/       # User info & service health checks
```

Each feature contains its own RTK Query API slice, components, and types — keeping related code co-located.

<br />

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br />

## License

Distributed under the MIT License. See `LICENSE` for more information.

<br />

---

<div align="center">

Built with **TypeScript**, **React**, **Express**, and a lot of coffee.

<br />

<sub>If you found this useful, consider giving it a star!</sub>

</div>
