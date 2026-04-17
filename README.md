# GKIS LMS Backend (Vercel)

This folder contains a standalone Vercel serverless backend for LMS API endpoints currently used by the frontend.

## API Endpoints

- `GET /roles` -> returns role options used by `TopNav` and `Sidebar`
- `GET /health` -> basic health check
- `GET /interface` -> backend API contract/interface details

## Type Interfaces

Primary response types are defined in:

- `src/interfaces/role.ts`

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
