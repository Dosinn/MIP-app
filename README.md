# MIP — Managing Innovative Projects

A full-stack Progressive Web App (PWA) for university project management, AI-powered originality checking, and NLP-based idea analysis. Designed for students, teachers, and admins at STU Bratislava.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
  - [Frontend — React PWA](#frontend--react-pwa)
  - [Spring Boot — Main API](#spring-boot--main-api)
  - [FastAPI — AI / NLP Service](#fastapi--ai--nlp-service)
  - [PostgreSQL](#postgresql)
  - [Nginx — Reverse Proxy](#nginx--reverse-proxy)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running Locally (Docker Compose)](#running-locally-docker-compose)
- [Development (without Docker)](#development-without-docker)
- [Deployment Notes](#deployment-notes)
- [Data Model Highlights](#data-model-highlights)

---

## Overview

MIP is a course project management platform where:

- **Students** form teams, submit projects through a guided AI-assisted creation flow, and receive teacher feedback.
- **Teachers** review, approve, or return student projects with written comments.
- **Admins** manage users, archive school years, and oversee the full platform.

A central AI layer (FastAPI) analyses each project for:
- **Problem cohesion** — how well-defined the problem statement is.
- **Target audience clarity** — precision of the described audience.
- **Problem–solution alignment** — semantic match between problem and proposed solution.
- **Uniqueness** — contrastive marker detection.
- **Category suggestion** — automatic tagging by domain.
- **Similarity & Idea Map** — cosine similarity across all approved projects, visualised as an interactive 2D map using MDS (SMACOF).

---

## Architecture

```
Browser / iOS PWA
       |
       v
 ┌─────────────┐
 │  Nginx :80  │  <- Reverse proxy + static file server
 └──────┬──────┘
        |
        ├── /auth, /projects, /files, /teams ...  --► Spring Boot :8080
        |
        ├── /nlp, /similarity, /project ...        --► FastAPI    :8000
        |
        └── /*  (everything else)                  --► React PWA  (static)
```

All four services run inside Docker containers orchestrated by `docker-compose.yml`.
A single named Docker volume (`mip_once_storage`) is shared between Spring (uploaded files) and FastAPI (Hugging Face model cache).

---

## Services

### Frontend — React PWA

| Item | Detail |
|------|--------|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| State | TanStack Query v5 (server state) |
| i18n | react-i18next (Slovak / English) |
| Auth | JWT stored in `localStorage`; Google OAuth via `@react-oauth/google` |
| PWA | `vite-plugin-pwa` — service worker, offline support, install prompt |
| Styling | Vanilla CSS (CSS variables, dark/light theme via `ThemeContext`) |

**Entry point:** `FrontEnd/src/main.tsx`
**Router:** `FrontEnd/src/App.tsx`

#### Page Map

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login / Google OAuth | Public |
| `/` | Role redirect (→ `/search` or `/teacher`) | All |
| `/search` | Project library with search & filter | All |
| `/saved` | Saved/bookmarked projects | All |
| `/archived` | Archived projects | All |
| `/map` | Interactive 2D idea similarity map | All |
| `/account` | User account settings | All |
| `/project/:id` | Project detail view | All |
| `/create-project` | Multi-step AI-guided project creation | Student, Admin |
| `/project/:id/manage` | Edit, upload files, trigger embeddings | Student, Admin |
| `/teacher` | Teacher dashboard — pending reviews | Teacher, Admin |
| `/teacher/students` | Student list | Teacher, Admin |
| `/teacher/review/:id` | Review a single project | Teacher, Admin |
| `/admin` | Admin panel | Admin |
| `/file-preview` | In-app file/PDF viewer | All (protected) |

---

### Spring Boot — Main API

| Item | Detail |
|------|--------|
| Language | Java 21 |
| Framework | Spring Boot 3 + Spring Security |
| Auth | Stateless JWT (`JwtAuthFilter`) + Google ID token verification |
| DB access | Spring Data JPA / Hibernate |
| File upload | Multipart, stored to `/storage/uploads` (max 50 MB) |
| CORS | Configured in `SecurityConfig.java` — localhost only; in production Nginx handles routing |

**Key packages:**

| Package | Responsibility |
|---------|---------------|
| `Auth` | Login, Google OAuth, JWT issue |
| `Project` | CRUD, library queries, archive, rate |
| `ProjectReview` | Review lifecycle (`PENDING → APPROVED / RETURNED_BY_TEACHER`) |
| `Team` / `TeamInvite` | Team formation & invite system |
| `FileAttachment` | Upload, download, view file endpoints |
| `Lesson` | Lesson management (teacher's classes) |
| `Notification` | In-app notifications |
| `Category` | Project domain categories |
| `User` | User profile, role management |
| `util` | `SecurityConfig`, `JwtAuthFilter`, `JwtService` |

---

### FastAPI — AI / NLP Service

| Item | Detail |
|------|--------|
| Language | Python 3.11 |
| Framework | FastAPI + Uvicorn |
| DB access | SQLModel (async SQLAlchemy) via `asyncpg` |
| ML model | `kinit/slovakbert-sts-stsb` (Slovak SentenceBERT, loaded once at startup) |
| Embedding layout | Classical MDS (initial positions) + SMACOF (iterative refinement) |

**Startup sequence** (`FastApi/init/lifespan.py`):
1. Load `SentenceTransformer` model.
2. Pre-compute NLP anchors (`NicheAnchorStore`, `CategoryStore`).
3. Load embeddings for all **APPROVED** projects from DB into `EmbeddingStore`.
4. Compute 2D positions (MDS → SMACOF).

**Routers:**

| Prefix | File | Purpose |
|--------|------|---------|
| `/project` | `project/routes.py` | Compute/update embeddings per project |
| `/similarity` | `similarity/routes.py` | Find similar projects, return 2D map positions |
| `/nlp` | `nlp/routes.py` | Analyse problem, audience, alignment, categories |

> **Important:** Embeddings are only computed and stored for projects with `APPROVED` status
> in `project_reviews`. Non-approved projects are excluded from the similarity map at both
> load time (`store.py`) and when triggered via the API (`services.py`).

**Utility script:** `FastApi/model/calculate.py` — a one-off async script to backfill embeddings
for projects that are missing them. Run directly with `python model/calculate.py` from the `FastApi/` directory.

---

### PostgreSQL

- Image: `postgres:16-alpine`
- Database: `university_db`
- Credentials configured via environment variables (see below)
- Data persisted in the `mip_postgres_data` Docker volume

---

### Nginx — Reverse Proxy

Configuration: `docker/nginx.conf`

- Serves the compiled React PWA as static files from `/var/www/html`.
- Routes `/nlp/*`, `/similarity/*`, `/project/*` → FastAPI `:8000`.
- Routes all other API paths → Spring Boot `:8080`.
- `/up` endpoint for health checks.
- Long-lived cache headers for immutable static assets (CSS/JS/fonts/images).

---

## Key Features

- 🔐 **Google OAuth + JWT** — seamless institutional login (`@stuba.sk` domain enforced by default).
- 🤖 **AI-assisted project creation** — real-time NLP scores guide students while writing.
- 🗺️ **Idea Map** — interactive 2D scatter plot of all approved projects, positioned by semantic similarity using SMACOF MDS.
- 📄 **In-app file preview** — PDF and document preview inside the PWA (no navigation loss), with pinch-to-zoom re-enabled only on the preview screen.
- 📲 **PWA Gatekeeper** — install wall with iOS step-by-step instructions; bypass allowed for desktop reviewers.
- 🌍 **i18n** — Slovak and English, switchable at runtime.
- 🌙 **Dark / Light theme** — persisted to `localStorage`.
- 🔔 **Notifications** — in-app notification bell with unread count.
- 🏫 **Role-based access** — `student`, `teacher`, `admin` roles with route-level guards.

---

## Project Structure

```
front-pwa/
├── docker-compose.yml          # Orchestrates all 4 services
├── Dockerfile.frontend         # Builds & serves the React PWA via Nginx
├── Dockerfile.spring           # Builds the Spring Boot JAR
├── Dockerfile.fastapi          # Builds the FastAPI NLP service
├── Dockerfile                  # Legacy single-container build (ONCE deployment)
├── docker/
│   └── nginx.conf              # Nginx reverse proxy config
│
├── FrontEnd/                   # React 18 + Vite PWA
│   ├── src/
│   │   ├── api/                # Axios clients, repositories, query keys
│   │   ├── components/         # Shared UI components
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── hooks/              # TanStack Query hooks
│   │   ├── pages/              # One folder per route
│   │   ├── locales/            # i18n translation files
│   │   └── utils/
│   └── package.json
│
├── Spring/                     # Spring Boot 3 REST API
│   └── src/main/java/com/projekty/projekty/
│       ├── Auth/
│       ├── Project/
│       ├── ProjectReview/
│       ├── Team/ & TeamInvite/
│       ├── FileAttachment/
│       ├── Lesson/
│       ├── Notification/
│       ├── Category/
│       ├── User/
│       └── util/               # Security, JWT
│
└── FastApi/                    # Python FastAPI NLP + Similarity service
    ├── main.py
    ├── config.py
    ├── requirements.txt
    ├── init/                   # DB session, lifespan startup
    ├── project/                # Embedding compute routes
    ├── similarity/             # Similarity search + MDS map
    ├── nlp/                    # Text analysis endpoints
    └── model/                  # Utility scripts (calculate.py backfill)
```

---

## Environment Variables

### Docker Compose / Production

| Variable | Service | Default | Description |
|----------|---------|---------|-------------|
| `JWT_SECRET` | Spring | `change-me-in-production-...` | ⚠️ Change in production |
| `GOOGLE_CLIENT_ID` | Spring / Frontend | (STU project ID) | Google OAuth client |
| `ALLOWED_DOMAINS` | Spring | `@stuba.sk,gmail.com` | Comma-separated allowed email domains |
| `DATABASE_URL` | FastAPI | `postgresql+asyncpg://postgres:postgres@db:5432/university_db` | |
| `MODEL_NAME` | FastAPI | `kinit/slovakbert-sts-stsb` | HuggingFace model slug |
| `SIMILARITY_K` | FastAPI | `5` | Number of similar results to return |
| `SIMILARITY_THRESHOLD` | FastAPI | `0.48` | Minimum cosine similarity |
| `TITLE_WEIGHT` | FastAPI | `0.3` | Weight for title embedding |
| `DESC_WEIGHT` | FastAPI | `0.7` | Weight for description embedding |
| `CORS_ORIGINS` | FastAPI | `` | Extra comma-separated origins (e.g. for tunnels) |

### Frontend (`.env` / Vite)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Spring Boot base URL (empty = same origin in prod) |
| `VITE_FASTAPI_URL` | FastAPI base URL (empty = same origin in prod) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

> In production all services are on the same origin (Nginx routes internally), so
> `VITE_API_URL` and `VITE_FASTAPI_URL` should be left empty.

---

## Running Locally (Docker Compose)

```bash
# 1. Clone the repo
git clone <repo-url>
cd front-pwa

# 2. (Optional) Create a .env file for secrets
echo "JWT_SECRET=my-local-dev-secret-at-least-32-characters" > .env

# 3. Start everything
docker compose up --build

# 4. Open the app
open http://localhost
```

The first startup will:
- Download and cache the `kinit/slovakbert-sts-stsb` model (~500 MB) to the `mip_once_storage` volume.
- Run Spring Boot Hibernate auto-DDL to create all tables.

Subsequent restarts reuse the cached model — startup is fast.

---

## Development (without Docker)

### Frontend

```bash
cd FrontEnd
npm install
npm run dev          # Vite dev server -> http://localhost:5173
```

Set `VITE_API_URL=http://localhost:8080` and `VITE_FASTAPI_URL=http://localhost:8000` in `FrontEnd/.env.local`.

### FastAPI

```bash
cd FastApi
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Requires a running PostgreSQL instance and `DATABASE_URL` set appropriately.

### Spring Boot

```bash
cd Spring
./mvnw spring-boot:run
```

Requires a running PostgreSQL instance. Configure `application.properties` or set `SPRING_DATASOURCE_URL`.

---

## Deployment Notes

- The project was originally designed for **Basecamp ONCE**-compatible single-container deployment (`Dockerfile`). The current recommended setup is the **multi-container `docker-compose.yml`** with separate Dockerfiles per service.
- **File uploads** and the **HuggingFace model cache** are stored in the `mip_once_storage` volume. Back this up before upgrading.
- **Postgres data** is stored in the `mip_postgres_data` volume.
- `spring.jpa.hibernate.ddl-auto=update` is set — safe for development; consider switching to `validate` for production after the initial schema is stable.
- `logging.level.org.springframework.security=DEBUG` in `application.properties` should be changed to `INFO` in production to avoid verbose log output.

---

## Data Model Highlights

```
User --< TeamMembership >-- Team --< Project
                                       |
                                       +-- ProjectReview  (PENDING | APPROVED | RETURNED_BY_TEACHER)
                                       +-- FileAttachment
                                       +-- Category
                                       +-- ProjectSection
                                       +-- ProjectHistory

Project (title_emb, desc_emb)  <-- computed by FastAPI, stored as float[] in Postgres
```

A `Project` only participates in similarity search and the idea map when its `ProjectReview.status == APPROVED`.
