# Testing Strategy

Testing documentation is based on repository inspection. Test commands were not run during this task.

## Current Test Frameworks

| Area | Framework/tools | Evidence |
| --- | --- | --- |
| Backend | Jest, Supertest, Mongoose test DB | `server/package.json`, `server/tests/auth.test.js` |
| Frontend | Jest, Testing Library, user-event, jsdom, babel-jest | `client/package.json`, `client/jest.config.cjs`, `Header.test.jsx`, `Login.test.jsx` |

## Existing Test Files

| File | Coverage |
| --- | --- |
| `server/tests/auth.test.js` | Auth, refresh/logout, profile ownership, workout validation/ownership/duplicate, sessions, history filters, calendar grouping, CSV export, summaries, progress, goals, records, exercise library |
| `client/src/components/Header.test.jsx` | Guest/authenticated header rendering and logout click |
| `client/src/pages/Login.test.jsx` | Typing, valid submit payload, empty-field validation |

## Current Coverage Summary

Backend integration coverage is broad despite the test file name. Frontend coverage is narrow. No E2E tests, visual regression tests, accessibility automated tests, upload tests, deployment smoke tests, or performance tests were found.

## What Is Not Tested

- Runtime UI workflows across the full browser app.
- Create/edit workout builder interactions in frontend tests.
- Active session logging and rest timer.
- History calendar selected-day behavior in frontend tests.
- Image upload route with file type, size, and Cloudinary failures.
- Socket.IO authentication/connection behavior.
- Accessibility and keyboard-only workflows.
- Docker/Vercel deployment behavior.
- Cloudinary and production CORS configuration.

## Manual Testing Approach

Use the root README checklist: register, login, refresh, create/edit/duplicate/delete routine, upload cover image if Cloudinary env exists, start session, complete sets, save session, verify records/progress/history/calendar/goals/dashboard, test ownership with a second user, export CSV, logout, and verify protected route redirects.

## Critical Workflow Test Matrix

| Workflow | Unit | Integration/API | Frontend component | Manual | Priority |
| --- | --- | --- | --- | --- | --- |
| Register/login/logout/refresh | token utilities, validators | Existing backend tests | Existing login/header tests | Required | High |
| Protected route redirect | AuthContext helpers | 401 backend tests | Add `ProtectedRoute` tests | Required | High |
| Workout create/edit/delete/duplicate | builder validation utils | Existing backend tests | Add builder tests | Required | High |
| Session completion | payload normalization | Existing backend tests | Add ActiveSession tests | Required | High |
| Records update | record service | Existing backend tests | Records empty/data render | Required | High |
| History filters/calendar/export | date parsing helpers | Existing backend tests | Add History tests | Required | High |
| Goals | target validation | Existing backend tests | Add Goals tests | Required | Medium |
| Exercise library | duplicate/name validation | Existing backend tests | Add Exercises tests | Required | Medium |
| Image upload | file validation | Add Supertest/multer mocks | Add ImageUpload tests | Required if Cloudinary configured | High |
| Theme | theme validation | Not applicable | Add ThemeToggle/ThemeContext tests | Manual | Medium |
| Responsive nav/calendar | Not applicable | Not applicable | Optional | Required | Medium |
| Accessibility | Not applicable | Not applicable | Optional axe tests later | Required | Medium |
| Deployment smoke | Not applicable | Health endpoint | Not applicable | Required before release | High |

## Future Strategy

Unit-test candidates: `workoutFormValidation.js`, `workoutBuilderUtils.js`, token expiry parsing, date utilities if extracted, record calculations, goal streak calculations.

Integration-test candidates: upload route, profile update/delete UI-backed behavior, user deletion data impact, malformed session payloads, custom exercise duplicates by user, CORS configuration where practical.

Frontend component-test candidates: `ProtectedRoute`, `PublicRoute`, `WorkoutBuilder`, `ImageUpload`, `Goals`, `History`, `ActiveSession`, `ThemeToggle`.

API-test candidates: each route in [API Reference](../architecture/API_REFERENCE.md), especially ownership checks for any new resource.

Deployment smoke tests: `GET /api/health`, frontend route refresh on `/dashboard`, CORS from deployed frontend to backend, auth cookie behavior, Cloudinary upload with safe test image, MongoDB persistence.

## Optional Future E2E

End-to-end tooling is not currently implemented and should not be described as current. It would be useful later for register/login/create routine/finish workout/history assertions.

