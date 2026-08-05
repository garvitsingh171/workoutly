# Product Roadmap

This roadmap is based on code gaps, comments, seed docs, and current product direction. It does not promise release dates.

## Current Stable Capabilities

| Capability | Evidence | Notes |
| --- | --- | --- |
| Email/password registration and login | `Register.jsx`, `Login.jsx`, `authService.js` | JWT access token plus optional refresh cookie. |
| Protected user-owned routine CRUD | `WorkoutBuilder.jsx`, `workoutService.js`, `Workout.js` | Ownership checks are implemented for read/update/delete/duplicate. |
| Manual session completion | `ActiveSession.jsx`, `sessionController.js` | Stores completed sets, volume, duration, and session timestamps. |
| Workout history and calendar | `History.jsx`, `sessionController.js` | Supports filters, pagination, month summary, selected-date panel, and CSV export. |
| Goals, streaks, records, progress | `Goals.jsx`, `Records.jsx`, `Progress.jsx` | Derived from saved sessions and goals. |
| Exercise library | `Exercises.jsx`, `defaultExercises.js` | Includes in-memory defaults and user custom exercises. |
| Routine cover image upload | `ImageUpload.jsx`, `upload.js` | Cloudinary upload returns URL; URL is stored on routine. |
| Demo seed data | `server/scripts/seedDemo.js`, `docs/DEMO_SEEDING.md` | Guarded demo data for local/demo assessment. |

## Immediate Stabilization

| Item | Problem | Proposed outcome | Dependencies | Risk | Priority | Evidence | Confirmation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Verify runtime documentation | Docs are repository-backed but not runtime-tested in this task | Run manual checklist and update docs with verified runtime status | Local env, MongoDB, Cloudinary credentials | Docs could describe code paths that fail due to env/runtime issues | High | `README.md` manual checklist | Recommendation |
| Add route-level frontend coverage | Frontend tests cover only header/login | Tests for protected route redirects, builder validation, history empty/error states | Existing Jest setup | UI regressions could pass tests | High | `Header.test.jsx`, `Login.test.jsx` | Recommendation |
| Add backend tests for upload | Upload endpoint is security-sensitive and not represented in test names | Validate file type/size/auth and Cloudinary failure behavior with mocks | Jest/Supertest, Cloudinary mock | File upload bugs affect user workflow and security | High | `upload.js`, `middleware/upload.js` | Recommendation |
| Document or remove unused `ConnectionTest` | Component exists but no import was found | Either wire it intentionally for local diagnostics or remove later | Product decision | Dead code confuses contributors | Medium | `ConnectionTest.jsx`, `rg` import search | Recommendation |
| Correct template remnants | `client/README.md`, React/Vite SVG assets remain | Replace template readme with Workoutly client notes or remove unused assets later | Documentation decision | Stale docs distract reviewers | Medium | `client/README.md`, `assets/react.svg`, `assets/vite.svg` | Recommendation |

## Near-Term Improvements

| Item | Problem | Proposed outcome | Dependencies | Risk | Priority | Evidence | Confirmation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Profile settings page | Backend supports profile update/delete but UI was not found | Add protected profile page for name/email/password changes | Existing user APIs | Ownership and password validation need careful testing | Medium | `userController.js`, `userService.js` | Recommendation |
| Edit routine cover image | Create supports upload; edit preserves cover without replacement UI | Allow changing or removing cover image in edit flow | Upload component reuse | Orphan Cloudinary assets if public IDs are not tracked | Medium | `EditWorkout.jsx`, `CreateWorkout.jsx` | Recommendation |
| Exercise edit/delete | Custom exercises can be created but not managed | Add update/delete for user-created exercises only | New routes/controllers/tests | Ownership bugs could leak custom exercises | Medium | `Exercise.js`, `exerciseController.js` | Recommendation |
| Duplicate-session prevention | Same workout can be saved repeatedly without guard | Define whether duplicate completion is allowed; add idempotency or confirmation if needed | Product decision | Accidental duplicate history and records | Medium | `sessionController.createSession` | Recommendation |
| Pagination/index improvements | Sessions and dashboard queries may grow unbounded | Add indexes on common user/date query patterns and pagination for progress/records if needed | DB migration planning | Query performance degradation at larger data volume | Medium | `WorkoutSession.find({ user })`, `PersonalRecord.index` | Recommendation |
| Accessibility review | Semantic labels exist but no automated a11y tests | Add manual/audit checklist and fix focus/contrast/keyboard issues found | Browser and tooling | Assessment feedback risk | Medium | CSS focus states, labels, no a11y tests | Recommendation |

## Future Product Ideas

| Item | Problem | Proposed outcome | Dependencies | Risk | Priority | Evidence | Confirmation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Reminder system | No scheduling or notifications exist | Optional workout reminders via email/browser notifications | New model, job runner, permissions | Scope creep and privacy concerns | Low | No reminder code found | Recommendation |
| OAuth login | Only email/password auth exists | Optional Google/GitHub sign-in | OAuth provider setup | More auth complexity | Low | No OAuth code found | Recommendation |
| Offline session draft | Active session state can be lost on refresh | Persist in-progress session draft locally | Local storage strategy | Data consistency and stale drafts | Medium | `ActiveSession.jsx` local state only | Recommendation |
| Advanced analytics | Progress search is per exercise | Add trends, volume charts, and routine adherence | Query optimization | Dashboard complexity | Low | `Progress.jsx`, `sessions/progress` | Recommendation |
| Cloudinary cleanup | Public ID is not stored on workout | Store image public ID and delete old assets when replaced | Schema change | Orphaned assets and billing | Medium | `upload.js`, `Workout.coverImage` | Recommendation |

## Explicitly Out Of Scope For Current Product

| Idea | Reason |
| --- | --- |
| Medical diagnosis or rehabilitation advice | No clinical validation, medical roles, or healthcare workflows exist. |
| Full automated personal trainer | Workoutly is manual and template-based. |
| Nutrition tracking | No nutrition models, routes, or pages exist. |
| Social fitness network | No follows, feeds, messaging, or public profiles exist. |
| Premium/admin roles | Only normal authenticated users are implemented. |

