# Product Requirements Document

## Document Information

| Field | Value |
| --- | --- |
| Product name | Workoutly |
| Purpose | Explain Workoutly as a repository-backed product for development, review, and interview preparation |
| Current project stage | Learning/portfolio full-stack application with broad implemented workflows; release/deployment status not verified |
| Last reviewed date | August 5, 2026 |
| Verification note | Based on repository inspection only; no runtime test or external deployment dashboard inspection was performed |

## Product Summary

Workoutly is a workout-tracking web application for users who want to create routine templates, complete workouts manually, and review their training history. It is designed around practical logging rather than complex coaching automation.

The project exists to demonstrate a complete MERN-style product: React routes and forms, Express APIs, MongoDB/Mongoose models, authentication, ownership checks, image upload, Docker deployment configuration, seed data, and tests.

Compared with notes or spreadsheets, Workoutly provides structured routine data, protected user-owned records, a guided active-session screen, saved session history, calendar summaries, CSV export, weekly goals, streaks, personal records, and searchable exercise progress.

## Problem Statement

Workoutly responds to common training-organization problems:

| Problem | Implemented response | Status |
| --- | --- | --- |
| Routines are hard to reuse when stored in notes | Users create workout templates with exercises, sets, reps, duration, difficulty, rest, and notes | Implemented and verified in the repository |
| Completed work is easy to forget | Active sessions save completed sets, reps, weight, duration, volume, and timestamp | Implemented and verified in the repository |
| History is difficult to scan | History page provides filtered list, pagination, calendar summary, selected-date details, and CSV export | Implemented and verified in the repository |
| Consistency is difficult to see | Goals page and dashboard show weekly targets and streaks derived from sessions | Implemented and verified in the repository |
| Exercise options are fragmented | Exercise library merges default movements with user custom exercises | Implemented and verified in the repository |

## Target Users

| User group | Description |
| --- | --- |
| Beginners following personal routines | Users who need simple repeatable templates and visible progress. |
| Home or gym users who prefer manual control | Users who want to decide what they completed rather than rely on automation. |
| Portfolio/project reviewers | Reviewers evaluating full-stack architecture and product decisions. |
| The project owner preparing for interviews | The codebase is structured enough to discuss frontend, backend, database, security, and deployment tradeoffs. |

No admin, trainer, premium, healthcare, nutrition, or social roles were confirmed from the repository.

## User Needs And Jobs To Be Done

| Need | User goal | Motivation | Current difficulty | Workoutly response | Status |
| --- | --- | --- | --- | --- | --- |
| Create a routine | Save a reusable plan | Start training quickly | Notes are unstructured | `WorkoutBuilder` and `/api/workouts` store templates | Implemented and verified in the repository |
| Complete a session | Log what happened in the workout | Track reality, not only plan | Manual logs get lost | `ActiveSession` saves `WorkoutSession` records | Implemented and verified in the repository |
| Review history | See completed workouts over time | Understand consistency | Spreadsheets require manual grouping | `History` page and session calendar API | Implemented and verified in the repository |
| Track consistency | Set weekly target and see streaks | Maintain habits | Hard to measure week-to-week | `Goals` page and dashboard summaries | Implemented and verified in the repository |
| See exercise progress | Check one movement over time | Understand strength progress | Notes are hard to search | `/api/sessions/progress` and `Progress` page | Implemented and verified in the repository |
| Manage exercise names | Reuse default/custom exercises | Faster routine building | Typos and scattered names | Exercise library and builder datalist | Implemented and verified in the repository |

## Product Goals

- Provide authenticated users a private place to manage workout templates.
- Let users complete sessions manually and persist meaningful training data.
- Show history, calendar, progress, goals, streaks, and records from saved sessions.
- Keep the UI responsive enough for desktop and mobile gym-floor use.
- Demonstrate full-stack engineering practices for assessment and interviews.

## Non-Goals

Workoutly currently does not attempt to be:

- A medical diagnosis platform or healthcare-advice replacement.
- A fully automated personal trainer or recommendation engine.
- A nutrition or complete health-management platform.
- A social fitness network.
- A premium/admin/trainer-role platform.
- An offline-first mobile application.

## User Roles And Permissions

| Role | Permissions | Evidence |
| --- | --- | --- |
| Guest | View home, register, login | `App.jsx`, `PublicRoute.jsx` |
| Authenticated user | View and manage own routines, sessions, goals, records, custom exercises, and own profile API | `ProtectedRoute.jsx`, `auth.js`, service/controller ownership checks |

No admin, trainer, moderator, premium, or OAuth user role was found.

## Core Workflows

| Workflow | Trigger | Preconditions | Main steps | Success result | Error or empty states | Modules | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Registration | User opens `/register` | Guest | Fill name/email/password/confirm password; submit | User is created; UI redirects to login | Client and server validation errors | `Register.jsx`, `authService.js`, `User.js` | Implemented and verified in the repository |
| Login | User opens `/login` | Existing user | Submit email/password | Token/user stored; redirect to original route or dashboard | Inline alert and toast | `Login.jsx`, `AuthContext.jsx`, `authController.js` | Implemented and verified in the repository |
| Logout | Header button | Authenticated | Click Logout | Local storage cleared; server clears refresh cookie; redirect to login | Local logout continues if server unreachable | `Header.jsx`, `AuthContext.jsx`, `authController.js` | Implemented and verified in the repository |
| Dashboard access | Visit `/dashboard` | Authenticated | ProtectedRoute checks session; fetch profile, workouts, summaries | Dashboard stats and routine cards | Loading cards, empty routine card, inline alerts | `Dashboard.jsx`, API routes | Implemented and verified in the repository |
| Create routine | Click Create Routine | Authenticated | Fill builder; optionally upload cover; submit | Workout saved; redirect to dashboard | Builder validation, upload errors, API alert | `CreateWorkout.jsx`, `WorkoutBuilder.jsx`, `upload.js`, `workoutService.js` | Implemented and verified in the repository |
| Edit routine | Click Edit | Authenticated and owner | Fetch routine; edit builder; submit | Workout updated; redirect dashboard | Loading page, error back button | `EditWorkout.jsx`, `workoutService.js` | Implemented and verified in the repository |
| Delete routine | Click Delete | Authenticated and owner | Confirm browser dialog; API delete | Routine removed from dashboard | Toast and inline error | `Dashboard.jsx`, `workoutService.js` | Implemented and verified in the repository |
| Add exercise image | Upload in create routine | Authenticated | Select file; validate; preview; upload to Cloudinary | URL stored in routine payload | File type/size/upload errors | `ImageUpload.jsx`, `upload.js`, `Workout.coverImage` | Implemented and verified in the repository |
| Start and complete workout | Click Start on routine | Authenticated and owner | Fetch routine; log reps/weight; mark sets; finish | `WorkoutSession` saved; records updated | Requires at least one completed set; save error | `ActiveSession.jsx`, `sessionController.js`, `recordService.js` | Implemented and verified in the repository |
| View history/calendar | Visit `/history` | Authenticated | Fetch sessions and month summary; filter or select day | Session cards and selected-date panel | Loading, empty filters, calendar errors | `History.jsx`, session endpoints | Implemented and verified in the repository |
| View goals/streaks | Visit `/goals` | Authenticated | Fetch summary; update weekly target | Updated target and progress | Target validation and API errors | `Goals.jsx`, `goalController.js` | Implemented and verified in the repository |
| Change theme | Click theme toggle | Any user | Cycle Light/Dark/System | CSS theme data attributes update | Storage failures fall back to session behavior | `ThemeContext.jsx`, `ThemeToggle.jsx` | Implemented and verified in the repository |
| Update profile | API call only | Authenticated user | `PUT /api/users/:id` | Profile updated | Ownership and validation errors | `userController.js`, `userService.js` | Partially implemented |

## Functional Requirements

| ID | Requirement | User value | Status | Evidence |
| --- | --- | --- | --- | --- |
| AUTH-001 | Users can register with name, email, and password | Account creation | Implemented and verified in the repository | `Register.jsx`, `authValidators.js` |
| AUTH-002 | Users can log in with email/password | Protected access | Implemented and verified in the repository | `Login.jsx`, `authService.js` |
| AUTH-003 | Protected APIs require bearer token | Privacy | Implemented and verified in the repository | `api.js`, `auth.js` |
| ROUTINE-001 | Users can create routines | Reusable plans | Implemented and verified in the repository | `CreateWorkout.jsx`, `Workout.js` |
| ROUTINE-002 | Users can edit/delete/duplicate owned routines | Manage templates | Implemented and verified in the repository | `Dashboard.jsx`, `workoutService.js` |
| WORKOUT-001 | Users can manually complete sets | Accurate logging | Implemented and verified in the repository | `ActiveSession.jsx`, `WorkoutSession.js` |
| HISTORY-001 | Users can view and filter completed sessions | Training review | Implemented and verified in the repository | `History.jsx`, `sessionController.js` |
| HISTORY-002 | Users can export session CSV | Data portability | Implemented and verified in the repository | `exportSessionsCsv` |
| GOAL-001 | Users can set weekly workout target | Consistency tracking | Implemented and verified in the repository | `Goals.jsx`, `Goal.js` |
| RECORD-001 | Records update after saved sessions | Motivation and progress | Implemented and verified in the repository | `recordService.js`, `PersonalRecord.js` |
| EXERCISE-001 | Users can browse defaults and create custom exercises | Faster routine building | Implemented and verified in the repository | `Exercises.jsx`, `exerciseController.js` |
| IMAGE-001 | Users can upload routine cover images | Visual routine recognition | Implemented and verified in the repository | `ImageUpload.jsx`, `upload.js` |
| THEME-001 | Users can switch light/dark/system theme | Comfort and preference | Implemented and verified in the repository | `ThemeContext.jsx` |
| PROFILE-001 | Users can update/delete own profile through API | Account control | Partially implemented | Backend exists; UI not found |
| OAUTH-001 | OAuth login | Alternative auth | Planned | No implementation found |
| REMINDER-001 | Workout reminders | Habit support | Planned | No implementation found |

## Non-Functional Requirements

| Area | Current behavior | Desired/recommended behavior |
| --- | --- | --- |
| Performance | Client fetches several dashboard endpoints; backend caps workout/session list limits at 50 | Add indexes/pagination where history grows and avoid repeated dashboard requests where possible |
| Responsiveness | CSS breakpoints collapse grids and use horizontal scroll for nav/calendar | Runtime mobile review before release |
| Accessibility | Labels, focus rings, aria live regions, and calendar button labels exist | Automated and manual accessibility audit |
| Security | JWT auth, bcrypt, auth rate limiting, CORS allowlist, upload limits | Secure headers, dependency auditing, broader validation, token storage reconsideration |
| Reliability | Central backend error handler and frontend toasts/alerts | More retry/idempotency behavior for uploads/sessions |
| Data integrity | Ownership filters and Mongoose validation; no transactions | Consider transactions for session plus record updates if consistency becomes critical |
| Maintainability | Clear client/server folders; mixed controller/service patterns | More consistent service boundaries for sessions/goals/exercises |
| Browser compatibility | Vite SPA targeting modern browsers | Explicit browser support matrix not found |
| Privacy | User-owned data filters on major resources | Avoid sensitive logging and add privacy notes if deployed |
| Image handling | Type/size checks, Cloudinary storage | Store public IDs and cleanup replaced/deleted assets |
| Deployment | Docker, Nginx, Vercel config and env examples exist | Confirm external deployment URLs and smoke checks |

## Page And Route Inventory

| Route | Page | Auth | Purpose | Components | Data dependencies | Loading | Error | Empty | Responsive behavior | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | `Home` | Public | Landing/home | `Button`, `Badge` | Auth context | Loading page | Not major | Not applicable | Hero stacks at smaller widths | Implemented and verified in the repository |
| `/login` | `Login` | PublicRoute | Login | `Input`, `Button` | `/api/auth/login` | Auth check/loading button | Inline/toast | Not applicable | Form panel centered | Implemented and verified in the repository |
| `/register` | `Register` | PublicRoute | Signup | `Input`, `Button` | `/api/users/register` | Button state | Inline/toast | Not applicable | Form panel centered | Implemented and verified in the repository |
| `/dashboard` | `Dashboard` | Protected | Stats and routines | `ProgressInsights`, `AchievementSection`, cards | profile, workouts, summaries, recent, calendar, exercises | Multiple spinners | Alerts/toasts | No routines card | Grids collapse | Implemented and verified in the repository |
| `/workouts/create` | `CreateWorkout` | Protected | Create routine | `WorkoutBuilder`, `ImageUpload` | exercises, upload, workouts | Submit/upload states | Alerts/toasts | Builder can add first exercise | Builder rail stacks | Implemented and verified in the repository |
| `/workouts/edit/:id` | `EditWorkout` | Protected | Edit routine | `WorkoutBuilder` | workout by id, exercises | Page spinner | Back button on load failure | Not applicable | Builder rail stacks | Implemented and verified in the repository |
| `/workouts/session/:id` | `ActiveSession` | Protected | Complete workout | Session cards, rest timer | workout by id, sessions | Page spinner/save state | Alert/toast | Finish disabled with 0 sets | Mobile set grid compacts | Implemented and verified in the repository |
| `/history` | `History` | Protected | History/calendar/export | Custom calendar, cards | sessions, calendar, CSV | List/calendar/selected-day spinners | Alerts/toasts | No matching sessions/date panel | Calendar scrolls horizontally on mobile | Implemented and verified in the repository |
| `/goals` | `Goals` | Protected | Weekly goal/streaks | Goal form, stats | goals summary/current | Page spinner/save | Alerts/toasts | Defaults to summary | Form stacks | Implemented and verified in the repository |
| `/progress` | `Progress` | Protected | Exercise progress search | Search form, table | sessions progress | Loading card | Alert/toast | No progress card | Table wrapper scrolls | Implemented and verified in the repository |
| `/records` | `Records` | Protected | Personal records | Record cards | `/api/records` | Loading card | Alert/toast | No records card | Card grid collapses | Implemented and verified in the repository |
| `/exercises` | `Exercises` | Protected | Exercise library | Form, filters, list | `/api/exercises` | Inline state | Alerts/toasts | No exercises found | Layout stacks | Implemented and verified in the repository |
| `*` | `NotFound` | Public | 404 | `Button` | None | None | None | Not applicable | Simple centered page | Implemented and verified in the repository |

## Feature Status Summary

Implemented and verified in the repository: authentication, protected routes, routine CRUD/duplicate, manual session completion, history/calendar/export, goals/streaks, records, exercise progress, default/custom exercise library, routine cover upload, theme selection, demo seed data, backend integration tests.

Partially implemented: profile management UI, Socket.IO product usage, accessibility verification, frontend test coverage, edit-cover replacement, secure header hardening.

Planned or discussed but absent: OAuth, reminders, per-exercise images/icons, nutrition, social features, offline support, admin/trainer/premium roles.

See the complete inventory in [FEATURE_STATUS.md](FEATURE_STATUS.md).

## Product Limitations

- No deployed production behavior was verified during this task.
- No OAuth, reminders, social features, nutrition tracking, or offline support.
- Profile update/delete APIs exist without a confirmed UI.
- Custom exercises can be added but not edited or deleted.
- Progress analytics are basic and search-driven by exercise name.
- Accessibility is partially addressed but not audited with tooling.
- Frontend tests are limited.
- Session plus record creation is not transactional.
- Uploaded Cloudinary public IDs are returned but not stored for cleanup.
- Socket.IO is connected on the dashboard but no user-facing real-time product behavior was found.

## Success Criteria

- A user can register, log in, create a routine, start a session, complete at least one set, and save the session.
- Workout data persists under the authenticated user and cannot be accessed by another user through protected backend APIs.
- Dashboard, history, goals, progress, records, and exercise library show loading, error, and empty states where applicable.
- Core pages remain usable across desktop and mobile layouts.
- Deployment configuration uses correct environment variables and CORS settings.
- Documentation stays aligned with the implementation.

## Release Criteria

Before marking a feature released:

- Implementation is complete in frontend and backend where applicable.
- Client and server validation are complete.
- Loading, error, and empty states are reviewed.
- Responsive behavior is checked.
- Authentication and ownership checks are verified.
- Database behavior and indexes are reviewed.
- Manual testing is completed.
- Relevant automated tests pass.
- Documentation is updated.
- Deployment is smoke-tested.

## Future Scope

Near term: runtime verification, stronger frontend tests, upload tests, profile UI, edit-cover replacement, custom exercise management, duplicate-session policy, accessibility review.

Medium term: history/progress pagination improvements, database indexes, Cloudinary cleanup, dashboard request optimization, offline session drafts.

Long term: optional reminders, optional OAuth, richer analytics, mobile-app packaging, and advanced coaching features if product scope expands.

