# Project Interview Guide

## Thirty-Second Introduction

Workoutly is a MERN workout tracker where authenticated users create reusable routine templates, manually complete workout sessions, and review their history, calendar activity, weekly goals, progress, and personal records. It uses React/Vite, Express, MongoDB/Mongoose, JWT auth, Cloudinary uploads, Docker configuration, and Jest/Supertest tests.

## Two-Minute Project Explanation

Workoutly solves the problem of fragmented workout tracking. Instead of keeping routines in notes and completed sets in memory or spreadsheets, users can build templates, start a session, log reps and weight set by set, and save the result. Saved sessions power history, calendar summaries, progress search, goals, streaks, and personal records.

The stack is React with React Router and Context on the frontend, Axios for API calls, Express on the backend, MongoDB with Mongoose models, JWT/bcrypt authentication, Cloudinary for routine cover images, and Docker/Vercel/Nginx configuration for deployment options. The strongest engineering areas are protected ownership checks, reusable workout builder, session-history model, and backend integration tests. The honest current status is a learning/portfolio full-stack app with broad features but unverified production deployment and limited frontend test coverage.

## Five-Minute Walkthrough

1. Product: authenticated personal workout tracking for routines, sessions, history, goals, progress, and records.
2. Frontend: `App.jsx` defines public/protected routes; `AuthContext` restores localStorage auth; `ThemeContext` handles light/dark/system themes.
3. Routine workflow: `WorkoutBuilder` validates dynamic exercises and submits to `/api/workouts`.
4. Session workflow: `ActiveSession` logs sets locally, enforces at least one completed set, and posts to `/api/sessions`.
5. Backend: Express route groups use auth middleware, validators or manual checks, controllers/services, Mongoose models, and a centralized error handler.
6. Database: `User` owns `Workout`, `WorkoutSession`, `Goal`, `PersonalRecord`, and custom `Exercise`.
7. Security: bcrypt passwords, JWT bearer auth, refresh cookie support, ownership filters, rate-limited auth, CORS, upload restrictions.
8. Limitations: no OAuth/reminders/offline support, no transaction around session+record update, access token in localStorage, upload cleanup incomplete, frontend tests limited.

## Ten-Minute Technical Explanation

Use this order: login flow, protected dashboard request, routine creation, active session completion, database model relationships, history/calendar query, records update, image upload flow, deployment configuration, security gaps, and roadmap.

## Demo Order

| Step | Show | Explain | Proves | Backup path |
| --- | --- | --- | --- | --- |
| 1 | Register/login | JWT auth and protected routes | Full-stack auth | Use demo seed user if available |
| 2 | Dashboard | Stats, routines, empty/loading/error handling | API fan-out and UI state | Show empty-state account |
| 3 | Create routine | Builder, exercise suggestions, validation | Dynamic React form | Skip upload if Cloudinary missing |
| 4 | Upload cover | File validation and Cloudinary URL | External service integration | Explain config if upload env absent |
| 5 | Start session | Set logging, rest timer, finish disabled until completion | Client session state | Use existing routine |
| 6 | Save session | Session API and record update toast | Backend business logic | Inspect API response/logs |
| 7 | History/calendar | Filters, selected date, CSV export | Query design | Use seeded user |
| 8 | Goals/records/progress | Derived data from sessions | Data modeling and aggregation | Search exact exercise name |
| 9 | Logout/cross-user | Protected state and ownership | Security | Explain tests if no second user |

## Architecture Explanation

"The frontend is a React SPA. It keeps auth and theme globally in Context and uses local page state for server data. Axios attaches the bearer token and can refresh through the cookie-backed refresh endpoint. The backend is a single Express app with route groups for auth, users, workouts, sessions, goals, records, exercises, and upload. Mongoose models enforce the core schema, and ownership is always rooted in the authenticated user."

## Frontend Questions To Prepare

- Why Context instead of Redux? The app only has global auth/theme; page server state is local.
- How do protected routes work? `ProtectedRoute` checks auth loading/user and redirects guests.
- How does the workout builder handle dynamic rows? It stores an exercise array, validates each row, supports add/remove/reorder, and serializes numeric fields before submit.
- How does theme work? Preference in localStorage, system mode via `matchMedia`, CSS variables via data attributes.
- What is a frontend limitation? No draft persistence for active sessions and limited component tests.

## Backend Questions To Prepare

- Explain middleware order in `app.js`.
- Explain `protect` and `req.user`.
- Explain workout ownership in `workoutService.ensureWorkoutOwner`.
- Explain session save and record update in `sessionController` and `recordService`.
- Explain centralized error format and Mongoose error normalization.
- Explain why sessions/goals/exercises have more controller logic than workouts/users.

## Database Questions To Prepare

- Why MongoDB? Routines and sessions contain embedded exercise/set arrays.
- What relationships exist? User owns workouts/sessions/goals/records/custom exercises; sessions reference workouts.
- What indexes exist? User email, Exercise partial unique indexes, Goal user, PersonalRecord unique user/exercise/type.
- What index would you add? `WorkoutSession user + completedAt` and `Workout author + createdAt`.
- What is a consistency risk? No transaction for session creation plus record updates.

## Security Explanation

Say: "The app has bcrypt password hashing, JWT bearer auth, optional refresh cookies, auth rate limiting, CORS allowlisting, route protection, ownership checks, upload type/size limits, and centralized error handling. I would not claim it is production-secure yet because access tokens are in localStorage, secure headers are missing, refresh tokens are not revocable server-side, and upload scanning/cleanup are incomplete."

## Deployment Explanation

Local dev runs Vite on `5173` and Express on `5000`. Docker Compose can run client, server, and Mongo. The client Dockerfile builds static assets and serves them with Nginx SPA fallback. Vercel rewrites all paths to `/`. The backend expects MongoDB, JWT, CORS, and Cloudinary env vars.

## Difficult Decisions

| Decision | Chosen solution | Alternative | Tradeoff |
| --- | --- | --- | --- |
| State management | Context + local page state | Redux/React Query | Simpler, but no shared server cache |
| Auth | JWT in localStorage + optional refresh cookie | Cookie-only session | Easier SPA calls, more XSS exposure |
| Data model | Embedded exercise/set arrays | Fully normalized exercises/sets | Simple reads, large arrays need care |
| Calendar | Custom calendar | Calendar library | No dependency, more manual a11y/timezone work |
| Image storage | Cloudinary URL | Store files locally/Mongo | Scalable storage, cleanup gap |

## Challenges And Solutions

Use STAR-style answers tied to code, not invented incidents:

- Dynamic workout builder: explain managing array state, validation, serialization, and exercise suggestions in `WorkoutBuilder`.
- Ownership protection: explain tests and `workoutService.ensureWorkoutOwner`.
- Derived records: explain `recordService` comparing new session values against existing records.
- History calendar: explain UTC keys and selected-date fetch flow.

## Weak Areas And Honest Answers

- "Do you have E2E tests?" No. Backend integration tests are broad; frontend tests are limited. E2E is future scope.
- "Is it production-ready?" Not fully verified. Config exists, but deployment and security hardening need more checks.
- "Does it support reminders/OAuth/offline?" No, not implemented.
- "Can users edit custom exercises?" Not yet; create/list only.
- "Are uploads cleaned up?" Not fully; public ID is returned but not stored on `Workout`.

## Code Walkthrough Files

| File | Purpose | Know this |
| --- | --- | --- |
| `client/src/App.jsx` | Routes/providers | Public vs protected routes |
| `client/src/context/AuthContext.jsx` | Auth state | Restore, expiry, login/logout |
| `client/src/services/api.js` | API client | Bearer token and refresh interceptor |
| `client/src/components/workouts/WorkoutBuilder.jsx` | Dynamic form | Validation, add/remove/reorder |
| `client/src/pages/ActiveSession.jsx` | Session logging | Payload construction and rest timer |
| `client/src/pages/History.jsx` | History/calendar | Filtering, pagination, date selection |
| `server/app.js` | Express setup | Middleware and route order |
| `server/src/middleware/auth.js` | Auth guard | JWT verification |
| `server/src/services/workoutService.js` | Routine logic | Ownership and duplicate |
| `server/src/controllers/sessionController.js` | Sessions/history | Most backend logic |
| `server/src/services/recordService.js` | Records | Derived best values |
| `server/src/models/*.js` | Data design | Fields, refs, indexes |

## AI-Assisted Development Ownership

Say this professionally: "I used coding assistants as development tools, but I reviewed and integrated the changes. I am responsible for understanding the architecture, defending the decisions, and modifying critical parts myself. I should not claim authorship of logic I cannot explain."

## What To Improve Answer

Immediate: add upload tests, frontend tests for builder/history/session, verify deployment, remove stale template docs/assets.

Architecture: standardize service layer, add session/record transaction or compensation, add common indexes.

Product: profile page, edit cover image, custom exercise edit/delete, duplicate-session policy.

Security: secure headers, token storage review, dependency audit, upload cleanup/scanning.

