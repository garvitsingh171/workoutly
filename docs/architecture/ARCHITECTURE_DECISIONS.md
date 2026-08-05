# Architecture Decisions

No formal ADR files were present before this documentation task. Where rationale is not explicitly recorded in code or comments, it is labelled as inferred from the implementation.

## ADR-001: Use MERN-Style Architecture

Decision: React client, Express API, MongoDB/Mongoose database.

Context: Workoutly needs a full-stack portfolio application with protected user workflows and persistent workout history.

Options considered: Not explicitly recorded in the repository.

Chosen approach: MERN-style split between `client/` and `server/`.

Why it was chosen: Inferred from implementation; it supports independent frontend/backend development while demonstrating common full-stack skills.

Benefits: Clear separation, familiar ecosystem, flexible document data.

Costs and limitations: Two apps/environments to deploy; no server-side rendering; MongoDB consistency concerns need explicit handling.

Future reconsideration trigger: Need for SEO-heavy public pages, complex transactions, or mobile-first offline capabilities.

Repository evidence: `client/package.json`, `server/package.json`, `server/src/models/*.js`.

## ADR-002: React SPA Instead Of Server-Rendered UI

Decision: Build the UI as a Vite React SPA.

Context: Workoutly is interaction-heavy: builders, active sessions, calendars, filters, local timers, and theme changes.

Options considered: Not explicitly recorded.

Chosen approach: React Router SPA served by Vite dev, Nginx static build, or Vercel with SPA rewrites.

Why it was chosen: Inferred from implementation; client-side interaction is central to the app.

Benefits: Rich UI state, simple protected routing, static frontend hosting.

Costs and limitations: Route-specific SEO is limited; auth state depends on browser storage; first-load runtime must fetch data.

Future reconsideration trigger: Public content SEO or server-rendered personalization becomes important.

Repository evidence: `client/src/App.jsx`, `client/vercel.json`, `client/nginx.conf`.

## ADR-003: Context API For Global Auth And Theme

Decision: Use React Context for authentication and theme.

Context: Only auth and theme need global access; most server state is page-local.

Options considered: Not explicitly recorded; Redux/Zustand/React Query not present.

Chosen approach: `AuthContext` and `ThemeContext`.

Why it was chosen: Inferred from implementation; minimizes dependencies and keeps state understandable for project assessment.

Benefits: Small API, easy route guards, no extra state library.

Costs and limitations: Page data fetching is duplicated; no centralized server-state cache.

Future reconsideration trigger: More shared server data, optimistic updates, or cache invalidation needs.

Repository evidence: `client/src/context/AuthContext.jsx`, `client/src/context/ThemeContext.jsx`.

## ADR-004: JWT Access Tokens With Optional Refresh Cookie

Decision: Authenticate APIs with bearer access tokens and optionally refresh through an httpOnly cookie.

Context: Protected frontend routes and backend ownership checks require stateless identity.

Options considered: Not explicitly recorded.

Chosen approach: Access token stored in localStorage; refresh token stored in cookie when `JWT_REFRESH_SECRET` exists.

Why it was chosen: Inferred from implementation; easy SPA integration and server-side middleware.

Benefits: Straightforward API protection and refresh retry path.

Costs and limitations: localStorage exposure risk; refresh tokens are not stored server-side for revocation.

Future reconsideration trigger: Production hardening or stricter security requirements.

Repository evidence: `AuthContext.jsx`, `api.js`, `authService.js`, `authController.js`, `token.js`, `auth.js`.

## ADR-005: Embedded Workout And Session Exercise Data

Decision: Embed routine exercises and session set logs inside documents.

Context: A workout template and completed session are naturally read as one unit.

Options considered: Not explicitly recorded.

Chosen approach: `Workout.exercises` and `WorkoutSession.exercises.sets` embedded arrays.

Why it was chosen: Inferred from schemas and query code.

Benefits: Simple reads and writes, no joins for routine/session display.

Costs and limitations: Large arrays can increase document size; updating individual sets after save is not modeled.

Future reconsideration trigger: Very large routines/sessions or collaborative editing.

Repository evidence: `Workout.js`, `WorkoutSession.js`.

## ADR-006: Manual Workout Completion

Decision: Users manually mark sets complete and enter reps/weight.

Context: Workoutly is not integrated with wearables or exercise machines.

Options considered: Not explicitly recorded.

Chosen approach: `ActiveSession.jsx` manages local set logs and posts a session at finish.

Why it was chosen: Inferred from product behavior; manual control is simpler and transparent.

Benefits: Flexible, explainable, works for any exercise.

Costs and limitations: User can make mistakes; no automatic duplicate prevention.

Future reconsideration trigger: Need for automatic tracking, timers, or draft recovery.

Repository evidence: `client/src/pages/ActiveSession.jsx`, `server/src/controllers/sessionController.js`.

## ADR-007: Cloudinary For Uploaded Images

Decision: Upload images to Cloudinary through the backend.

Context: Routine cover images need storage outside MongoDB and frontend static assets.

Options considered: Not explicitly recorded.

Chosen approach: Multer memory upload -> Cloudinary upload stream -> return secure URL.

Why it was chosen: Inferred from `cloudinary` dependency and route implementation.

Benefits: Keeps binary files out of MongoDB and app containers.

Costs and limitations: Public IDs are not stored on workouts, so cleanup/replacement is incomplete.

Future reconsideration trigger: Need to delete/replace images reliably or support per-exercise media.

Repository evidence: `server/src/config/cloudinary.js`, `server/src/routes/upload.js`, `client/src/components/ImageUpload.jsx`.

## ADR-008: Docker And Static Frontend Serving

Decision: Provide Dockerfiles and Compose files; serve the built client with Nginx.

Context: The project needs reproducible local/demo deployment and module submission support.

Options considered: Not explicitly recorded.

Chosen approach: `docker-compose.yml` builds local images; `docker-compose.prod.yml` pulls Docker Hub images; client container uses Nginx.

Why it was chosen: Inferred from files and README Docker workflow.

Benefits: Predictable local container topology and SPA fallback.

Costs and limitations: Compose production still uses a local Mongo container; external production platform status is not confirmed.

Future reconsideration trigger: Managed database/hosting pipeline becomes the deployment standard.

Repository evidence: `client/Dockerfile`, `server/Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`, `client/nginx.conf`.

## ADR-009: Custom Calendar Instead Of Calendar Library

Decision: Implement history calendar with custom date/grid code.

Context: The calendar only needs month summaries and selected-date drilldowns.

Options considered: Not explicitly recorded.

Chosen approach: `History.jsx` builds month cells with UTC date keys.

Why it was chosen: Inferred from absence of calendar dependency and custom code.

Benefits: No extra dependency, full control over UI.

Costs and limitations: Timezone and accessibility details must be maintained manually.

Future reconsideration trigger: Recurring schedules, drag/drop planning, or complex calendar interactions.

Repository evidence: `client/src/pages/History.jsx`, `server/src/controllers/sessionController.js`.

