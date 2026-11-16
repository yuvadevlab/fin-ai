# FinAI — Cloud Deployment Guide

**Author:** `yuva.devlab@gmail.com`  
**Scope:** Production Deployment & Containerization  
**Stack:** Next.js 15 Web, NestJS 10 API, PostgreSQL 16 (pgvector), Multi-Provider LLM Integration

---

## 1. Architectural Topology

FinAI operates on a modular, decoupled three-tier architecture:

```mermaid
flowchart TD
    Client["User Browser / Client"]
    Web["Frontend: Web Application<br/>Next.js 15 Standalone<br/>(Vercel / Cloud Run / Container)"]
    API["Backend: REST API Service<br/>NestJS 10 Application<br/>(Google Cloud Run / Render / Container)"]
    DB["Database: PostgreSQL 16<br/>pgvector Semantic Storage<br/>(Neon / Supabase / Managed Postgres)"]
    AI["AI Engine: Configured LLM Provider<br/>(Google AI Studio / OpenRouter / Groq / Ollama)"]
    Portal["IAM Authority: DevLab Portal<br/>(SSO & JWKS Token Verification)"]

    Client -->|HTTPS| Web
    Web -->|REST / CORS| API
    API -->|TLS Connection| DB
    API -->|HTTPS / SSE| AI
    API -.->|JWKS / OIDC| Portal
```

---

## 2. Infrastructure Requirements

| Component        | Specification                         | Deployment Targets                          |
| :--------------- | :------------------------------------ | :------------------------------------------ |
| **Frontend Web** | Next.js 15 (Node.js 24 / Standalone)  | Vercel, Google Cloud Run, AWS ECS, Docker   |
| **Backend API**  | NestJS 10 (Node.js 24 / Container)    | Google Cloud Run, Render, Koyeb, Docker     |
| **Database**     | PostgreSQL 16 with `vector` extension | Neon, Supabase, AWS RDS, Managed PostgreSQL |
| **AI Inference** | REST API with streaming support       | Google AI Studio, OpenRouter, Groq, Ollama  |
| **SSO / IAM**    | OIDC-compliant authority              | DevLab Portal or compatible OIDC provider   |

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Database Provisioning & Migrations

1. Provision a PostgreSQL 16 instance on your preferred database provider.
2. Enable the `vector` extension for semantic search and AI embeddings:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Set your connection string in the environment:
   ```bash
   export DATABASE_URL="postgresql://user:password@host:5432/finai?sslmode=require"
   ```
4. Run Prisma database migrations to apply the schema:
   ```bash
   pnpm db:migrate:deploy
   ```

---

### Step 2: Configure AI Provider

FinAI supports multiple LLM providers configured dynamically via environment variables:

```bash
# Provider selection: google-ai-studio | openrouter | groq | ollama
AI_PROVIDER=google-ai-studio

# For Google AI Studio:
GOOGLE_AI_STUDIO_BASE_URL=https://generativelanguage.googleapis.com
GOOGLE_AI_STUDIO_API_PATH=/v1beta/openai/chat/completions
GOOGLE_AI_STUDIO_API_KEY=your_api_key_here
GOOGLE_AI_STUDIO_MODEL=gemini-4-hydrogen

# Alternative: OpenRouter
# AI_PROVIDER=openrouter
# OPENROUTER_API_KEY=your_openrouter_key
# OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct

# Alternative: Groq
# AI_PROVIDER=groq
# GROQ_API_KEY=your_groq_key
# GROQ_MODEL=llama-3.3-70b-versatile
```

---

### Step 3: Deploy Backend API

#### Option A: Container Deployment (Google Cloud Run / Docker)

Build and deploy the backend container using [Dockerfile.api](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/repos/finai/Dockerfile.api):

```bash
# Build container image
docker build -t finai-api -f Dockerfile.api .

# Deploy to Google Cloud Run
gcloud run deploy finai-api \
  --image gcr.io/YOUR_PROJECT_ID/finai-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 4001 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars "\
NODE_ENV=production,\
DATABASE_URL=your-database-url,\
JWT_SECRET=your-random-32char-secret,\
WEB_URL=https://your-frontend-domain.com,\
AI_PROVIDER=google-ai-studio,\
GOOGLE_AI_STUDIO_API_KEY=your-api-key,\
GOOGLE_AI_STUDIO_MODEL=gemini-4-hydrogen"
```

#### Option B: Deploy via Render Blueprint

Deploy directly using the [render.yaml](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/repos/finai/render.yaml) specification in the repository root.

---

### Step 4: Deploy Frontend Web

#### Option A: Vercel Monorepo Deployment

1. Import the repository into Vercel.
2. The project automatically uses [apps/web/vercel.json](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/repos/finai/apps/web/vercel.json):
   - **Framework Preset**: `Next.js`
   - **Build Command**: `pnpm --filter @finai/web... build`
   - **Install Command**: `pnpm install`
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Backend API base URL
   - `NEXT_PUBLIC_DEVLAB_PORTAL_WEB_URL`: Portal Web URL for SSO login
   - `NEXT_PUBLIC_DEVLAB_PORTAL_API_URL`: Portal API URL
   - `NEXT_PUBLIC_APP_ID`: `finai`

#### Option B: Standalone Container Deployment

Build and run using [Dockerfile.web](file:///Users/yuvarajpattabi/Yuva/yuva-devlab/repos/finai/Dockerfile.web):

```bash
docker build -t finai-web -f Dockerfile.web .
docker run -p 3001:3001 -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com finai-web
```

---

### Step 5: Verification & Health Probes

Verify deployment health across services:

1. **API Readiness Probe**:

   ```bash
   curl -I https://api.yourdomain.com/health
   # Expected: HTTP 200 OK
   ```

2. **API Info & Health Status**:

   ```bash
   curl https://api.yourdomain.com/api/v1/health
   # Returns status: "ok", timestamp, and service version
   ```

3. **Frontend Health Probe**:
   ```bash
   curl -I https://web.yourdomain.com/api/health
   # Expected: HTTP 200 OK
   ```

---

## 4. Local Production Simulation

To run and validate the complete containerized stack locally before deploying:

```bash
# Boot complete production stack (PostgreSQL + API + Web)
docker compose -f docker-compose.prod.yml up --build -d

# Check service logs
docker compose -f docker-compose.prod.yml logs -f api
```
