# INSTRUCTION: Supabase API and service setup

This guide configures SKIDS with **Supabase's HTTPS Data API**, Google sign-in,
Cloudinary uploads, Render, and Vercel. It matches the application as of
November 2, 2026.

## 1. What you need

| Service | Used for |
| --- | --- |
| Supabase | PostgreSQL tables and database-function APIs |
| Google Cloud | Google sign-in Web client ID |
| Cloudinary | Image/document storage |
| Render | Express backend |
| Vercel | React frontend |

The frontend calls Express. Express calls Supabase over HTTPS with
`@supabase/supabase-js`, checks account roles, and handles JWT authentication.

Your backend uses:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=YOUR_BACKEND_SECRET_KEY
```

Use your actual values from Supabase. No `DATABASE_URL`, database password,
pooler host, or PostgreSQL driver configuration is required.

Install Node.js 24 with npm, and open a terminal in the
repository root. Windows examples use `npm.cmd` to avoid PowerShell script-policy
issues.

## 2. Get your Supabase Project URL and backend API key

1. Open the [Supabase dashboard](https://supabase.com/dashboard) and your project.
2. Find the project's **Project URL** in its API/Data API settings or Connect
   panel. It starts with `https://`.
3. Open the project's **API Keys** settings.
4. Copy or create a **secret key** for the SKIDS backend.
5. Save the Project URL as `SUPABASE_URL` and the secret as
   `SUPABASE_SECRET_KEY` in the backend `.env`.

New server secret keys start with `sb_secret_`. A legacy `service_role` key
can instead be stored as `SUPABASE_SERVICE_ROLE_KEY`. A publishable/anon key is
for lower-privilege clients and cannot perform this backend's operations.
[Supabase API key documentation](https://supabase.com/docs/guides/getting-started/api-keys)

Keep the server key in local backend `.env` and Render. Never put it into
`.env.local`, a `VITE_*` variable, browser code, Git, or a screenshot.

The current browser does not need `SUPABASE_PUBLISHABLE_KEY` or
`SUPABASE_JWKS_URL`. Express uses your application's `JWT_SECRET` for its
sessions; it does not use Supabase Auth sessions.

## 3. Install the tables and database APIs in SQL Editor

The Data API can query tables and call installed functions, but installing the
schema is a one-time SQL Editor step.

### A. Open and copy the setup file

1. Open `server/supabase/setup.sql` in your code editor.
2. Click inside the file, press **Ctrl+A**, then **Ctrl+C**.
3. Copy the complete file, including its `BEGIN;` and `COMMIT;`.

### B. Run it in Supabase

1. Open your Supabase project dashboard.
2. Click **SQL Editor** in the left sidebar.
3. Click **New query** or the **+** button for a new SQL query.
4. Paste the complete script.
5. Click **Run**.
6. Wait for a success result; a script creating functions/tables may return no
   result rows.

The script creates these nine application tables:

```text
users               youth_profiles      announcements
events              budget_reports      documents
messages            message_replies     activity_logs
```

It also installs `skids_*` database functions for atomic account/profile changes,
replies, history searches, and schema checks. The script can rerun against the
matching SKIDS schema without deleting existing rows. It does not transfer old
MongoDB records.

### C. Enable the Data API

Open the project's **Data API** settings/integration, turn **Enable Data API**
on, and ensure the `public` schema is exposed. This application needs that API.

The setup SQL enables Row Level Security, revokes access from `anon` and
`authenticated`, and grants the backend `service_role` access. There are no
public read/write policies for these application tables. Express checks each
user's JWT and permissions before making privileged Supabase requests.
[Supabase Data API security](https://supabase.com/docs/guides/api/securing-your-api)

If Supabase displays a setup error, keep its error text so the failing statement
can be identified. Do not delete existing tables to make the script pass.

## 4. Configure Google sign-in

### A. Branding and audience

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create/select a project, for example `SKIDS`.
3. Open **Google Auth Platform > Branding**.
4. Enter the app name, support email, and developer contact details.
5. Under **Audience**, choose **External** for normal Google accounts.
6. Review Testing/Production status before public launch. Google has an
   exception to usual test-user restrictions for basic identity-only sign-in.
   [Google audience guidance](https://support.google.com/cloud/answer/15549945?hl=en)

### B. Create the Web client

1. Open **Google Auth Platform > Clients > Create client**.
2. Choose **Web application**.
3. Add these **Authorized JavaScript origins**:

```text
http://localhost
http://localhost:5173
http://localhost:4173
```

4. Later, add your exact production Vercel origin, including `https://`, with
   no path or trailing slash.
5. Leave **Authorized redirect URIs** empty for the app's JavaScript popup flow.
6. Save and copy the **Client ID** ending in `.apps.googleusercontent.com`.

These settings follow [Google's sign-in setup guide](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).

Put the same client ID in:

- Backend `.env`: `GOOGLE_CLIENT_ID`
- Frontend `.env.local`: `VITE_GOOGLE_CLIENT_ID`

This app verifies Google's ID token in Express and stores application accounts
in `public.users`. Enabling a Google provider in Supabase Auth does not configure
this existing login flow. A Google client secret and extra Gmail/Drive/Calendar
APIs are not used.

### C. Set chairperson and manager access

Set `ADMIN_EMAILS` to the chairperson's exact Google account email. You can use
comma-separated addresses if needed.

| Sign-in account | Assigned role |
| --- | --- |
| Listed in `ADMIN_EMAILS` | Admin/chairperson |
| Assigned in Manager Accounts | Manager |
| Other Google account | Youth |

The **Google login screen is `/google-login`**. The screen at
`/officer-login` is for email/password login.

## 5. Configure Cloudinary

1. Open the [Cloudinary console](https://console.cloudinary.com/).
2. Create/select your product environment.
3. Open its **API Keys** settings.
4. Save the cloud name, API key, and API secret in the backend:

```env
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
CLOUDINARY_UPLOAD_FOLDER=skids
```

The browser gets a signed upload request from Express and uploads directly to
Cloudinary. No unsigned upload preset is needed.
[Cloudinary upload documentation](https://cloudinary.com/documentation/upload_images)

For PDF delivery on accounts where it is restricted, open the product
environment's **Security** settings and enable **Allow delivery of PDF and ZIP
files**.
[Cloudinary delivery guidance](https://cloudinary.com/documentation/image_delivery_options)

## 6. Complete the local environment and start

Install dependencies and create example copies only when files do not exist:

```powershell
npm.cmd ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
if (-not (Test-Path .env.local)) { Copy-Item .env.local.example .env.local }
```

Generate an application JWT secret:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

### Backend .env

```env
NODE_ENV=development
PORT=5000

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=YOUR_BACKEND_SECRET_KEY

JWT_SECRET=PASTE_YOUR_GENERATED_RANDOM_SECRET
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
ADMIN_EMAILS=YOUR_CHAIRPERSON_GOOGLE_EMAIL
ADMIN_BOOTSTRAP_NAME=SK Chairperson
CORS_ORIGINS=http://localhost:5173,http://localhost:4173

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
CLOUDINARY_UPLOAD_FOLDER=skids
```

Use the legacy `SUPABASE_SERVICE_ROLE_KEY` instead of the secret-key variable
only if your project uses that older key type.

### Frontend .env.local

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

### Verify the installed schema

```powershell
npm.cmd run db:check
```

Expected success messages:

```text
Supabase Data API connected
Supabase schema is ready
```

`npm run db:migrate` is retained as an alias for this check. It prints the
SQL Editor setup instructions and verifies installation; it does not run SQL
through a database connection.

### Start both development servers

Terminal 1:

```powershell
npm.cmd run dev:server
```

Terminal 2:

```powershell
npm.cmd run dev
```

Open `http://localhost:5173/google-login` and sign in with the chairperson
account. Verify a database write, such as creating an announcement. Restart the
API after backend environment changes and Vite after frontend changes.

## 7. Host the frontend on Vercel

1. Commit/push source changes to the Git repository used for deployment.
2. In Vercel, choose **Add New > Project** and import the repository.
3. Select **Vite** and the repository root.
4. Use build command `npm run build` and output directory `dist`.
5. Set `VITE_GOOGLE_CLIENT_ID`, then make an initial deployment to obtain the
   production hostname.
6. Add that exact origin to Google's authorized JavaScript origins.

The initial frontend may load before the API is configured in steps 8 and 9.
The repository's `vercel.json` handles Vite builds and SPA route refreshes.
[Vercel Vite guide](https://vercel.com/docs/frameworks/frontend/vite)

## 8. Host the API on Render

### Recommended: deploy the Blueprint

Open [Deploy SKIDS to Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fmoradayuri-source%2Fskids)
after the latest `render.yaml` is pushed to `main`. Review the Free Node web
service in Singapore and enter the Supabase, Google, Cloudinary, and
`CORS_ORIGINS` values listed in the README's Deployment section. Render generates
the JWT secret and uses `masaguisi.skids@gmail.com` as the chairperson email.
Use the existing Supabase project to retain its admin account and password.
If the frontend is not deployed yet, temporarily use `http://localhost:5173`
for `CORS_ORIGINS`, then replace it with the Vercel origin before frontend use.

Deploy the Blueprint and wait for the service to become live. Copy its actual
public URL, check `/api/health`, and continue to step 9. Each later push to
`main` automatically deploys the API again. Existing Blueprint services need
new secret variables added manually in Render; `sync: false` prompts appear
only during initial creation.

### Alternative: create the web service manually

1. Make sure the production Supabase project has the setup SQL installed and
   its Data API enabled.
2. In Render, choose **New > Web Service** and connect the repository.
3. Use these settings:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Root directory | Repository root; leave subdirectory empty |
| Build command | `npm ci --omit=dev` |
| Start command | `npm run start:server` |
| Health check | `/api/health` |

These values match the included `render.yaml`.
[Render Express guide](https://render.com/docs/deploy-node-express-app)

4. Add backend environment variables:

```env
NODE_ENV=production
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=YOUR_BACKEND_SECRET_KEY

JWT_SECRET=YOUR_PRODUCTION_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
ADMIN_EMAILS=masaguisi.skids@gmail.com
ADMIN_BOOTSTRAP_NAME=SK Masaguisi

CORS_ORIGINS=https://YOUR-ACTUAL-FRONTEND.vercel.app
CLIENT_URL=https://YOUR-ACTUAL-FRONTEND.vercel.app

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
CLOUDINARY_UPLOAD_FOLDER=skids
```

Render supplies `PORT`. `CORS_ORIGINS` accepts exact comma-separated origins
and takes precedence over the optional `CLIENT_URL` fallback.

5. Deploy and check for `Supabase Data API connected` and
   `SKIDS API listening on port ...`.
6. Save your actual `https://YOUR-API.onrender.com` origin.

The API checks the installed schema on startup. Apply future schema SQL through
SQL Editor before deploying code that depends on it.

## 9. Finish the frontend and account setup

In Vercel **Settings > Environment Variables**, set these for **Production**:

```env
VITE_API_URL=https://YOUR-ACTUAL-API.onrender.com/api
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Redeploy after saving; environment changes apply to new deployments.
[Vercel environment guide](https://vercel.com/docs/environment-variables)

Check the three destinations:

| Setting | Value |
| --- | --- |
| Google authorized JavaScript origin | Exact Vercel frontend origin |
| Render `CORS_ORIGINS` | Same frontend origin |
| Vercel `VITE_API_URL` | Render API origin plus `/api` |

Sign in as chairperson through `/google-login`. In **Manager Accounts**, add
managers' real Google emails. Managers also sign in through `/google-login`.

For optional chairperson password login at `/officer-login`, privately set
`ADMIN_BOOTSTRAP_PASSWORD` on Render to a unique password of at least
12 characters, redeploy, verify the bootstrap log and password login, then
remove the variable and redeploy. Bootstrap does not replace existing passwords.

## 10. Verification and troubleshooting

- [ ] Setup SQL finished successfully.
- [ ] Data API is enabled and exposes `public`.
- [ ] Server secret stays in the backend.
- [ ] `npm.cmd run db:check` succeeds.
- [ ] Google client IDs and production origins match.
- [ ] Chairperson, manager, and youth permissions behave correctly.
- [ ] Registration, profile changes, messages, and admin records persist.
- [ ] Uploads and PDF delivery work.
- [ ] Vercel nested-route refreshes work.
- [ ] Temporary bootstrap password is removed.

| Problem | Check |
| --- | --- |
| `SUPABASE_URL is required` | Set the backend HTTPS Project URL in root `.env` or Render. |
| Missing/incorrect backend key | Use `SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY`, not a publishable/anon key. |
| Schema not installed | Run the entire `server/supabase/setup.sql` file in Supabase SQL Editor; then run `npm.cmd run db:check`. |
| Function not found immediately after setup | Wait for the schema cache to reload, check the correct project, and retry. |
| Data API request denied/unreachable | Verify the Project URL, key, enabled Data API, and exposed `public` schema. |
| Old `DATABASE_URL` or pooler error | Update to this code and reinstall dependencies; the current backend uses the HTTPS Data API. |
| Google origin/client mismatch | Check exact frontend origins and matching backend/frontend client IDs, then restart/redeploy. |
| Wrong Google role | Check `ADMIN_EMAILS` and manager assignments, then sign out and back in. |
| Production calls localhost | Set Vercel's production `VITE_API_URL` and redeploy. |
| CORS error | Set Render's `CORS_ORIGINS` to the exact frontend origin without a trailing slash. |
| Cloudinary/PDF issue | Check matching environment credentials and PDF/ZIP delivery settings. |
| Forgot Password sends nothing | Reset-email backend is not implemented by this application. |

See [README.md](README.md) for architecture, commands, and test scope.
