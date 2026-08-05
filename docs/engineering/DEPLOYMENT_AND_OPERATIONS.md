# Deployment And Operations

Deployment status was not verified through external dashboards. This document describes repository configuration.

## Development Architecture

Local non-Docker development:

- Root `npm run dev` uses `concurrently` to start `npm run dev --prefix server` and `npm run dev --prefix client`.
- Server runs `nodemon server.js` on `PORT || 5000`.
- Client runs Vite on port `5173` with `/api` proxy to `http://localhost:5000`.
- MongoDB comes from `MONGO_URI`.

Docker development:

- `docker-compose.yml` starts MongoDB, server, and client.
- Server uses `./server/.env` but Compose overrides `MONGO_URI` to `mongodb://mongo:27017/workoutly`.
- Client container serves built assets through Nginx on host port `3000`.

## Production Architecture

Repository-supported production shapes:

- Static client hosted by Vercel with `client/vercel.json` rewrites.
- Static client container served by Nginx with SPA fallback and static asset caching.
- Node server container started with `node server.js`.
- MongoDB may be Compose MongoDB or a managed URI such as Atlas.
- Cloudinary is used for image uploads when env vars are configured.

Actual production URLs and release status are not confirmed from the repository.

## Commands

| Context | Command | Evidence |
| --- | --- | --- |
| Install all from root | `npm install`, plus client/server installs as needed | `package.json`, README |
| Run both locally | `npm run dev` | root `package.json` |
| Run client | `npm run dev --prefix client` | root/client scripts |
| Run server | `npm run dev --prefix server` | root/server scripts |
| Build client | `npm run build --prefix client` | client scripts |
| Start server production | `npm start --prefix server` | server scripts |
| Backend tests | `npm test --prefix server` or root `npm test` | root/server scripts |
| Frontend tests | `npm test --prefix client` | client scripts |
| Docker local | `docker compose up` | `docker-compose.yml` |
| Docker prod images | `docker compose -f docker-compose.prod.yml pull` | README and compose prod |

## Environment Variables

Use placeholders only; never commit real secrets.

| Variable | Application | Purpose | Required | Sensitive | Example format |
| --- | --- | --- | --- | --- | --- |
| `PORT` | Server | HTTP port | No | No | `5000` |
| `NODE_ENV` | Server/scripts | Environment mode and cookie/security behavior | Recommended | No | `development` or `production` |
| `CLIENT_URL` | Server | CORS allowlist | Yes for production | No | `https://your-client.example` |
| `MONGO_URI` | Server/scripts | MongoDB connection | Yes | Yes | `mongodb+srv://user:<password>@host/workoutly` |
| `MONGO_URI_TEST` | Server tests | Test DB connection | Test only | Yes | `mongodb://127.0.0.1:27017/workoutly_test` |
| `MONGODB_URI_TEST` | Server tests | Alternate test DB connection | Test only | Yes | same as above |
| `JWT_SECRET` | Server | Access-token signing | Yes | Yes | long random string |
| `JWT_EXPIRE` | Server | Access-token expiry | No | No | `15m`, `7d` |
| `JWT_REFRESH_SECRET` | Server | Refresh-token signing | Optional but needed for refresh | Yes | long random string |
| `JWT_REFRESH_EXPIRE` | Server | Refresh cookie/token expiry | No | No | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Server | Cloudinary account | Required for upload | Somewhat | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Server | Cloudinary API key | Required for upload | Yes | key value |
| `CLOUDINARY_API_SECRET` | Server | Cloudinary secret | Required for upload | Yes | secret value |
| `VITE_API_BASE_URL` | Client | Public backend URL | Yes outside proxy | No | `https://your-api.example` |
| `VITE_SOCKET_URL` | Client | Socket.IO URL | If socket used | No | `https://your-api.example` |
| `DOCKERHUB_USERNAME` | Compose prod | Docker image namespace | For prod compose | No | `yourname` |
| `SERVER_IMAGE_TAG` | Compose prod | Server image tag | No | No | `latest` |
| `CLIENT_IMAGE_TAG` | Compose prod | Client image tag | No | No | `latest` |
| `SEED_BASE_DATE` | Seed script | Pin demo data date | No | No | `2026-08-01` |
| `SEED_PRODUCTION_CONFIRM` | Seed scripts | Explicit production seed guard | Only for override | Yes-ish | `workoutly-prod` |

## CORS Setup

Set `CLIENT_URL` to the exact deployed frontend origin. Multiple origins can be comma-separated. Localhost defaults are included in non-production. Browser clients need `credentials:true` for refresh cookies.

## SPA Route Handling

Vercel uses:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

Nginx uses `try_files $uri $uri/ /index.html`.

## Health Checks And Logging

`GET /api/health` returns `{ "message": "Server is running!" }`. Backend logs MongoDB connection host, server URL, Socket.IO readiness, socket connect/disconnect, and normalized API errors.

## Failure Diagnosis

| Symptom | Likely cause | Check |
| --- | --- | --- |
| Client cannot call API | Wrong `VITE_API_BASE_URL` or CORS `CLIENT_URL` | Browser network tab and server CORS logs |
| Login works but refresh fails | Missing `JWT_REFRESH_SECRET` or cookie blocked | Server env and browser cookies |
| Upload fails | Missing Cloudinary env or invalid file | Server env and upload response |
| Docker server cannot connect to DB | `MONGO_URI` wrong outside Compose network | Compose environment override |
| SPA route 404 on refresh | Missing rewrite/fallback | `vercel.json` or Nginx config |
| Tests hit wrong DB | Missing test URI | `server/tests/auth.test.js` env defaults |

## Rollback And Limitations

No automated rollback workflow was found. Docker image tags can support manual rollback if versioned. Vercel/hosting rollback depends on external platform features not confirmed here. Free-tier cold starts may affect backend response times if hosted on services like Render, but no specific provider deployment was verified.

## Production Release Checklist

- Build client successfully.
- Start server with production env.
- Confirm `GET /api/health`.
- Confirm deployed frontend can load and refresh nested routes.
- Confirm CORS from frontend origin.
- Register/login/logout/refresh manually.
- Create, edit, duplicate, delete routine.
- Upload safe image if Cloudinary is configured.
- Complete session and verify history, records, progress, goals, dashboard.
- Confirm second user cannot access first user data.
- Export CSV.
- Review logs for sensitive data.
- Run backend and frontend tests.
- Update docs.

