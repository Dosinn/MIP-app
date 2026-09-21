# 🚀 MIP — Metódy Inžinierskej Práce

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FIIT STU](https://img.shields.io/badge/FIIT_STU-Bratislava-E31E24)](https://www.fiit.stuba.sk/)

> **A full-stack collaborative platform with real-time NLP semantic analysis and interactive 2D idea mapping**, built specifically for 1st-year engineering students in the **"Metódy inžinierskej práce" (MIP)** course at **FIIT STU Bratislava**.

---

## 💡 The Problem & Solution

Every academic year, first-year students at FIIT STU must ideate, propose, and deliver team projects. They routinely encounter three major bottlenecks:
- **Idea Duplication:** Proposing projects that closely repeat past years' work without knowing it.
- **Unclear Problem Formulation:** Submitting concepts with weak problem-solution alignment, vague target audiences, or missing novelty.
- **Scattered Communication:** Managing team formation, file exchanges, and teacher reviews across disorganized chats and emails.

**MIP** provides a unified academic hub:
1. **Interactive Idea Map:** A 2D semantic space visualising all approved projects using dimensionality reduction (MDS/SMACOF), helping students explore clusters and find unoccupied niches.
2. **AI Quality Scoring:** Real-time analysis powered by a fine-tuned Slovak transformer (`SlovakBERT`), scoring problem clarity, solution fit, and novelty before professor submission.
3. **Structured Review Workflow:** Role-based access for students and faculty, including Google OAuth (`@stuba.sk`), team invites, inline feedback, and project status tracking.

---

## 🏛️ High-Level Architecture

The platform runs as a containerized microservice suite unified behind an Nginx reverse proxy:

```
                            [ Web & Mobile Clients ]
                                       │
                                       ▼ HTTPS
                           ┌───────────────────────┐
                           │   Nginx Ingress / GW  │
                           └───────────┬───────────┘
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       ▼                               ▼                               ▼
┌───────────────┐              ┌───────────────┐              ┌────────────────┐
│   React PWA   │              │ FastAPI (AI)  │              │  Spring Boot   │
│  (TypeScript) │              │   (Python)    │              │    (Java)      │
├───────────────┤              ├───────────────┤              ├────────────────┤
│ • D3.js Map   │              │ • SlovakBERT  │              │ • Core REST API│
│ • PWA Offline │              │ • MDS/SMACOF  │              │ • Auth & OAuth2│
│ • State/Query │              │ • Text NLP    │              │ • Team Reviews │
└───────────────┘              └───────┬───────┘              └────────┬───────┘
                                       │                               │
                                       └───────────────┬───────────────┘
                                                       ▼
                                            ┌────────────────────┐
                                            │    PostgreSQL 16   │
                                            │  (Shared Database) │
                                            └────────────────────┘
```

---

## 🌟 Key Technical Features

### 🧠 Semantic AI Engine & Real-Time Scoring
- **Transformer NLP:** Employs `kinit/slovakbert-sts-stsb` via `SentenceTransformers` to generate semantic embeddings for Slovak academic text.
- **Multi-Vector Scoring:** Evaluates project descriptions across four automated metrics:
  - *Problem Cohesion:* Structural clarity and lexical depth of the problem statement.
  - *Audience Clarity:* Specificity of target users and stakeholders.
  - *Problem–Solution Alignment:* Cosine semantic closeness between problem formulation and proposed implementation.
  - *Novelty Indicator:* Contrastive marker detection against historical project submissions.

### 🗺️ Dynamic 2D Idea Map (D3.js + MDS)
- Projects high-dimensional embedding vectors into continuous 2D coordinates using **Classical Multidimensional Scaling (MDS)** combined with iterative **SMACOF** optimization.
- Rendered via **D3.js** with zoom, pan, category clustering, and interactive inspection to visualize topical distance between projects.

### 👥 Academic Workflow & Institutional Auth
- **Single Sign-On:** Google OAuth 2.0 restricted to `@stuba.sk` university accounts, generating stateless JWT sessions.
- **Role-Based Workflows:** Distinct interfaces and permissions for `student` (teams, creation wizard), `teacher` (review queues, revisions, approvals), and `admin` (year archives, user management).
- **Mobile-First PWA:** Full standalone experience for iOS and Android with offline asset caching, custom in-app document viewer, and responsive layouts.

---

## 🧰 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, D3.js, TanStack Query v5, Vanilla CSS, VitePWA
- **AI & NLP Service:** Python 3.11, FastAPI, Sentence-Transformers, SlovakBERT, Scikit-learn, SQLAlchemy/SQLModel (Async)
- **Core Backend:** Java 21, Spring Boot 3, Spring Security, Spring Data JPA, Hibernate, JWT
- **Data & DevOps:** PostgreSQL 16, Nginx, Docker & Docker Compose, Ubuntu Linux

---

## 👥 Authors & Contributions

- **[Andrii Dosyn](https://github.com/Dosinn)** — *Lead Architect, Full-Stack & ML Developer*
  - System architecture, microservice orchestration & university server deployment.
  - React 19 PWA client, responsive UI/UX & interactive D3.js Idea Map.
  - Python / FastAPI AI engine (SlovakBERT integration, MDS/SMACOF semantic mapping, text heuristics).
  - Spring Boot core service architecture, security configurations, and API integration.

- **[Anton Hrimov](https://github.com/AntonHrimov)** — *Backend Developer*
  - Co-development of the Spring Boot 3 REST API, database schema, and entity relationships.
  - Implementation of core domain services, endpoints, and business logic.
  - Testing and maintenance of backend functionality.

---

## 🎓 Academic Context

Developed for the **Metódy inžinierskej práce (MIP)** course at the **Faculty of Informatics and Information Technologies, Slovak University of Technology in Bratislava (FIIT STU)**.
