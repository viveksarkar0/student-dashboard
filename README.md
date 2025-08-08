## FSD Assignment — Full‑Stack Dashboard (Next.js + Fastify)

Loom walkthrough: https://www.loom.com/share/dcf9309e2f7a49a58e48fc8e080c2603?sid=9e44abe7-20df-444f-acd2-7a97ee1ec432

### Overview

This repository contains a full‑stack web app with:
- **Client**: Next.js App Router UI (TailwindCSS, shadcn primitives) for login/register, dashboard analytics, and profile management.
- **Server**: Fastify API with JWT auth (httpOnly cookies), MongoDB via Mongoose, file uploads for avatars, and basic RBAC.

Key features
- **Email/password auth** with secure JWT cookie storage
- **Dashboard** metrics (total users, last 7 days), sign‑up trends, role breakdown, recent users
- **Profile** view/update with avatar upload (multipart)
- **Admin endpoints** for listing and updating users

### Repository structure

```
fsd-assignment/
  client/   # Next.js 15 app (App Router)
  server/   # Fastify 4 API + MongoDB (Mongoose)
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (recommended 20+)
- pnpm (or npm/yarn) — examples below use pnpm
- MongoDB instance (local or hosted). Defaults to `mongodb://localhost:27017/fsd-assignment` if not provided.

### 1) Server setup (API)

Create server environment file `server/.env.development`:

```env
# Network
PORT=4000
HOST=0.0.0.0

# JWT & cookies
JWT_SECRET=dev_jwt_secret
COOKIE_NAME=token

# CORS (comma-separated list)
ALLOWED_ORIGINS=http://localhost:3000

# Database
MONGO_URL=mongodb://localhost:27017/fsd-assignment
```

Install and run the server:

```bash
cd server
pnpm install
pnpm dev
# Server runs on http://localhost:4000
```

Notes
- In production, use HTTPS and set `sameSite=none` and `secure=true` (handled automatically when `NODE_ENV=production`).
- Set a strong `JWT_SECRET`.
- Ensure `ALLOWED_ORIGINS` contains the client’s origin to avoid CORS failures.

### 2) Client setup (Web)

Create client environment file `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Install and run the client:

```bash
cd client
pnpm install
pnpm dev
# Client runs on http://localhost:3000
```

Login & Register
- Visit `http://localhost:3000/auth/register` to create an account, or `http://localhost:3000/auth/login` to sign in.
- After login, you’ll be redirected to `/dashboard`.

Build & run (production)
```bash
# Server
cd server && pnpm build && node dist/index.js

# Client
cd client && pnpm build && pnpm start
```

---

## API Reference (Server)

Base URL: `http://localhost:4000`

### Auth — `/v1/auth`
- **POST** `/register`
  - Body: `{ firstName?: string, lastName?: string, email: string, password: string }`
  - Sets httpOnly JWT cookie and returns `{ message, token, user }`
- **POST** `/login`
  - Body: `{ email: string, password: string }`
  - Sets httpOnly JWT cookie and returns `{ message, token, user }`
- **GET** `/refresh` (auth required)
  - Issues a new token cookie, returns `{ message, token }`
- **POST** `/logout`
  - Clears cookie, returns `{ message }`

### Users — `/v1/users`
- **GET** `/me` (auth)
  - Returns `{ user }`
- **PUT** `/me` (auth)
  - Body: `{ firstName?, lastName?, bio? }`
  - Returns `{ message, user }`
- **POST** `/me/avatar` (auth, multipart)
  - Form field: `avatar` (png/jpg/jpeg/webp)
  - Returns `{ message, url, user }`
- **GET** `/admin/users` (admin)
  - Returns `{ users }`
- **GET** `/` (admin)
  - Query: `page?`, `limit?`, `role?`, `q?`
  - Returns `{ items, total, page, limit, pages }`
- **PATCH** `/:id` (admin)
  - Body: `{ role?: "admin"|"teacher"|"user", status?: boolean }`
  - Returns `{ user }`

Debug
- **GET** `/debug` (auth) → Validate JWT and echo payload
- **GET** `/debug-db` → Basic DB connectivity check

### Dashboard — `/v1/dashboard`
- **GET** `/summary` (auth)
  - Query: `from?` (ISO), `to?` (ISO), `role?`, `q?`
  - Returns `{ summary: { totalUsers, last7Days } }`
- **GET** `/trends` (auth)
  - Query: `days?` (number) or `from?/to?` (ISO), `role?`, `q?`
  - Returns `{ trends: Array<{ date: string, count: number }> }`
- **GET** `/roles` (auth)
  - Query: `from?`, `to?`, `q?`
  - Returns `{ roles: { admin: number, teacher: number, user: number } }`
- **GET** `/recent-users` (auth)
  - Returns `{ users: Array<{ _id, firstName, lastName, email, avatar, createdAt }> }`

Auth & RBAC
- JWT stored in **httpOnly cookie** (`COOKIE_NAME`, default `token`).
- `server.authenticate` verifies token and normalizes `request.user` to `{ id, email, role }`.
- `server.authorize([roles])` ensures caller’s role is allowed.

Uploads
- Files saved under `server/uploads/` and served statically at `/uploads/*`.

Errors
- All errors are normalized to `{ message }` with appropriate status codes.

---

## Client (Next.js) Overview

Routes
- `/` → redirects to `/dashboard`
- `/auth/login`, `/auth/register`
- `/dashboard` → filters, metrics cards, charts, recent activity
- `/profile` → profile form + avatar upload

Integration details
- API base URL from `NEXT_PUBLIC_API_URL`.
- Requests use `credentials: "include"` to send/receive the JWT cookie.
- Dashboard fetches summaries and trends in parallel and maps to charts.

Tech stack
- Next.js 15 (App Router), React 19, TailwindCSS 4
- shadcn/ui primitives, Radix components, Chart.js/Recharts

---

## Troubleshooting
- **CORS error**: Ensure `ALLOWED_ORIGINS` includes the client origin and client uses the same origin you open in the browser.
- **Cookie not set**: In production behind HTTPS, cookies require `secure` and `sameSite=none`. Use a real domain + TLS.
- **Mongo connection**: Verify `MONGO_URL` is reachable. Local default is `mongodb://localhost:27017/fsd-assignment`.
- **401/Forbidden**: Confirm you’re logged in and calling admin endpoints with a user whose `role` is `admin`.

---

## Scripts quick reference

Server
```bash
cd server
pnpm dev     # start dev server
pnpm build   # compile TypeScript
pnpm start   # run compiled build
```

Client
```bash
cd client
pnpm dev     # next dev
pnpm build   # next build
pnpm start   # next start
```

---

## License
For assignment use. Replace or add a license as needed.


