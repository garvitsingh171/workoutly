# Project Score Preparation

This document maps Workoutly to common project-assessment areas. It does not assume an external numeric rubric.

## Evidence Matrix

| Assessment area | Workoutly evidence | Relevant files | Current strength | Gap | Preparation action |
| --- | --- | --- | --- | --- | --- |
| Problem understanding | Structured routine/session/history product | `PRD.md`, pages | Clear user workflow | No user research artifacts | Explain realistic personal tracking problem |
| User workflows | Register -> routine -> session -> history | `App.jsx`, pages | End-to-end flow | Runtime not verified here | Demo with seeded data |
| UI consistency | Shared UI components and CSS tokens | `components/ui`, CSS | Cohesive design | Some marketing text/demo placeholders | Explain design system |
| Responsive design | Breakpoints and grid collapse | `App.css` | Many responsive rules | Not screenshot-verified | Test mobile manually |
| Accessibility | Labels, focus, aria live | components/pages | Partial implementation | No audit | Prepare honest gap |
| React architecture | Routes, contexts, reusable builder | `App.jsx`, contexts, builder | Strong | Server-state cache absent | Explain Context choice |
| API integration | Axios interceptors | `api.js` | Auth/refresh centralized | No React Query | Explain request lifecycle |
| Backend routing | Domain route groups | `server/app.js`, routes | Clear grouping | Mixed service boundaries | Explain pattern and gap |
| Middleware | auth, CORS, upload, rate limit, errors | middleware/config | Good core middleware | No Helmet | Explain order |
| Authentication | JWT/bcrypt/refresh cookie | auth files | Good portfolio auth | localStorage risk | Prepare security tradeoff |
| Authorization | Ownership checks | services/controllers/tests | Strong | Future routes need tests | Walk through cross-user test |
| Database modeling | Six Mongoose models | models | Clear ownership model | Missing some indexes | Draw ER diagram |
| Error handling | AppError and errorHandler | `errorHandler.js` | Consistent response | Upload route local format similar but separate | Explain format |
| Security | Multiple protections | `SECURITY.md` | Honest review | Not production hardened | Avoid "fully secure" |
| Testing | Broad backend tests | `server/tests/auth.test.js` | Strong API coverage | Limited frontend/no E2E | Know test names |
| Deployment | Docker, Vercel, env examples | Dockerfiles, compose, vercel | Config present | External status unknown | Explain config not deployment proof |
| Performance | Pagination and limit caps | services/controllers | Some protections | Summary scans all sessions | Recommend indexes |
| Documentation | Full docs tree | `docs/` | Strong after this task | Needs future updates | Use docs as study guide |
| Tradeoffs | ADRs | `ARCHITECTURE_DECISIONS.md` | Honest decisions | Rationale mostly inferred | Label inference |

## What Evaluators May Ask

For each area, be ready to answer:

1. What does Workoutly demonstrate?
2. Which files prove it?
3. What is implemented versus planned?
4. What would you improve first?
5. What should you not claim?

Do not claim production deployment, OAuth, reminders, offline support, admin roles, nutrition tracking, social features, per-exercise images, or complete accessibility unless you add and verify them later.

## Mandatory Concepts Revision Checklist

Frontend:

- React components, props, state, effects, memoization.
- React Router protected/public route patterns.
- Context API tradeoffs.
- Controlled forms and validation.
- Axios interceptors and error handling.
- CSS variables, breakpoints, accessibility labels.

Backend:

- Express middleware order.
- Route/controller/service/model separation.
- JWT verification and bcrypt hashing.
- `express-validator` and manual validation.
- Centralized error handling.
- File upload with multer and Cloudinary.

Database:

- Mongoose schemas, refs, embedded arrays.
- Unique indexes and partial indexes.
- Ownership fields.
- Query patterns and index recommendations.
- Transactions and consistency risks.

Security:

- XSS/localStorage risk.
- CORS and cookies.
- Rate limiting.
- Upload security.
- Secret management.
- Authorization tests.

Deployment:

- Vite dev proxy.
- Docker Compose network hostname.
- Nginx SPA fallback.
- Vercel rewrite.
- Env variables.
- Health check.

Git:

- Explain branch/commit only if verified.
- Discuss meaningful commit hygiene if asked, but do not invent history.

Testing:

- Supertest integration tests.
- Testing Library component tests.
- Difference between unit, integration, E2E, smoke, accessibility tests.

Product:

- Target users, non-goals, limitations, roadmap.

## Project-Defense Checklist

- Explain project without notes.
- Draw React -> Express -> MongoDB -> Cloudinary architecture.
- Explain login and protected request flow.
- Explain routine creation flow.
- Explain session save and record update flow.
- Explain one model in detail.
- Explain authorization and ownership.
- Explain one difficult decision and tradeoff.
- Explain one limitation honestly.
- Debug one API failure from network tab to backend route.
- Modify one small feature in simulation.
- Explain deployment env variables.

## Readiness Rating

| Area | Ready | Partially ready | Not ready | Evidence |
| --- | --- | --- | --- | --- |
| Product explanation | Yes |  |  | PRD and implemented workflows |
| Frontend architecture | Yes |  |  | Routes, contexts, builder |
| Backend architecture | Yes |  |  | Express route groups and tests |
| Database design | Yes |  |  | Mongoose models and ER docs |
| Security defense |  | Yes |  | Good basics, known hardening gaps |
| Testing defense |  | Yes |  | Broad backend, narrow frontend |
| Deployment defense |  | Yes |  | Config exists, deployment status unverified |
| Accessibility defense |  | Yes |  | Partial implementation, no audit |
| Advanced scalability |  | Yes |  | Can discuss recommendations |
| OAuth/reminders/offline |  |  | Yes | Not implemented |

