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
- Centralized backend error handling with consistent response shape
- Frontend toast-based error feedback

## Environment Variables

Create local env files (do not commit them):

1. server/.env

Required placeholders:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=[http://localhost:5173](http://localhost:5173)

1. client/.env

Required placeholders:

VITE_API_URL=[http://localhost:5000](http://localhost:5000)

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
- POST /api/auth/login -> login user and return JWT
- GET /api/users/:id -> get current user profile (protected)
- POST /api/workouts -> create workout (protected)
- GET /api/workouts?page=1&limit=10 -> list workouts with pagination (protected)
- GET /api/workouts/:id -> get one workout (protected + ownership)
- PUT /api/workouts/:id -> update workout (protected + ownership)
- DELETE /api/workouts/:id -> delete workout (protected + ownership)

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
8. Delete owned workout
9. Trigger unauthorized access and verify clear error
10. Logout and confirm protected routes are blocked

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
