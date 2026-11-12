# SKIDS SK System

A youth information and management system for the Sangguniang Kabataan of
Barangay Masagui. The React frontend connects to an Express API, which reads and
writes PostgreSQL data through **Supabase's HTTPS Data API**.

Follow [INSTRUCTION.md](INSTRUCTION.md) for the complete Supabase, Google sign-in,
Cloudinary, Render, and Vercel setup.

## Features and access

| Module | Youth | Manager | Chairperson |
| --- | --- | --- | --- |
| Personal profile | Own profile | Own profile | Own profile |
| Announcements, events, budgets, documents | View available records | Manage | Manage |
| Messages | Own conversations | View and reply | View and reply |
| Youth management and history | No access | Manage youth; view history | Manage youth; view history |
| Manager accounts | No access | No access | Assign and remove access |

Public registration creates a youth account. Google sign-in grants chairperson
access to addresses in `ADMIN_EMAILS`, retains assigned manager access, and gives
other Google accounts youth access.

## Stack

- React 19, Vite 8, Tailwind CSS, React Router, Axios
- Express 5 and the official `@supabase/supabase-js` client
- Supabase PostgreSQL through REST queries and database-function RPCs
- Google Identity Services, scrypt password hashes, application JWTs
- Signed Cloudinary uploads and jsPDF exports
- Vercel frontend and Render API deployment configuration

## Local setup

### 1. Install dependencies

Use Node.js 24 and run commands in the repository root:

```bash
npm ci
```

On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

### 2. Configure Supabase

Create or select your Supabase project. Copy the HTTPS **Project URL** and a
**secret API key** for the backend. A legacy `service_role` key is also supported.
Supabase secret keys have elevated permissions and belong only on the server.
[Supabase API key guidance](https://supabase.com/docs/guides/getting-started/api-keys)

Create the app schema:

1. Open [server/supabase/setup.sql](server/supabase/setup.sql).
2. Copy the complete script.
3. In Supabase, open **SQL Editor > New query**, paste, and run it.
4. Enable the project's **Data API** and include `public` in its exposed schemas.

The script enables Row Level Security and removes table/function access from
`anon` and `authenticated`. Express enforces application roles, and its backend
secret key accesses the tables. Keep the secret out of the browser.
[Supabase Data API security](https://supabase.com/docs/guides/api/securing-your-api)

The script is transactional and can rerun against the matching SKIDS schema
without deleting existing rows. It creates or updates tables, functions,
triggers, and permissions. It does not import existing MongoDB data.

### 3. Set environment variables

Copy `.env.example` to `.env` and `.env.local.example` to `.env.local`
if these files do not already exist, then edit their values.

Backend `.env`:

```env
NODE_ENV=development
PORT=5000
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=YOUR_BACKEND_SECRET_KEY
JWT_SECRET=YOUR_LONG_RANDOM_APPLICATION_SECRET
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
ADMIN_EMAILS=chairperson@example.com
ADMIN_BOOTSTRAP_NAME=SK Chairperson
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
CLOUDINARY_UPLOAD_FOLDER=skids
```

You can use `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_SECRET_KEY` for a
legacy backend key. A publishable/anon key cannot replace the backend secret.
The application does not use `DATABASE_URL`, PostgreSQL poolers, or Sequelize.

Frontend `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

The Google client IDs must match. All `VITE_*` values are public browser
configuration. The frontend calls Express and does not need Supabase keys.

### 4. Check Supabase and start the app

```bash
npm run db:check
```

Expected result: `Supabase Data API connected` and `Supabase schema is ready`.

The old `npm run db:migrate` command now performs the same setup check and prints
the SQL Editor instructions. It does not execute arbitrary SQL over the Data API.
Schema installation is the one-time SQL Editor step above.

Run the API and frontend in separate terminals:

```bash
npm run dev:server
npm run dev
```

- Frontend: `http://localhost:5173`
- Google sign-in: `http://localhost:5173/google-login`
- API: `http://localhost:5000/api`
- Health: `http://localhost:5000/api/health`

## Data model and transactions

| Table | Purpose |
| --- | --- |
| `users` | Accounts, roles, password hashes, profile JSON |
| `youth_profiles` | Youth records and linked accounts |
| `announcements` | Announcements and publication status |
| `events` | Event schedules and locations |
| `budget_reports` | Decimal amounts, categories, approval state |
| `documents` | Document metadata and attachments |
| `messages` | Youth conversations |
| `message_replies` | Ordered replies; cascade on conversation deletion |
| `activity_logs` | Actions, actors, resources, request metadata |

UUID IDs retain the API's `_id` response fields; the frontend also normalizes them
to `id`. PostgreSQL stores profile/upload metadata as JSONB and money as
`NUMERIC(14,2)`.

Registration, Google account linking, user-profile synchronization, replies,
manager removal, and password bootstrap use database functions called through
Supabase RPC. Each function executes its changes within one database transaction.
Only the backend role can execute these functions.
[Supabase database functions](https://supabase.com/docs/guides/database/functions)

Normal user queries explicitly omit `passwordHash`. RPC account responses and
public authentication responses also omit it.

## Google, officers, and uploads

Configure a Google **Web application** OAuth client with exact authorized
frontend origins. This app uses Google's popup credential callback, and verifies
the returned ID token in Express. Configure Google Cloud as described in
[INSTRUCTION.md](INSTRUCTION.md); Supabase Auth users/providers are not used by
this authentication flow.

- Google sign-in route: `/google-login`
- Officer password login route: `/officer-login`
- Chairperson emails: `ADMIN_EMAILS`
- Manager assignment: chairperson's **Manager Accounts** screen

For optional initial chairperson password setup, privately set
`ADMIN_BOOTSTRAP_PASSWORD` to a unique password of at least 12 characters and
restart the API. After verifying login and the bootstrap success log, remove the
temporary variable and restart. Existing password hashes are not overwritten.

Uploads go directly from the browser to Cloudinary using an authenticated
signature from `POST /api/uploads/signature`. PostgreSQL stores attachment
metadata. Configure PDF/ZIP delivery in Cloudinary if uploaded PDFs cannot open.

## Deployment

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fmoradayuri-source%2Fskids)

The button deploys the Express API from `main` using [render.yaml](render.yaml).
It selects the Free plan in Singapore, uses Node.js 24, generates `JWT_SECRET`,
and sets the chairperson email to `masaguisi.skids@gmail.com`. Future pushes to
`main` automatically redeploy the API. The React frontend stays on Vercel.

During Blueprint setup, fill in these seven values from your service accounts:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Existing Supabase project's HTTPS URL |
| `SUPABASE_SECRET_KEY` | Backend secret key, kept in Render only |
| `GOOGLE_CLIENT_ID` | Web client ID shared with the frontend |
| `CORS_ORIGINS` | Exact Vercel production origin, without a path or trailing slash |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

If the frontend is not deployed yet, use `http://localhost:5173` for
`CORS_ORIGINS` temporarily. The API can start and pass its health check; replace
that value with the exact Vercel origin when the frontend is online.

Use the same Supabase project that already contains the application schema and
admin account. When starting with a new project, install the SQL first and use
the optional password bootstrap described above. The Blueprint does not prompt
for a bootstrap password or store an admin password in Git.

After Render reports the service is live, open its `/api/health` endpoint, then
set Vercel's `VITE_API_URL` to the actual Render URL plus `/api` and redeploy the
frontend. Add the exact Vercel origin to the Google Web client's authorized
JavaScript origins. Free Render services sleep after 15 idle minutes; the next
request can take about a minute to wake the API.

For manual service creation instead of the Blueprint:

1. Install `server/supabase/setup.sql` in the production Supabase project.
2. Deploy the Vite frontend to Vercel and save its stable production origin.
3. Create the Render Node web service using the repository root:
   - Build: `npm ci --omit=dev`
   - Start: `npm run start:server`
   - Health check: `/api/health`
4. In Render, set `NODE_ENV=production`, `SUPABASE_URL`,
   `SUPABASE_SECRET_KEY`, `JWT_SECRET` (at least 32 characters),
   `GOOGLE_CLIENT_ID`, `ADMIN_EMAILS`, all Cloudinary credentials, and
   `CORS_ORIGINS` to the exact frontend origin. Render supplies `PORT`.
5. Add the frontend origin to Google's Web client's authorized origins.
6. Set Vercel's `VITE_API_URL` to `https://YOUR-API.onrender.com/api` and
   `VITE_GOOGLE_CLIENT_ID` to the matching client ID, then redeploy.

The included `render.yaml` and `vercel.json` match this configuration.
`CLIENT_URL` is an optional CORS fallback; `CORS_ORIGINS` takes precedence.

## Commands and checks

| Command | Purpose |
| --- | --- |
| `npm run dev` | Frontend development |
| `npm run dev:server` | API with watch mode |
| `npm run db:check` | Verify Supabase API credentials and installed schema |
| `npm run db:migrate` | Compatibility alias for the schema check |
| `npm test` | Isolated Supabase SDK, SQL, and API regression checks |
| `npm run lint` | Lint frontend, backend, and tests |
| `npm run build` | Production frontend build |
| `npm run preview` | Preview built frontend |
| `npm run start:server` | Start the API |

Tests use the official Supabase SDK against a local PostgREST-compatible HTTP
fixture backed by PGlite PostgreSQL. They apply the real setup SQL and check
CRUD, foreign keys, account/profile rollback, role boundaries, replies, history,
and public-role permission denial. Google token verification is stubbed.
Tests do not use your real Supabase project; live Google login, Cloudinary, and
hosted Data API behavior need deployment verification.

## Remaining scan findings

- Password recovery has a UI but no `api.auth.forgotPassword` implementation or
  reset-email backend.
- `/api/health` is a process check. Use `npm run db:check` or a database-backed
  action to verify Supabase readiness.
- Deleting document/budget metadata does not delete Cloudinary assets.
- Check current production dependencies with `npm audit --omit=dev` and review
  dependency updates before public deployment.
