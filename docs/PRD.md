# Workoutly — Product Requirements Document (PRD)

## 1. Document Information

| Field | Value |
| --- | --- |
| Product | Workoutly |
| Repository | `garvitsingh171/workoutly` |
| Repository snapshot | `main` at `e9ea4d8751af48f6347f4a02c271bbecaf28baa2` |
| Review date | 22 August 2026 |
| Product type | Full-stack workout tracking web application |
| Primary stack | React + Vite, Express, MongoDB + Mongoose, Node.js |
| Document basis | Current repository tree, source code, existing docs, tests, deployment configuration, and recent commit comparison |

> Verification note: the repository already contained PRD/HLD/LLD documentation reviewed on 5 August 2026. A commit comparison from that snapshot to the current `main` showed only a README change, so the application architecture and feature descriptions remain aligned with the current codebase. This document refreshes the snapshot and consolidates the product requirements in an interview-ready form.

---

## 2. Product Summary

Workoutly is a personal workout tracking application focused on reusable workout routines, manual workout execution, and long-term progress visibility. It allows an authenticated user to create workout templates, define exercises and planned sets, run an active session, record completed repetitions and weight, save the finished session, and later review history, calendar activity, goals, streaks, exercise progress, and personal records.

Workoutly intentionally uses manual completion rather than pretending to be an automated coach. The user decides what was actually completed, while the system provides structure, persistence, summaries, and progress views.

The project also serves as a full-stack engineering portfolio project. Its value is not only the UI: it demonstrates authentication, ownership authorization, layered backend design, MongoDB document modeling, validation, file uploads, derived analytics, CSV export, Docker configuration, testing, CI, and deployment-oriented environment configuration.

---

## 3. Problem Statement

People who train with handwritten notes, messaging apps, or unstructured spreadsheets often face several problems:

1. Workout routines are difficult to reuse consistently.
2. Planned sets and actually completed sets get mixed together.
3. Historical workout data is difficult to search by date or exercise.
4. Consistency is difficult to measure without manually counting sessions.
5. Personal bests and volume improvements are easy to miss.
6. Generic exercise lists do not support personal/custom movements well.
7. Data stored in notes has weak structure and limited portability.

Workoutly addresses these problems by separating **workout templates** from **completed workout sessions** and then deriving history, progress, streaks, goals, and records from saved session data.

---

## 4. Product Vision

Create a simple, private, structured workout tracker where a user can move through the complete training loop:

```text
Plan routine
   ↓
Start workout
   ↓
Record actual sets/reps/weight
   ↓
Save completed session
   ↓
Review history, consistency and progress
   ↓
Improve future workouts
```

Workoutly is not trying to be a medical platform, social network, nutrition tracker, or AI personal trainer in its current scope.

---

## 5. Target Users

| User type | Need | Workoutly value |
| --- | --- | --- |
| Beginner lifter | Reusable routines and simple tracking | Structured routine builder and guided active session |
| Home workout user | Track exercises without complex gym software | Manual exercise/set logging |
| Regular gym user | Review progression and consistency | History, records, exercise progress, streaks |
| User with custom exercises | Add personal movements | Default + custom exercise library |
| Portfolio/interview reviewer | Evaluate end-to-end engineering | Visible frontend/backend/data/security architecture |

### Current roles

Workoutly has two practical access states:

- **Guest** — can access landing, login, and registration.
- **Authenticated user** — can manage only their own routines, sessions, goals, personal records, custom exercises, and profile API.

No admin, trainer, moderator, premium, healthcare, or organization role is implemented.

---

## 6. Jobs To Be Done

| JTBD | User statement | Current implementation |
| --- | --- | --- |
| Create reusable workout | “I want to save a routine once and perform it many times.” | Workout templates stored in `Workout` |
| Log actual performance | “I want planned reps and actual reps to be different.” | `WorkoutSession` stores actual set results |
| Track consistency | “I want to know whether I am training regularly.” | Goals, weekly summary, current streak |
| Review a particular date | “I want to see what I trained on a day.” | History calendar and date filtering |
| Track one exercise | “I want to see how an exercise improves over time.” | Exercise progress endpoint/page |
| Identify best performance | “I want personal records to update automatically.” | Personal record service after session save |
| Export history | “I want my workout data outside the app.” | CSV export |
| Customize routine appearance | “I want routines to be visually identifiable.” | Cloudinary-backed cover image URL |

---

## 7. Product Goals

### Core goals

- Provide secure email/password authentication.
- Keep each user's workout data isolated from other users.
- Let users create, edit, duplicate, and delete reusable workout templates.
- Let users manually complete workout sets with actual reps and weight.
- Store completed sessions separately from routine templates.
- Show history with pagination, filtering, calendar aggregation, and CSV export.
- Show consistency using weekly goals and streak calculations.
- Track personal records and exercise-specific progress.
- Support default exercises plus user-created exercises.
- Provide responsive light/dark/system UI themes.

### Engineering goals

- Maintain clear client/server separation.
- Demonstrate REST-style APIs and backend ownership checks.
- Use validation both before persistence and at database schema level.
- Keep deployment configurable through environment variables.
- Provide automated tests for critical authentication behavior.
- Preserve an architecture that is easy to explain during interviews.

---

## 8. Non-Goals

The current product does **not** claim to provide:

- Medical advice, injury diagnosis, or healthcare guidance.
- Automatic workout programming or AI coaching.
- Nutrition or calorie tracking.
- Social feeds, followers, comments, or public profiles.
- Trainer/client management.
- Paid plans or premium roles.
- Offline-first mobile sync.
- Wearable/device integration.
- OAuth login in the current implementation.
- Workout reminders in the current implementation.

---

## 9. Core User Workflows

### 9.1 Registration

**Precondition:** user is logged out.

1. User opens `/register`.
2. User enters name, email, password, and confirmation.
3. Client validates required fields and password confirmation.
4. Server validates normalized input.
5. Server rejects duplicate email.
6. Password is hashed with bcrypt.
7. User document is created.
8. UI shows success and routes the user toward login.

### 9.2 Login and protected navigation

1. User submits email and password.
2. Backend validates credentials.
3. Backend returns user information and an access token.
4. Frontend stores auth state.
5. Axios attaches the bearer token to protected requests.
6. `ProtectedRoute` prevents guests from accessing private pages.
7. Backend independently verifies authorization; frontend route guards are not treated as security boundaries.

### 9.3 Create workout routine

1. User opens `/workouts/create`.
2. User enters routine metadata.
3. User adds one or more exercise rows.
4. Each exercise contains planned sets, reps, rest, and optional notes.
5. Optional cover image is uploaded through the protected upload endpoint to Cloudinary.
6. Frontend submits normalized workout payload.
7. Backend creates the routine with `author = authenticated user`.
8. User returns to dashboard.

### 9.4 Perform workout

1. User starts a workout they own.
2. App builds an active-session view from the workout template.
3. For each set, user enters actual reps and weight and marks completion.
4. Rest timing can be used in the UI.
5. User finishes the workout.
6. Backend checks workout ownership.
7. Backend normalizes session data and calculates completed sets and total volume.
8. A session is saved only if at least one set was completed.
9. Personal-record logic runs for the saved session.
10. Session becomes visible in history/progress/summary views.

### 9.5 Review history

User can:

- Browse paginated sessions.
- Sort newest/oldest.
- Filter by date range.
- Filter by workout name.
- View a month calendar aggregated by date.
- Select a date and see matching sessions.
- Export matching sessions as CSV.

### 9.6 Goals and streaks

- User chooses a weekly target.
- Backend derives sessions completed this week.
- Current streak is derived from completed session dates.
- Goals and summaries are user-scoped.

---

## 10. Functional Requirements

| ID | Requirement | Priority | Status |
| --- | --- | --- | --- |
| AUTH-001 | Register with name/email/password | P0 | Implemented |
| AUTH-002 | Login with email/password | P0 | Implemented |
| AUTH-003 | Protect private routes and APIs | P0 | Implemented |
| AUTH-004 | Refresh access token using refresh cookie when configured | P1 | Implemented |
| AUTH-005 | Logout and clear client auth state/cookie | P0 | Implemented |
| ROUTINE-001 | Create a routine with exercises | P0 | Implemented |
| ROUTINE-002 | Edit an owned routine | P0 | Implemented |
| ROUTINE-003 | Delete an owned routine | P0 | Implemented |
| ROUTINE-004 | Duplicate an owned routine | P1 | Implemented |
| ROUTINE-005 | Add optional routine cover image | P2 | Implemented |
| SESSION-001 | Start a routine as an active session | P0 | Implemented |
| SESSION-002 | Log actual reps and weight by set | P0 | Implemented |
| SESSION-003 | Save completed session | P0 | Implemented |
| SESSION-004 | Reject zero-completion session | P0 | Implemented |
| HISTORY-001 | Paginate completed sessions | P0 | Implemented |
| HISTORY-002 | Filter by date/workout | P1 | Implemented |
| HISTORY-003 | Show month calendar summary | P1 | Implemented |
| HISTORY-004 | Export CSV | P2 | Implemented |
| GOAL-001 | Set weekly workout target | P1 | Implemented |
| GOAL-002 | Show weekly progress and streak | P1 | Implemented |
| RECORD-001 | Update personal records after session | P1 | Implemented |
| PROGRESS-001 | Search exercise-specific session progress | P1 | Implemented |
| EXERCISE-001 | Browse default exercise library | P1 | Implemented |
| EXERCISE-002 | Add custom exercise | P1 | Implemented |
| THEME-001 | Light/dark/system modes | P2 | Implemented |
| PROFILE-001 | Get/update/delete own profile by API | P2 | Backend implemented; UI incomplete |
| OAUTH-001 | OAuth authentication | Future | Not implemented |
| REMINDER-001 | Scheduled workout reminders | Future | Not implemented |

---

## 11. Page Inventory

| Route | Access | Main purpose |
| --- | --- | --- |
| `/` | Public | Landing/home |
| `/login` | Guest | Login |
| `/register` | Guest | Registration |
| `/dashboard` | Authenticated | Overview, routines, summaries, achievements |
| `/workouts/create` | Authenticated | Create routine |
| `/workouts/edit/:id` | Authenticated | Edit owned routine |
| `/workouts/session/:id` | Authenticated | Active workout execution |
| `/history` | Authenticated | History, filters, calendar, CSV |
| `/goals` | Authenticated | Weekly target and streak view |
| `/progress` | Authenticated | Exercise-specific progress |
| `/records` | Authenticated | Personal records |
| `/exercises` | Authenticated | Default/custom exercise library |
| `*` | Public | Not-found page |

---

## 12. Main Data Objects From a Product Perspective

### User
Represents identity and account ownership.

### Workout
Represents a **reusable plan/template**. It contains planned exercises and is owned by one user.

### WorkoutSession
Represents **what actually happened** during a workout. It stores actual set results and a snapshot of the workout name so history does not depend entirely on future template edits.

### Exercise
Represents reusable exercise metadata. Workoutly combines built-in/default exercise data with custom user-created exercises.

### Goal
Represents a user's weekly workout target.

### PersonalRecord
Represents a best performance derived from session data.

---

## 13. Non-Functional Requirements

| Area | Requirement / current design |
| --- | --- |
| Security | JWT authentication, bcrypt hashing, ownership checks, CORS allowlist, auth rate limiting, file type/size validation |
| Privacy | User-owned resources must always be filtered/authorized by authenticated user ID |
| Performance | Pagination limits session/workout list size; dashboard currently performs multiple API requests |
| Reliability | Central backend error handler; client loading/error/empty states; DB startup failure terminates process |
| Accessibility | Labels, focus states, ARIA status/error patterns, reduced-motion support; full accessibility audit still needed |
| Responsiveness | Multiple CSS breakpoints for mobile/tablet/desktop layouts |
| Maintainability | Clear client/server folders; some business logic is still controller-heavy |
| Portability | Docker/Docker Compose configuration and environment examples |
| Data portability | CSV export for workout sessions |
| Observability | Basic logs/health endpoint only; full metrics/tracing not implemented |

---

## 14. Success Metrics / Acceptance Criteria

A release is functionally successful when:

- A new user can register and log in.
- A logged-in user can create a workout with at least one exercise.
- A user cannot access another user's workout through API manipulation.
- A user can start a workout, complete at least one set, and save it.
- Saved data appears in history and summary views.
- Calendar data correctly groups sessions by day.
- Weekly goal/streak data is derived from the user's sessions.
- Exercise progress is generated from completed set history.
- CSV export produces session data in a usable format.
- Invalid or unauthorized actions return clear 4xx responses.
- Core flows remain usable on mobile-sized layouts.

---

## 15. Known Product Limitations

- No OAuth provider is implemented.
- No reminders/notification system is implemented.
- Profile APIs exist but no complete profile-management screen is confirmed.
- Custom exercises can be created but edit/delete flows are not present.
- Active session state is memory-only and can be lost on refresh.
- Session creation and personal-record updates are not wrapped in a MongoDB transaction.
- No idempotency protection prevents accidental duplicate session submissions.
- Cloudinary public IDs are returned but routine data primarily keeps the URL, limiting automatic image cleanup.
- Socket.IO infrastructure exists but no major user-facing realtime domain behavior is implemented.
- Frontend automated test coverage is limited compared with backend auth coverage.
- No offline-first support.

---

## 16. Future Product Direction

### Near term

- Improve frontend automated coverage.
- Add upload tests.
- Add complete profile management UI.
- Allow replacing/removing routine cover images safely.
- Add edit/delete support for custom exercises.
- Add idempotency/duplicate-session protection.
- Improve accessibility verification.

### Medium term

- Add indexes for high-volume session queries.
- Reduce dashboard request fan-out.
- Persist active-session drafts.
- Improve progress analytics.
- Add Cloudinary asset cleanup.
- Add better runtime observability.

### Optional long term

- OAuth.
- Workout reminders.
- Richer analytics.
- Mobile packaging.
- Carefully scoped coaching/recommendation features.

---

## 17. Interview Summary

A concise product explanation:

> Workoutly is a MERN workout-tracking application built around a separation between reusable workout templates and immutable-ish completed session history. Users authenticate, create routines, manually record actual set performance, and then derive history, goals, streaks, progress, and personal records from those saved sessions. The backend enforces user ownership independently of the frontend, while the system also demonstrates uploads, CSV export, Docker configuration, validation, testing, and deployment-oriented design.
