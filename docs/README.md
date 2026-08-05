# Workoutly Documentation

Workoutly is a MERN workout tracker for creating reusable workout routines, completing manual training sessions, and reviewing history, goals, progress, and personal records. The current repository contains a React/Vite client, an Express/MongoDB API, Cloudinary-backed image upload, Docker configuration, Vercel SPA routing, seed scripts, and Jest/Supertest tests.

This documentation is intended for developers, contributors, reviewers, interview preparation, and AI coding assistants. It summarizes the repository as inspected on August 5, 2026. Implementation remains the source of truth if this documentation becomes outdated.

## Verified Repository State

| Item | Value |
| --- | --- |
| Branch | `main`, read from `.git/HEAD` without running Git commands |
| Commit | `9bc3628601349a0a59e475ad40b8e2525204f90c`, read from `.git/refs/heads/main` without running Git commands |
| Verification date | August 5, 2026 |
| Runtime verification | Not performed for this documentation task |

## Documentation Map

| Category | Document | Purpose |
| --- | --- | --- |
| Product | [PRD](product/PRD.md) | Product goals, users, workflows, requirements, routes, limitations, and future scope |
| Product | [Feature Status](product/FEATURE_STATUS.md) | Repository-backed feature inventory and implementation status |
| Product | [Roadmap](product/ROADMAP.md) | Stabilization and future work based on gaps found in code |
| Architecture | [High-Level Design](architecture/HLD.md) | System overview, modules, data flows, deployment, security, and tradeoffs |
| Architecture | [Low-Level Design](architecture/LLD.md) | Frontend and backend implementation-level route, component, state, middleware, validation, and error-handling details |
| Architecture | [Database Design](architecture/DATABASE_DESIGN.md) | Mongoose models, relationships, indexes, lifecycle, seed data, and risks |
| Architecture | [API Reference](architecture/API_REFERENCE.md) | Every implemented backend endpoint with auth, payload, responses, and consumers |
| Architecture | [Architecture Decisions](architecture/ARCHITECTURE_DECISIONS.md) | ADR-style record of verified or inferred technical decisions |
| Engineering | [Security](engineering/SECURITY.md) | Trust boundaries, protections, risks, and recommended security improvements |
| Engineering | [Testing Strategy](engineering/TESTING_STRATEGY.md) | Current tests, gaps, and future testing matrix |
| Engineering | [Deployment and Operations](engineering/DEPLOYMENT_AND_OPERATIONS.md) | Local, Docker, Vercel/Nginx, env vars, checks, and failure diagnosis |
| Engineering | [Contributing Guide](engineering/CONTRIBUTING_GUIDE.md) | Setup, workflows, conventions, manual testing, and PR checklist |
| Interview | [Project Interview Guide](interview/PROJECT_INTERVIEW_GUIDE.md) | Demo script, project explanations, file walkthroughs, and honest answers |
| Interview | [Project Score Preparation](interview/PROJECT_SCORE_PREPARATION.md) | Assessment evidence matrix and readiness checklist |
| Interview | [Technical Questions](interview/TECHNICAL_QUESTIONS.md) | Repository-specific Q&A for frontend, backend, database, security, and deployment |
| Interview | [Project Simulations](interview/PROJECT_SIMULATIONS.md) | Practical interview exercises tied to Workoutly files |
| Interview | [Revision Notes](interview/REVISION_NOTES.md) | Compact pre-interview revision sheet |

Existing support docs remain available:

- [Demo Seeding](DEMO_SEEDING.md)
- [Deployment Variables](DEPLOYMENT_VARS.md)
- [Postman Guide](POSTMAN_GUIDE.md)
- [Workoutly API Postman Collection](Workoutly-API.postman_collection.json)
- [Local Postman Environment](Local-Development.postman_environment.json)

## Recommended Reading Order

For new developers: start with this index, then [HLD](architecture/HLD.md), [Contributing Guide](engineering/CONTRIBUTING_GUIDE.md), [Low-Level Design](architecture/LLD.md), [API Reference](architecture/API_REFERENCE.md), and [Database Design](architecture/DATABASE_DESIGN.md).

For project reviewers: read [PRD](product/PRD.md), [Feature Status](product/FEATURE_STATUS.md), [HLD](architecture/HLD.md), [Security](engineering/SECURITY.md), [Testing Strategy](engineering/TESTING_STRATEGY.md), and [Deployment and Operations](engineering/DEPLOYMENT_AND_OPERATIONS.md).

For interview preparation: read [Project Interview Guide](interview/PROJECT_INTERVIEW_GUIDE.md), [Project Score Preparation](interview/PROJECT_SCORE_PREPARATION.md), [Technical Questions](interview/TECHNICAL_QUESTIONS.md), [Project Simulations](interview/PROJECT_SIMULATIONS.md), and [Revision Notes](interview/REVISION_NOTES.md).

For product understanding: read [PRD](product/PRD.md), [Feature Status](product/FEATURE_STATUS.md), and [Roadmap](product/ROADMAP.md).

## Documentation Status

| Area | Status | Notes |
| --- | --- | --- |
| Product requirements | Repository-backed | Uses actual routes, pages, models, and UI behavior |
| Feature status | Repository-backed | Deployment status is not verified beyond configuration files |
| Architecture | Repository-backed with labelled inferences | Rationale is marked inferred where no ADR existed |
| API reference | Repository-backed | Runtime responses were not executed during this task |
| Security | Repository-backed review | Not a penetration test |
| Testing | Repository-backed | Test commands were not run during this task |
| Deployment | Configuration-backed | External dashboards and production URLs were not inspected |
| Interview docs | Repository-backed | Avoids claims not supported by code |
