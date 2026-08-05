# Technical Interview Questions

## Product

Q: What is Workoutly?
A: A MERN workout tracker for authenticated users to create routines, manually complete sessions, and review history, goals, progress, and records.

Q: What should you avoid claiming?
A: Production readiness, OAuth, reminders, offline support, admin roles, nutrition, social features, and per-exercise images.

## React And State

Q: Why use Context?
A: Auth and theme are the only global concerns. Routine/session/history data is page-local, so Redux would add complexity.

Q: How are protected routes implemented?
A: `ProtectedRoute` reads `AuthContext`; it shows a loading spinner during restoration and redirects guests to `/login`.

Q: What is a stale-state risk?
A: Dashboard and history fetch their own data without centralized cache, so updates require explicit refetches or local mutations.

## Routing

Q: Where are routes defined?
A: `client/src/App.jsx`.

Q: What route starts an active workout?
A: `/workouts/session/:id`, rendering `ActiveSession`.

## Forms

Q: How does Workoutly validate routine forms?
A: Client-side `validateWorkoutForm` checks UX constraints; server-side `workoutValidator` and Mongoose enforce API/database constraints.

Q: How are dynamic exercise rows handled?
A: `WorkoutBuilder` stores an exercise array with client IDs and supports add, remove, move up/down, and per-row errors.

## UX And Accessibility

Q: What loading/error states exist?
A: ProtectedRoute spinners, page spinners, inline alerts, toast errors, disabled submit buttons, and empty cards.

Q: What accessibility work exists?
A: Labels, focus rings, `aria-live` loading/rest states, screen-reader labels for session inputs, and calendar button labels.

Q: What accessibility gap remains?
A: No automated audit and no formal keyboard/focus review for all workflows.

## Express And Middleware

Q: What is the backend request flow?
A: CORS -> JSON -> cookies -> route -> auth/validation -> controller/service/model -> response or error handler.

Q: What does `protect` do?
A: Extracts bearer token, verifies JWT, loads the user, and attaches `req.user`.

## REST API

Q: What are the main API groups?
A: auth, users, workouts, sessions, goals, records, exercises, upload.

Q: How is pagination implemented?
A: Workouts and sessions parse positive `page`/`limit`, cap limit at 50, use skip/limit, and return `pagination`.

## Authentication

Q: How does login work?
A: Normalize email, find user with password, bcrypt compare, return access token and optional refresh cookie.

Q: What is the refresh flow?
A: Axios retries a protected 401 by calling `/api/auth/refresh`; if successful it stores the new token/user and retries.

## Authorization

Q: How is workout ownership enforced?
A: `workoutService` loads the workout and compares `Workout.author` to `req.user._id`.

Q: How are sessions protected?
A: Session creation verifies the source workout belongs to the user; session queries filter by `user:req.user._id`.

## MongoDB/Mongoose

Q: Why embed session sets?
A: A completed session is usually read as one document, and set logs are historical facts tied to that session.

Q: Which indexes exist?
A: User email, Exercise default/custom unique partial indexes, Goal user, and PersonalRecord unique user/exercise/type.

Q: Which index would you add?
A: `WorkoutSession { user:1, completedAt:-1 }` for history/calendar/dashboard.

## Validation

Q: Where is validation strongest?
A: Auth/users/workouts use `express-validator` plus Mongoose.

Q: Where is validation more manual?
A: Sessions, goals, exercises, and uploads.

## Image Upload

Q: How does upload work?
A: The client validates and previews, sends `image` FormData, multer validates type/size, backend streams buffer to Cloudinary, returns URL/publicId.

Q: What is the upload gap?
A: Public ID is not stored on `Workout`, so cleanup on replace/delete is incomplete.

## Error Handling

Q: What is the error response format?
A: `{ "success": false, "message": "..." }`.

Q: How are unexpected errors handled?
A: `errorHandler` normalizes to a generic 500 message and logs message/status/path/method.

## Security

Q: What security protections exist?
A: bcrypt, JWT, refresh cookie, auth rate limit, CORS allowlist, ownership checks, file limits, validators, password `select:false`.

Q: What security gap is most important?
A: Access token in localStorage and no refresh-token server-side revocation.

## Testing

Q: What tests exist?
A: Broad backend Jest/Supertest tests in `server/tests/auth.test.js`, plus frontend Header and Login tests.

Q: What would you test next?
A: Upload route, WorkoutBuilder, ActiveSession, History calendar, ProtectedRoute, and accessibility.

## Deployment

Q: How does Docker Compose work?
A: It starts Mongo, server, and client; server uses Docker hostname `mongo` for `MONGO_URI`; client serves via Nginx.

Q: How does SPA fallback work?
A: Vercel rewrites all paths to `/`; Nginx uses `try_files ... /index.html`.

## Performance

Q: What could slow down?
A: All-session dashboard summaries, history/progress queries over growing session data, and repeated dashboard endpoint fan-out.

Q: What mitigation exists?
A: Pagination and limit caps for workouts/history; recommended indexes for session date queries.

## Git

Q: What branch/commit was documented?
A: `main` at `9bc3628601349a0a59e475ad40b8e2525204f90c`, read from `.git` files without running Git commands during this task.

## Architecture Tradeoffs

Q: What was the biggest tradeoff?
A: Simplicity vs production hardening: the app demonstrates end-to-end workflows clearly, but needs stronger security, tests, indexes, and deployment verification before production claims.

