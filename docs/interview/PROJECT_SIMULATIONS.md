# Project Simulations

Use these to practice reasoning. Do not memorize full code; practice file navigation, safety checks, and test strategy.

## 1. Add A Field To A Routine

Prompt: Add a `trainingFocus` field to workout routines.

Concept: Full-stack schema/API/form change.

Files: `Workout.js`, `workoutValidators.js`, `workoutService.js`, `WorkoutBuilder.jsx`, `workoutBuilderUtils.js`, tests, docs.

Reasoning: Add schema field with validation, include in payload normalization, add client input, serialize/normalize, update create/edit displays if needed.

Edge cases: old workouts without field, max length, unsupported values.

Security: Server validation is required; do not trust client dropdown.

Checklist: create/update/read works, invalid values fail, docs updated.

## 2. Add Validation To Exercise Form

Prompt: Limit custom exercise instructions length.

Files: `Exercises.jsx`, `exerciseController.js`, `Exercise.js`.

Reasoning: Mongoose may allow any length currently; add server check and client message.

Mistake: Only adding client validation.

## 3. Fix Unauthorized Data Access

Prompt: A user can access another user's resource.

Files: `auth.js`, relevant controller/service, model owner field, `server/tests/auth.test.js`.

Reasoning: Identify owner field, filter query by `req.user._id`, add cross-user test.

Security: Return 403 or 404 consistently; avoid leaking private data.

## 4. Debug Failed API Request

Prompt: Dashboard shows "Failed to load workouts."

Files: `Dashboard.jsx`, `api.js`, `workoutRoutes.js`, `workoutController.js`, `workoutService.js`.

Reasoning: Check network status, token presence, backend route, DB connection, response message.

Common mistakes: Debugging UI before checking API response.

## 5. Add A New Protected Route

Prompt: Add `/profile`.

Files: `App.jsx`, `Header.jsx`, new page, `userController.js`.

Reasoning: Wrap in `ProtectedRoute`, fetch `/api/users/:id`, add loading/error states.

Security: Use current user ID only.

## 6. Add Pagination To Workout History

Already implemented. Explain it.

Files: `History.jsx`, `sessionController.getSessions`.

Expected reasoning: `page`, `limit`, `skip`, `countDocuments`, `hasNextPage`, frontend buttons.

Follow-up: Which index helps? `user + completedAt`.

## 7. Prevent Duplicate Workout Completion

Prompt: Users double-click finish and create duplicate sessions.

Files: `ActiveSession.jsx`, `sessionController.js`, `WorkoutSession.js`.

Approach: UI already disables while saving; backend could add idempotency key or uniqueness policy for workout+startedAt+user.

Risk: Some users may intentionally perform the same workout twice in one day.

## 8. Improve Image Upload Validation

Files: `ImageUpload.jsx`, `middleware/upload.js`, `routes/upload.js`.

Approach: Add tests, validate dimensions or magic bytes if needed, add better Cloudinary error handling.

Security: Do not trust MIME alone for high-security environments.

## 9. Fix Theme Persistence Bug

Files: `ThemeContext.jsx`, `ThemeToggle.jsx`, `index.css`.

Reasoning: Check storage key, valid preferences, system listener, data attributes, initial render.

Edge cases: localStorage unavailable, system preference changes.

## 10. Add Loading And Error State

Prompt: A new data page renders blank during fetch.

Files: Similar pages: `Records.jsx`, `Goals.jsx`, `Progress.jsx`.

Approach: Add loading boolean, error message, inline alert, toast only for request-level failures, empty state for no data.

## 11. Improve Calendar-Day Interaction

Files: `History.jsx`, `App.css`.

Approach: Preserve selected date, add keyboard behavior or focus management, test date formatting/timezone.

Security: None major; avoid raw regex or query injection if adding filters.

## 12. Optimize Repeated Dashboard API Requests

Files: `Dashboard.jsx`, session/goal/exercise endpoints.

Approach: Combine endpoints or add caching only if measurements show need.

Risk: Over-abstracting too early.

## 13. Add An Index For A Common Query

Files: `WorkoutSession.js`, `Workout.js`.

Approach: Add `workoutSessionSchema.index({ user: 1, completedAt: -1 })`; add migration/deploy awareness.

Explain: Indexes speed reads but cost writes/storage.

## 14. Handle Deletion Of A Routine With Related Records

Files: `workoutService.deleteWorkout`, `WorkoutSession.js`.

Approach: Product decision: preserve history with snapshot or cascade delete. Current code preserves sessions by not deleting them.

Risk: Orphaned refs vs user expectation.

## 15. Explain And Fix A CORS Issue

Files: `config/cors.js`, `server.js`, env vars.

Approach: Ensure exact `CLIENT_URL`, no trailing mismatch, credentials enabled, Socket.IO origin list matches.

Common mistake: Changing frontend URL while backend CORS still points to localhost.

## 16. Diagnose Environment-Variable Deployment Issue

Files: `.env.example`, `DEPLOYMENT_AND_OPERATIONS.md`, `db.js`, `cloudinary.js`, `token.js`.

Approach: Identify missing var from error path: DB connection, JWT signing, upload.

Security: Never print secrets in docs or logs.

## 17. Convert Duplicated Component State Into Shared State

Prompt: Dashboard and History duplicate session summary fetching.

Approach: Consider custom hook or data library only when reuse/invalidations justify it.

Files: `Dashboard.jsx`, `History.jsx`, `services/api.js`.

## 18. Improve Mobile Navigation Accessibility

Files: `Header.jsx`, `App.css`, `Header.test.jsx`.

Approach: Verify horizontal nav keyboard scroll/focus, button names, active states, touch targets.

Evaluation: Does it work with keyboard and screen reader labels?

