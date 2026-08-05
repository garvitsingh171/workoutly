# Contributing Guide

## Prerequisites

- Node.js compatible with the project dependencies.
- npm.
- MongoDB local instance, Docker MongoDB, or a managed MongoDB URI.
- Cloudinary account only if testing image upload.
- Docker optional for container workflows.

## Repository Setup

Install dependencies using the existing package files:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Do not commit `node_modules`, build output, or `.env` files.

## Environment Configuration

Copy from examples and use placeholder-safe values:

- `server/.env.example` -> `server/.env`
- `client/.env.example` -> `client/.env`

Required local basics are `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `VITE_API_BASE_URL`. Add Cloudinary variables when testing uploads.

## Startup

Root:

```bash
npm run dev
```

Separate terminals:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

Docker:

```bash
docker compose up
```

## Database And Seed Data

Default exercises are available in memory through `defaultExercises.js`. To persist defaults:

```bash
npm --prefix server run seed:exercises
```

Demo seed:

```bash
npm run seed
```

Read [Demo Seeding](../DEMO_SEEDING.md) before using production override options.

## Code Organization Expectations

- Frontend route mapping belongs in `client/src/App.jsx`.
- Shared auth/theme state belongs in `client/src/context`.
- API calls should use `client/src/services/api.js`.
- Reusable UI primitives belong in `client/src/components/ui`.
- Workout form behavior belongs in `WorkoutBuilder` and `utils`.
- Backend route groups belong in `server/src/routes`.
- Request handling belongs in controllers; shared business logic should move into services when it grows.
- Mongoose schemas belong in `server/src/models`.
- Validation should be server-side first; client validation is for UX.

## Naming Conventions Inferred From Repository

- React components use PascalCase file names.
- Page components live in `client/src/pages`.
- Backend files use domain names such as `workoutController.js`, `workoutRoutes.js`, `Workout.js`.
- API paths are plural domain groups: `/api/workouts`, `/api/sessions`, `/api/exercises`.
- Status/feedback components use clear class names such as `empty-state`, `alert`, and `loading-spinner`.

## Route Development Workflow

1. Define or update the Mongoose model if data shape changes.
2. Add validation rules or explicit manual validation.
3. Add controller/service logic.
4. Register the route in the domain route file and `app.js` if it is a new group.
5. Enforce `protect` and ownership checks before database writes/reads.
6. Add API tests for success, validation failure, unauthenticated access, and cross-user access.
7. Wire the frontend through `api.js`.
8. Add loading, error, and empty states.
9. Update [API Reference](../architecture/API_REFERENCE.md) and feature docs.

## Model-Change Workflow

Schema changes should include model validation, API validation, seed updates if demo data depends on the field, tests, and documentation updates in [Database Design](../architecture/DATABASE_DESIGN.md). Be careful with embedded arrays and deletion/cascade behavior.

## UI-Change Workflow

Follow existing CSS variables and UI primitives. Check desktop and mobile breakpoints. Keep buttons disabled during submits, show inline errors for form fields, and use toasts for request-level feedback. Avoid adding new dependencies unless a strong product need exists.

## Documentation Expectations

Update docs when changing routes, models, env vars, auth behavior, deployment config, security assumptions, test coverage, or product workflows.

## Manual Testing Expectations

At minimum, manually test auth, protected route redirects, routine create/edit/delete/duplicate, active session completion, history/calendar, goals, records/progress, exercise library, theme toggle, logout, and cross-user ownership.

## Pull Request Checklist

- Code is scoped to the requested change.
- No secrets or local env files are committed.
- Server-side validation and ownership checks are present.
- Loading/error/empty UI is handled.
- Existing tests pass, and new tests cover risky behavior.
- Responsive behavior is reviewed.
- Documentation is updated.
- Deployment/env changes are documented.

