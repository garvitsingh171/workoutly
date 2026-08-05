# Revision Notes

Workoutly in one sentence: A MERN workout tracker for building routines, manually logging completed sessions, and reviewing history, goals, progress, and records.

Main problem: workout information is fragmented across notes, memory, and spreadsheets.

Target user: an individual exerciser who wants simple manual tracking and private history.

Main features: auth, routine CRUD/duplicate, active sessions, rest timer, history filters, calendar, CSV export, goals/streaks, progress search, personal records, exercise library, cover uploads, themes.

Stack: React/Vite, React Router, Context, Axios, Express, MongoDB/Mongoose, JWT, bcrypt, Cloudinary, multer, Socket.IO infrastructure, Docker, Nginx, Vercel config, Jest/Supertest.

Frontend architecture: `App.jsx` routes; `AuthContext` and `ThemeContext`; page-local server state; reusable `WorkoutBuilder`; Axios interceptors.

Backend architecture: `app.js` middleware/routes/errors; `server.js` DB and Socket.IO startup; route groups; controllers; selected services/repositories; Mongoose models.

Main models: `User`, `Workout`, `WorkoutSession`, `Exercise`, `Goal`, `PersonalRecord`.

Authentication flow: login -> bcrypt compare -> JWT access token -> localStorage -> Axios bearer header -> `protect` verifies -> `req.user`.

Authorization rule: every private user resource must be scoped to `req.user._id`.

Main request flow: React handler -> Axios -> Express route -> auth/validation -> controller/service -> Mongoose -> JSON response -> state update.

Important API groups: `/api/auth`, `/api/users`, `/api/workouts`, `/api/sessions`, `/api/goals`, `/api/records`, `/api/exercises`, `/api/upload`.

Image-upload flow: client validates and previews -> FormData `image` -> multer memory storage -> Cloudinary upload stream -> URL returned -> `Workout.coverImage`.

Deployment flow: Vite dev and Express locally; Docker Compose for client/server/Mongo; client Dockerfile builds and serves via Nginx; Vercel SPA rewrite exists; backend needs env vars.

Three important decisions:

1. Context API instead of Redux for auth/theme simplicity.
2. Embedded workout/session exercise arrays for natural document reads.
3. Manual completion instead of automated coaching for flexible, honest logging.

Three challenges:

1. Dynamic workout builder validation and serialization.
2. Ownership checks across workouts, sessions, goals, records.
3. History/calendar date filtering and derived summaries.

Three limitations:

1. Limited frontend tests and no E2E tests.
2. Access token stored in localStorage and no server-side refresh revocation.
3. Upload cleanup incomplete because public IDs are not stored on routines.

Three future improvements:

1. Upload tests, accessibility audit, and deployment smoke checks.
2. Profile UI, custom exercise edit/delete, edit-cover replacement.
3. Session indexes, duplicate-session policy, transaction/compensation for session plus records.

Files I must know:

- `client/src/App.jsx`
- `client/src/context/AuthContext.jsx`
- `client/src/services/api.js`
- `client/src/components/workouts/WorkoutBuilder.jsx`
- `client/src/pages/ActiveSession.jsx`
- `client/src/pages/History.jsx`
- `server/app.js`
- `server/server.js`
- `server/src/middleware/auth.js`
- `server/src/services/authService.js`
- `server/src/services/workoutService.js`
- `server/src/controllers/sessionController.js`
- `server/src/services/recordService.js`
- `server/src/models/*.js`

Common interview traps:

- Claiming OAuth or reminders exist.
- Saying production is verified.
- Ignoring localStorage token risk.
- Forgetting that edit routine does not replace cover image.
- Saying Socket.IO powers live product updates; it is only partially connected.
- Forgetting user deletion does not cascade owned data.
- Claiming complete accessibility or E2E coverage.

Final ten-point checklist:

1. Explain the product in 30 seconds.
2. Draw React -> Express -> MongoDB -> Cloudinary.
3. Explain login and protected request.
4. Explain routine creation.
5. Explain session save and personal records.
6. Explain the database ownership model.
7. Explain one security gap honestly.
8. Explain one test file and what it covers.
9. Explain deployment env variables.
10. Name three future improvements without pretending they are implemented.

