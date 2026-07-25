# FinAI — Enterprise Server Deployment & Database Administration Guide

This document defines the production deployment topology, container orchestration, reverse proxy configuration, and database administration standards for hosting **FinAI** on target server path `D:\server\repos\fin-ai`.

---

## 🏗️ Production Architecture Map

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION HOST SERVER                              │
│                      Target Path: D:\server\repos\fin-ai                    │
│                                                                             │
│  ┌────────────────────────────────┐    ┌─────────────────────────────────┐  │
│  │    Nginx Proxy Manager         │    │   Database Management Clients   │  │
│  │   (Reverse Proxy & SSL Layer)  │    │     (DBeaver / DataGrip / CLI)  │  │
│  └───────────────┬────────────────┘    └────────────────┬────────────────┘  │
│                  │                                      │                   │
│  ┌───────────────┴──────────────────────────────────────┴────────────────┐  │
│  │                       DOCKER CONTAINER NETWORK                        │  │
│  │                                                                       │  │
│  │   ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐   │  │
│  │   │ fin-ai-web       │  │ fin-ai-api       │  │ fin-ai-postgres   │   │  │
│  │   │ (Next.js 15 App) │  │ (NestJS 10 API)  │  │ (PostgreSQL 17)   │   │  │
│  │   │ Port: 3000       │  │ Port: 4000       │  │ Port: 5432        │   │  │
│  │   └──────────────────┘  └──────────────────┘  └─────────┬─────────┘   │  │
│  └─────────────────────────────────────────────────────────┼─────────────┘  │
│                                                            │                │
│                                              ┌─────────────┴─────────────┐  │
│                                              │ Persistent Storage Mount  │  │
│                                              │ ./docker-data/postgres    │  │
│                                              └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Quickstart & Server Provisioning

### Step 1: Environment Preparation

Navigate to your production deployment directory:

```powershell
# Navigate to production target path
D:
cd D:\server\repos\fin-ai

# Initialize environment configuration from template
copy .env.example .env
```

Review environment keys in `.env`:

- `POSTGRES_USER`: Service database administrator
- `POSTGRES_PASSWORD`: Production database password
- `POSTGRES_DB`: Core application database name (`finai_db`)
- `JWT_SECRET`: API JWT authentication secret key
- `OLLAMA_BASE_URL`: AI Advisor LLM endpoint (`http://host.docker.internal:11434`)

### Step 2: Container Deployment & Orchestration

Deploy the microservices stack using Docker Compose:

```powershell
# Build and launch containers in detached mode
docker compose up -d --build

# Verify container health status
docker compose ps
```

### Step 3: Schema Migrations & Data Initialization

Execute Prisma ORM database migrations and initial seed scripts:

```powershell
# Apply database schema migrations
docker exec -it fin-ai-api npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma

# Seed initial system categories and default workspace assets
docker exec -it fin-ai-api npx prisma db seed --schema=packages/database/prisma/schema.prisma
```

---

## 2. Reverse Proxy & SSL Termination (Nginx Proxy Manager)

FinAI is designed to integrate seamlessly behind an existing Nginx / Nginx Proxy Manager edge gateway.

### Proxy Host Configuration Settings

In your Nginx Proxy Manager Admin Console:

#### Primary Domain Proxy (`fin-ai-web`)

- **Domain Name**: `finai.domain.com` (or internal domain `finai.local`)
- **Forward Scheme**: `http`
- **Forward Host / IP**: `host.docker.internal` (or host IP `192.168.x.x`)
- **Forward Port**: `3000`
- **Block Common Exploits**: Enabled
- **Websockets Support**: Enabled (Required for SSE & streaming AI advisor features)

#### API Route Location Rule (`/api`)

Under **Custom Locations** for the domain proxy host:

- **Location Path**: `/api/`
- **Forward Scheme**: `http`
- **Forward Host / IP**: `host.docker.internal` (or host IP)
- **Forward Port**: `4000`

---

## 3. Database Administration & Remote Access (DBeaver / DataGrip)

PostgreSQL is exposed on standard port `5432` for DBA inspection, schema debugging, and reporting via database administration clients like DBeaver, DataGrip, or `psql`.

### Database Connection Parameters

- **Database Engine**: PostgreSQL 17
- **Host / Address**: `localhost` (Local Server) or Server IP (LAN Remote DBA Access)
- **Port**: `5432`
- **Database Name**: `finai_db`
- **Username**: `finai_admin`
- **Password**: Configured in `.env` (`POSTGRES_PASSWORD`)

---

## 4. Data Backup & Recovery Operations

FinAI enforces dual-layer data persistence combining Docker named volumes (`fin-ai-postgres-data`) and persistent host bind mounts (`./docker-data/postgres`).

### Logical Backup (`pg_dump`)

Perform automated, timestamped database snapshot dumps:

```powershell
# Navigate to repository root
cd D:\server\repos\fin-ai

# Create backup directory
mkdir -Force D:\server\repos\fin-ai\backups

# Generate logical database backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
docker exec -t fin-ai-postgres pg_dump -U finai_admin -d finai_db > "D:\server\repos\fin-ai\backups\finai_backup_$timestamp.sql"
```

### Database Disaster Recovery

To restore a snapshot dump into PostgreSQL:

```powershell
Get-Content "D:\server\repos\fin-ai\backups\finai_backup_YYYYMMDD_HHMMSS.sql" | docker exec -i fin-ai-postgres psql -U finai_admin -d finai_db
```

---

## 5. Operations & Maintenance

```powershell
# Inspect container health and service logs
docker compose ps
docker compose logs -f api
docker compose logs -f web

# Restart application services
docker compose restart

# Graceful service shutdown
docker compose stop
```
