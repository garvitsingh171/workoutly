# Postman Collection Guide

## Setup

1. Install Postman desktop app from https://www.postman.com/downloads/.
2. Import collection: docs/Creator-Platform-API.postman_collection.json.
3. Import environment: docs/Local-Development.postman_environment.json.
4. Select Local Development environment in Postman (top-right dropdown).

## Important Endpoint Mapping

This assignment wording uses Posts endpoints. This backend uses Workouts endpoints.

- Get All Posts -> GET /api/workouts
- Create Post -> POST /api/workouts
- Update Post -> PUT /api/workouts/:id
- Delete Post -> DELETE /api/workouts/:id

Collection folder names remain Health/Auth/Posts to match assignment rubric.

## Usage Order

1. Start backend server:
   - From project root: docker-compose up
   - Or backend only: cd server && npm run dev
2. Run Health Check request.
3. Run Register User request (uses unique generated email each time).
4. Manually copy the registered email into environment variable loginEmail.
5. Run Login User request (token auto-saves to authToken).
6. Run Get All Posts.
7. Run Create Post (this auto-saves workoutId for next steps).
8. Run Update Post.
9. Run Delete Post.

## Variables

- {{baseURL}}: API server URL, default http://localhost:5000
- {{authToken}}: JWT token auto-saved by Login User tests
- {{loginEmail}}: Email used for login request body
- {{loginPassword}}: Password used for login request body
- {{workoutId}}: Workout document id used by update/delete requests
- {{userId}}: Saved from auth responses for reference

## Test Assertions Included

- Health Check: status code, message, response time
- Register User: status code, success flag, user fields, response time
- Login User: status code, response structure, response time, token save
- Get All Posts: status code, success/data/pagination structure, workoutId auto-save
- Create/Update/Delete Post: status and response structure checks

## Troubleshooting

1. Could not get any response:
   - Ensure backend is running on port 5000.
   - Confirm CORS/baseURL are correct.

2. 401 Unauthorized:
   - Run Login User again.
   - Check authToken value in environment.
   - Verify Authorization header is Bearer {{authToken}}.

3. Login fails after Register:
   - Register generates a random email every run.
   - Copy registered email to loginEmail variable before Login.

4. Update/Delete fails with 404:
   - Run Create Post first to set workoutId.
   - Or set workoutId manually from Get All Posts response.

## Submission Files

Ensure these files are committed:

- docs/Creator-Platform-API.postman_collection.json
- docs/Local-Development.postman_environment.json
- docs/POSTMAN_GUIDE.md
