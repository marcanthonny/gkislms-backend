# GKIS LMS Backend (Vercel)

This folder contains a standalone Vercel serverless backend for LMS API endpoints currently used by the frontend.

## API Endpoints

- `POST /auth/login` -> returns auth token and basic user profile
- `GET /roles` -> returns role options used by `TopNav` and `Sidebar`
- `GET /health` -> basic health check
- `GET /interface` -> backend API contract/interface details
- `GET /me` -> returns current user from bearer token

## Type Interfaces

Primary response types are defined in:

- `src/interfaces/role.ts`
- `src/interfaces/auth.ts`

## Authentication (simple demo)

This project now includes a lightweight token-based authentication mechanism.

- Login endpoint: `POST /auth/login`
- Protected endpoint: `GET /me` with `Authorization: Bearer <token>`
- Token signing: HMAC SHA-256 using `AUTH_SECRET` env variable (falls back to a dev secret locally)

### Demo credentials

- `student@gkislms.local` / `student123`
- `teacher@gkislms.local` / `teacher123`
- `admin@gkislms.local` / `admin123`

### Example

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@gkislms.local\",\"password\":\"admin123\"}"
```

Then call:

```bash
curl http://localhost:3000/me -H "Authorization: Bearer <token>"
```

## Local Development

```bash
cd backend
npm install
npm run dev
```

`vercel dev` runs endpoints locally (default `http://localhost:3000`), which matches your current frontend fetch URL.

## Deploy

```bash
cd backend
npm run deploy
```
