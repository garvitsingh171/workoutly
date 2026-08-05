# API Reference

Base URL is configured in the client with `VITE_API_BASE_URL` or `VITE_API_URL`; Vite dev also proxies `/api` to `http://localhost:5000`. Authenticated requests use:

```text
Authorization: Bearer <access-token>
```

Success responses generally use:

```json
{ "success": true, "message": "Message", "data": {} }
```

Some auth responses also duplicate `token` and `user` at the top level for frontend compatibility. Error responses use:

```json
{ "success": false, "message": "Error description" }
```

Pagination, where present, is returned as top-level `pagination`.

## Health

| Method | Path | Purpose | Auth | Response |
| --- | --- | --- | --- | --- |
| GET | `/` | Plain API status | No | Text: `Workoutly API is running...` |
| GET | `/api/health` | JSON health check | No | `{ "message": "Server is running!" }` |

## Auth

| Method | Path | Purpose | Auth | Body | Success | Errors | Source | Consumers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Register user | No, rate-limited | `name`, `email`, `password` | 201 user + token | 400 validation/duplicate | `authRoutes.js`, `authController.js` | Alternate API path; frontend uses `/api/users/register` |
| POST | `/api/auth/login` | Login | No, rate-limited | `email`, `password` | 200 token + user, optional refresh cookie | 400 validation, 401 invalid credentials | same | `Login.jsx` |
| POST | `/api/auth/refresh` | Refresh access token from cookie | No, rate-limited | Cookie `refreshToken` | 200 token + user | 401 missing/invalid cookie | same | `api.js` interceptor |
| POST | `/api/auth/logout` | Clear refresh cookie | No | None | 200 | unexpected 500 | same | `AuthContext.logout` |

Example login body:

```json
{ "email": "user@example.com", "password": "password123" }
```

## Users

| Method | Path | Purpose | Auth | Ownership | Body | Success | Errors | Source | Consumers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/users/register` | Register user | No, rate-limited | Not applicable | `name`, `email`, `password` | 201 user + token | 400 validation/duplicate | `userRoutes.js`, `authController.js` | `Register.jsx` |
| GET | `/api/users/:id` | Get current profile | Yes | `:id` must equal current user | None | 200 user | 400 invalid id, 403 other user, 404 missing | `userController.js`, `userService.js` | `Dashboard.jsx` |
| PUT | `/api/users/:id` | Update current profile | Yes | `:id` must equal current user | optional `name`, `email`, `password` | 200 safe user | 400/403/404 | same | No dedicated UI found |
| DELETE | `/api/users/:id` | Delete current user | Yes | `:id` must equal current user | None | 200 | 400/403/404 | same | No dedicated UI found |

## Workouts

Workout body:

```json
{
  "name": "Push Day",
  "duration": 45,
  "difficulty": "intermediate",
  "notes": "Warm up first.",
  "coverImage": "https://example.com/image.jpg",
  "exercises": [
    { "name": "Bench Press", "sets": 3, "reps": 8, "restSeconds": 90, "notes": "Controlled reps" }
  ]
}
```

| Method | Path | Purpose | Auth | Ownership | Query/params | Success | Errors | Source | Consumers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/workouts` | List current user's routines | Yes | Filters by `author` | `page`, `limit`; limit capped at 50 | 200 array + pagination | 401 | `workoutRoutes.js`, `workoutController.js`, `workoutService.js` | `Dashboard.jsx` |
| POST | `/api/workouts` | Create routine | Yes | New `author=req.user._id` | Body above | 201 workout | 400 validation, 401 | same | `CreateWorkout.jsx` |
| GET | `/api/workouts/:id` | Get routine | Yes | Must own workout | `id` Mongo ID | 200 workout | 400 invalid id, 403, 404 | same | `EditWorkout.jsx`, `ActiveSession.jsx` |
| PUT | `/api/workouts/:id` | Update routine | Yes | Must own workout | `id`, body above | 200 workout | 400/403/404 | same | `EditWorkout.jsx` |
| DELETE | `/api/workouts/:id` | Delete routine | Yes | Must own workout | `id` | 200 `{ id }` | 400/403/404 | same | `Dashboard.jsx` |
| POST | `/api/workouts/:id/duplicate` | Duplicate routine | Yes | Must own workout | `id` | 201 duplicated workout | 400/403/404 | same | `Dashboard.jsx` |

## Sessions And History

Create session body:

```json
{
  "workout": "64f000000000000000000000",
  "startedAt": "2026-08-05T10:00:00.000Z",
  "completedAt": "2026-08-05T10:45:00.000Z",
  "durationMinutes": 45,
  "exercises": [
    {
      "name": "Bench Press",
      "sets": [
        { "setNumber": 1, "targetReps": 8, "actualReps": 8, "weight": 60, "completed": true }
      ]
    }
  ]
}
```

| Method | Path | Purpose | Auth | Ownership | Query | Success | Errors | Source | Consumers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/sessions` | Save completed session | Yes | Workout must belong to current user; session user set to current user | None | 201 session + `newRecords` | 400 invalid/missing/no completed sets, 403 other workout, 404 workout | `sessionController.js` | `ActiveSession.jsx` |
| GET | `/api/sessions` | List history | Yes | Filters by current user | `page`, `limit`, `from`, `to`, `workoutName`, `sort` | 200 sessions + pagination | 400 bad date range | same | `History.jsx` |
| GET | `/api/sessions/calendar` | Group sessions by date | Yes | Current user | `month=YYYY-MM` optional | 200 date summaries | 400 bad month | same | `History.jsx`, `Dashboard.jsx` |
| GET | `/api/sessions/export.csv` | Export sessions as CSV | Yes | Current user | `from`, `to`, `workoutName` | 200 text/csv | 400 bad date | same | `History.jsx` |
| GET | `/api/sessions/progress` | Exercise progress | Yes | Current user | `exerciseName` required | 200 progress array | 400 missing name | same | `Progress.jsx` |
| GET | `/api/sessions/recent` | Latest 5 sessions | Yes | Current user | None | 200 sessions | 401 | same | `Dashboard.jsx` |
| GET | `/api/sessions/summary` | Dashboard session totals | Yes | Current user | None | 200 totals | 401 | same | `Dashboard.jsx` |

## Goals

| Method | Path | Purpose | Auth | Body | Success | Errors | Source | Consumers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/goals/current` | Get active goal or default | Yes | None | 200 goal/default | 401 | `goalController.js` | No direct current-goal UI found |
| PUT | `/api/goals/current` | Upsert weekly target | Yes | `{ "weeklyWorkoutTarget": 3 }` | 200 goal | 400 not integer 1-14 | same | `Goals.jsx` |
| GET | `/api/goals/summary` | Weekly progress/streak summary | Yes | None | 200 summary | 401 | same | `Dashboard.jsx`, `Goals.jsx` |

## Records

| Method | Path | Purpose | Auth | Ownership | Success | Source | Consumers |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/records` | List current user's personal records | Yes | Current user | 200 records | `recordController.js` | `Records.jsx` |
| GET | `/api/records/:exerciseName` | List records for one exercise | Yes | Current user | 200 records | same | No frontend consumer found |

## Exercises

| Method | Path | Purpose | Auth | Query/body | Success | Errors | Source | Consumers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/exercises` | List default and current user's custom exercises | Yes | `search`, `category`, `equipment` | 200 exercises | 401 | `exerciseController.js` | `Exercises.jsx`, `WorkoutBuilder.jsx`, `Dashboard.jsx` |
| POST | `/api/exercises` | Create custom exercise | Yes | `name`, `category`, `equipment`, `instructions` | 201 exercise | 400 missing/duplicate | same | `Exercises.jsx` |

## Upload

| Method | Path | Purpose | Auth | File field | Success | Errors | Source | Consumers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/upload` | Upload routine cover image to Cloudinary | Yes | `image` | 200 `{ success, url, publicId }` | 400 no file/type/size, 500 Cloudinary failure | `routes/upload.js`, `middleware/upload.js` | `ImageUpload.jsx`, `CreateWorkout.jsx` |

Allowed MIME types are JPEG, PNG, WebP, and GIF. Max size is 5MB.

## CORS And Cookies

`server/src/config/cors.js` allows `CLIENT_URL` origins plus local defaults in non-production. `credentials:true` is enabled for the refresh cookie. In production, refresh cookies use `httpOnly`, `secure:true`, and `sameSite:'strict'`.

