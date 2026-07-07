# Demo Seed Data

Workoutly includes a guarded demo seed script for local development and test databases.

## Run

From the repo root:

```bash
npm run seed
```

Equivalent commands:

```bash
npm run seed:demo
npm run db:seed
npm run seed --prefix server
```

Preview the planned volume without writing to MongoDB:

```bash
npm run seed -- --dry-run
```

The script reads `server/.env` and uses `MONGO_URI` unless `NODE_ENV=test`, where it uses `MONGO_URI_TEST` or `MONGODB_URI_TEST`.

## Base Date

By default the data is generated around the current date, so dashboards, streaks, and calendar summaries stay fresh when the seed is rerun.

To regenerate around another date:

```bash
SEED_BASE_DATE=2026-08-01 npm run seed
```

Use `YYYY-MM-DD` format.

## Demo Logins

Every demo user uses this password:

```text
DemoPass123!
```

Recommended rich dashboard user:

```text
casey.consistent@demo.workoutly.com
```

Other users:

```text
bella.beginner@demo.workoutly.com
max.muscle@demo.workoutly.com
maya.momentum@demo.workoutly.com
alex.advanced@demo.workoutly.com
ivy.inconsistent@demo.workoutly.com
erin.empty@demo.workoutly.com
```

`erin.empty@demo.workoutly.com` intentionally has no routines or sessions so empty states remain easy to verify.

## What Gets Seeded

- 7 stable demo users/personas.
- 65 default exercises across the schema-supported categories and equipment values.
- 14 reusable routine definitions and 16 user-owned routine copies spread across demo users.
- 100+ completed workout sessions across the last 90 days.
- Casey's account includes a realistic Monday upper strength, Tuesday Zone 2 run, Wednesday mobility/core, Thursday lower strength, Saturday conditioning pattern across roughly the last four weeks, with rest days and a few missed sessions.
- Sessions in the last 30 days, current week, yesterday, and today where the generated calendar supports it.
- 500+ embedded set logs with completed and partial sessions.
- Active weekly goals for each demo user.
- Personal records rebuilt from seeded sessions.
- Routine notes include suggested training days and upcoming dates for the next 14 days.

## Safety

The seed script refuses to run when:

- `NODE_ENV=production`.
- `NODE_ENV` is outside `development`, `test`, `demo`, or `local`.
- The MongoDB URI or connected database name looks like production.

If you intentionally want to seed the production Atlas database with demo users, use the explicit override:

```bash
SEED_PRODUCTION_CONFIRM=workoutly-prod npm run seed -- --allow-production
```

PowerShell:

```powershell
$env:SEED_PRODUCTION_CONFIRM="workoutly-prod"; npm run seed -- --allow-production
```

This still refreshes only stable `@demo.workoutly.com` users and their owned data. It does not delete normal production users.

On each run, the script refreshes only data owned by stable `@demo.workoutly.com` accounts:

- demo users
- their workouts
- their sessions
- their goals
- their personal records
- their custom exercises, if any

It does not delete non-demo users or non-demo user data.

## Schema Limits

The current schema does not have first-class fields/models for:

- scheduled future workout instances
- skipped workouts
- achievements or badges
- calories burned
- perceived intensity
- exercise difficulty
- exercise images/icons
- separate biceps/triceps/glutes/mobility muscle groups

For now, achievements are derived in the dashboard UI from sessions and goals, personal records are stored in `PersonalRecord`, and routine schedule/upcoming dates are stored in workout notes.
