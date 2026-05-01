# Production Environment Variables

-## Required for Server

- `MONGO_URI` - MongoDB Atlas production connection string. Example:
  `mongodb+srv://prod-admin:YOUR_PASSWORD@cluster0.abcde.mongodb.net/creator-platform-prod?retryWrites=true&w=majority`
- `JWT_SECRET` - Strong random secret (minimum 32 characters)
- `NODE_ENV` - Set to `production`
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `FRONTEND_URL` - URL of deployed frontend (e.g., https://yourapp.vercel.app)

## Required for Client

- `VITE_API_BASE_URL` - URL of deployed backend (e.g., https://yourapp.onrender.com). Set this to the public URL where your backend API is hosted. Example values:

- Local development: `http://localhost:5000`
- Render deployment: `https://your-backend.onrender.com`

Use the backend URL (no trailing slash) so the client can call the API endpoints like `${VITE_API_BASE_URL}/api/auth`.

## Security Notes

- Never commit these values to Git.
- Store secrets in your deployment platform's environment settings (Render, Vercel, etc.).
- `DATABASE_URL` contains the database password — treat as highly sensitive.

## Local files

- Create `server/.env` or set the equivalent environment variables in your deployment platform (recommended). If you prefer a local production file for brief testing, `server/.env.production` may be used, but do NOT commit it.

## Quick checklist

- Create production DB: `creator-platform-prod`
- Create production DB user: `prod-admin` (save generated password)
- Add IP access: `0.0.0.0/0` (for cloud deployments; less secure)
- Copy connection string and replace `<password>` placeholder
- Save the connection string as `MONGO_URI` in a server environment variable (e.g., `server/.env` for local tests or the platform's env settings). If your deployment platform requires a different variable name (for example `DATABASE_URL`), provide that mapping in the platform — but the app expects `MONGO_URI` by default.

## Example `server/.env.production`

```
MONGO_URI=mongodb+srv://prod-admin:YOUR_PASSWORD@cluster0.abcde.mongodb.net/creator-platform-prod?retryWrites=true&w=majority
NODE_ENV=production
JWT_SECRET=your-strong-jwt-secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
```

Keep this document updated when adding new environment variables required by the app.
