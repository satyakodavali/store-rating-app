# Store Rating Platform

Express + PostgreSQL API and a React (Vite) client. One login for three roles: System Administrator, Normal User, Store Owner.

## Setup
1. Create a database: `createdb store_ratings`
2. Backend:
   ```
   cd backend && cp .env.example .env   # edit DATABASE_URL and JWT_SECRET
   npm install && npm run db:init && npm run dev
   ```
   `db:init` creates the tables and an admin (default `admin@example.com` / `Admin@1234`).
3. Frontend: `cd frontend && npm install && npm run dev` then open http://localhost:5173

## Workflow
- Log in as admin, add a Store Owner (Users > Add a user, role owner), then add a store with that owner's email.
- Anyone can sign up as a Normal User and rate stores from 1 to 5; ratings can be changed later.

## Design notes
- Schema: `users`, `stores` (one owner per store), `ratings` (unique per user and store, CHECK 1-5), with indexes and cascading deletes.
- Security: bcrypt hashes, JWT auth, role middleware, parameterised SQL, whitelisted sort columns, helmet, CORS, rate limiting on auth.
- Validation runs on both client and server (name 20-60, address max 400, password 8-16 with uppercase and special character, email format).
- Sorting and filtering happen server-side on every table.
