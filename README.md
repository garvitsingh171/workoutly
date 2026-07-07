# Workoutly

Workoutly is a full-stack MERN workout tracker where users can register, log in, and manage their own workouts with protected routes, ownership-based authorization, pagination, and full-stack error handling.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, React Toastify
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- Tooling: ESLint, Nodemon, Concurrently

## Project Structure

project-root/

- client/ (React frontend)
- server/ (Express backend)
- .gitignore
- README.md

## Key Features

- User registration and login
- JWT-based authentication
- Protected frontend routes
- Protected backend APIs via auth middleware
- Authorization checks for workout read/update/delete ownership
- Workout CRUD operations
- Pagination with page and limit (limit capped on backend)
- Completed workout session history
- Workout history filters and monthly calendar summary
- Weekly workout goals and streak tracking
- CSV export for completed workout sessions
- Dashboard stats from saved workouts and completed sessions
- Duplicate workout templates
- Exercise progress tracking from completed sessions
- Automatic personal record detection for max weight, reps, and volume
- Basic exercise library with default and custom exercises
- Centralized backend error handling with consistent response shape
- Frontend toast-based error feedback

## Environment Variables

Create local env files (do not commit them):

1. server/.env

Required placeholders:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_jwt_secret
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173

1. client/.env

Required placeholders:

VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

Use client/.env.example as the safe template for local client settings.

## Installation

From the project root:

1. Install root dependencies

npm install

1. Install client dependencies

cd client
npm install

1. Install server dependencies

cd ../server
npm install

## Running the App

Option A: Run both from root

npm run dev

Option B: Run separately

Terminal 1:
cd server
npm run dev

Terminal 2:
cd client
npm run dev

Client runs on [http://localhost:5173](http://localhost:5173) and server runs on [http://localhost:5000](http://localhost:5000) by default.

## API Overview

- POST /api/users/register -> register user
- POST /api/auth/register -> register user
- POST /api/auth/login -> login user and return access token
- POST /api/auth/refresh -> issue a new access token from the refresh-token cookie
- POST /api/auth/logout -> clear the refresh-token cookie
- GET /api/users/:id -> get current user profile (protected)
- POST /api/workouts -> create workout (protected)
- GET /api/workouts?page=1&limit=10 -> list workouts with pagination (protected)
- GET /api/workouts/:id -> get one workout (protected + ownership)
- PUT /api/workouts/:id -> update workout (protected + ownership)
- DELETE /api/workouts/:id -> delete workout (protected + ownership)
- POST /api/workouts/:id/duplicate -> duplicate one owned workout template (protected + ownership)
- POST /api/sessions -> save a completed workout session (protected + ownership)
- GET /api/sessions?page=1&limit=10 -> list completed sessions, latest first (protected)
- GET /api/sessions/calendar?month=2026-07 -> grouped session counts by date (protected)
- GET /api/sessions/export.csv -> export completed sessions as CSV (protected)
- GET /api/sessions/recent -> list latest 5 completed sessions (protected)
- GET /api/sessions/summary -> get dashboard session stats (protected)
- GET /api/sessions/progress?exerciseName=Bench%20Press -> get exercise progress history (protected)
- GET /api/goals/current -> get current weekly workout goal (protected)
- PUT /api/goals/current -> update current weekly workout goal (protected)
- GET /api/goals/summary -> get weekly progress and streak summary (protected)
- GET /api/records -> list personal records for current user (protected)
- GET /api/records/:exerciseName -> list personal records for one exercise (protected)
- GET /api/exercises -> list default and custom exercises, with optional search/category/equipment filters (protected)
- POST /api/exercises -> add a custom exercise (protected)

Access tokens are sent by the frontend in the Authorization header and stored in localStorage with the user object. Refresh-token endpoints still exist, but login no longer depends on refresh-token configuration.

## Exercise Library Seed

Default exercises are available from the API even before seeding. To store the defaults in MongoDB manually, run:

cd server
npm run seed:exercises

## Demo Data Seed

To create realistic local/demo data for dashboards, workout history, progress charts, routines, streaks, records, and empty states, run from the repo root:

npm run seed

The demo seed is guarded for development/test/demo/local environments only. It refreshes only stable `@demo.workoutly.com` accounts and their owned data, then recreates demo users, routines, completed sessions, goals, and personal records around the current date by default. Set `SEED_BASE_DATE=YYYY-MM-DD` to pin a specific demo date.

If you intentionally want to seed the production Atlas database with demo users, run:

SEED_PRODUCTION_CONFIRM=workoutly-prod npm run seed -- --allow-production

This production override still refreshes only stable `@demo.workoutly.com` accounts and their owned data.

Recommended login:

- Email: casey.consistent@demo.workoutly.com
- Password: DemoPass123!

Empty-state login:

- Email: erin.empty@demo.workoutly.com
- Password: DemoPass123!

See [docs/DEMO_SEEDING.md](docs/DEMO_SEEDING.md) for all demo users, safety rules, generated data, and supported schema limits.

## Error Handling Contract

Backend error responses follow:

{
  "success": false,
  "message": "Error description"
}

Frontend extracts message and shows user feedback via toast notifications.

## Manual Integration Checklist

Use this sequence to verify end-to-end behavior:

1. Register a new user
2. Login and receive token
3. Refresh page and confirm session persistence
4. Access protected dashboard
5. Create workout
6. View paginated workouts
7. Edit owned workout
8. Duplicate an owned workout
9. Create or edit a workout using exercise library suggestions
10. Start a workout session, complete some sets, and finish it
11. Confirm personal records are created
12. Open Records and verify max weight, reps, and volume records
13. Open Progress and search an exercise from the completed session
14. Try another user and confirm progress and records are private
15. Open History and confirm completed sessions appear
16. Test History date filters and calendar highlights
17. Open Goals, set a weekly target, and confirm progress updates
18. Export History CSV and confirm session data is correct
19. Run `cd server && npm run seed:exercises` if you want to persist default exercises in MongoDB
20. Confirm dashboard stats update from saved session data
21. Delete owned workout
22. Refresh the page after login and confirm the session is restored
23. Check browser devtools Application/Cookies for refreshToken and confirm it is httpOnly
24. Trigger unauthorized access and verify clear error
25. Logout and confirm protected routes are blocked

## Submission Notes

Include in ZIP:

- client/
- server/
- .gitignore
- README.md

Do not include:

- .env files
- node_modules
- build artifacts
- files containing secrets

## Docker Hub Workflow (Module 4.15)

Use these steps after building your images locally.

1. Login

docker login

2. Tag images with your Docker Hub username

docker tag workoutly-client:latest your-dockerhub-username/workoutly-client:latest
docker tag workoutly-server:latest your-dockerhub-username/workoutly-server:latest

3. Push images

docker push your-dockerhub-username/workoutly-client:latest
docker push your-dockerhub-username/workoutly-server:latest

4. Verify pull

docker rmi your-dockerhub-username/workoutly-client:latest
docker rmi your-dockerhub-username/workoutly-server:latest
docker pull your-dockerhub-username/workoutly-client:latest
docker pull your-dockerhub-username/workoutly-server:latest

Optional version tag:

docker tag your-dockerhub-username/workoutly-client:latest your-dockerhub-username/workoutly-client:v1.0.0
docker push your-dockerhub-username/workoutly-client:v1.0.0

## Production Compose (Pull from Docker Hub)

This repo now includes docker-compose.prod.yml that uses Docker Hub images instead of local build contexts.

PowerShell example:

$env:DOCKERHUB_USERNAME="your-dockerhub-username"
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

Optional image tags:

$env:CLIENT_IMAGE_TAG="latest"
$env:SERVER_IMAGE_TAG="latest"

This split keeps local development fast with docker-compose.yml while making deployment reproducible with prebuilt images in docker-compose.prod.yml.
